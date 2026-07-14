package com.lilifashion.module.order.service;

import com.lilifashion.common.dto.PagedResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.cart.entity.Cart;
import com.lilifashion.module.cart.entity.CartItem;
import com.lilifashion.module.cart.repository.CartRepository;
import com.lilifashion.module.order.dto.OrderDto;
import com.lilifashion.module.order.dto.OrderRequest;
import com.lilifashion.module.order.dto.StatusUpdateRequest;
import com.lilifashion.module.order.entity.Order;
import com.lilifashion.module.order.entity.Order.OrderStatus;
import com.lilifashion.module.order.entity.OrderItem;
import com.lilifashion.module.order.repository.OrderRepository;
import com.lilifashion.module.product.entity.ProductVariant;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderDto checkout(User user, OrderRequest request) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> AppException.badRequest("Giỏ hàng trống"));

        if (cart.getItems().isEmpty()) {
            throw AppException.badRequest("Giỏ hàng của bạn đang trống");
        }

        BigDecimal total = BigDecimal.ZERO;

        boolean isBankPayment = "bank".equalsIgnoreCase(request.getPaymentMethod())
                || "BANK_TRANSFER".equalsIgnoreCase(request.getPaymentMethod());

        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : user.getName())
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : user.getPhone())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "COD")
                .note(request.getNote())
                .status(OrderStatus.PENDING)
                .paymentExpiredAt(isBankPayment ? LocalDateTime.now().plusMinutes(30) : null)
                .build();

        for (CartItem cartItem : cart.getItems()) {
            // Decrease stock
            if (cartItem.getVariant() != null) {
                ProductVariant variant = variantRepository.findById(cartItem.getVariant().getId())
                        .orElseThrow(() -> AppException.badRequest("Sản phẩm không còn tồn tại"));
                if (variant.getStock() < cartItem.getQuantity()) {
                    throw AppException.badRequest("Sản phẩm '" + cartItem.getProduct().getName()
                            + "' không đủ tồn kho");
                }
                variant.setStock(variant.getStock() - cartItem.getQuantity());
                variantRepository.save(variant);

                // Cập nhật soldCount của Product và save về DB
                com.lilifashion.module.product.entity.Product product = cartItem.getProduct();
                product.setSoldCount((product.getSoldCount() == null ? 0 : product.getSoldCount()) + cartItem.getQuantity());
                productRepository.save(product);
            } // end if (cartItem.getVariant() != null)

            BigDecimal itemPrice = cartItem.getPriceSnapshot() != null
                    ? cartItem.getPriceSnapshot()
                    : cartItem.getProduct().getPrice();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(cartItem.getProduct().getId())
                    .productName(cartItem.getProduct().getName())
                    .productImage(cartItem.getProduct().getImageUrl())
                    .variantId(cartItem.getVariant() != null ? cartItem.getVariant().getId() : null)
                    .size(cartItem.getVariant() != null ? cartItem.getVariant().getSize() : "")
                    .color(cartItem.getVariant() != null ? cartItem.getVariant().getColor() : "")
                    .price(itemPrice)
                    .quantity(cartItem.getQuantity())
                    .build();

            order.getItems().add(orderItem);
            total = total.add(itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);

        // Generate orderCode = "LILI" + id (sau khi save để có ID)
        saved.setOrderCode("LILI" + saved.getId());
        saved = orderRepository.save(saved);

        // Clear cart
        cart.getItems().clear();
        cartRepository.save(cart);

        return OrderDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDto> getMyOrders(User user, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Order> result = orderRepository.findByUserId(user.getId(), pageable);
        return PagedResponse.of(
                result.getContent().stream().map(OrderDto::from).collect(Collectors.toList()),
                result.getTotalElements(), page, limit);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> AppException.notFound("Đơn hàng"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw AppException.forbidden("Bạn không có quyền xem đơn hàng này");
        }
        return OrderDto.from(order);
    }

    @Transactional
    public OrderDto cancelOrder(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> AppException.notFound("Đơn hàng"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw AppException.forbidden("Bạn không có quyền hủy đơn hàng này");
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw AppException.badRequest("Chỉ có thể hủy đơn hàng ở trạng thái Chờ xử lý hoặc Đã xác nhận");
        }
        order.setStatus(OrderStatus.CANCELLED);
        restoreStock(order);
        return OrderDto.from(orderRepository.save(order));
    }

    // ─── Admin/Staff ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PagedResponse<OrderDto> getAllOrders(int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Page<Order> result = orderRepository.findAll(pageable);
        return PagedResponse.of(
                result.getContent().stream().map(OrderDto::from).collect(Collectors.toList()),
                result.getTotalElements(), page, limit);
    }

    @Transactional
    public OrderDto updateStatus(Long orderId, StatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> AppException.notFound("Đơn hàng"));

        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());

        // Validate status transitions
        validateStatusTransition(order.getStatus(), newStatus);

        if (newStatus == OrderStatus.CANCELLED || newStatus == OrderStatus.REFUNDED) {
            restoreStock(order);
        }

        order.setStatus(newStatus);
        return OrderDto.from(orderRepository.save(order));
    }

    /**
     * Xác nhận thanh toán từ SePay webhook.
     * Tìm đơn hàng theo orderCode và cập nhật trạng thái CONFIRMED.
     */
    @Transactional
    public boolean confirmPaymentByOrderCode(String orderCode, BigDecimal transferAmount) {
        return orderRepository.findByOrderCode(orderCode).map(order -> {
            if (order.getStatus() != OrderStatus.PENDING) {
                log.info("[SePay] Order {} đã ở trạng thái {}, bỏ qua.", orderCode, order.getStatus());
                return true; // idempotent
            }
            // Kiểm tra số tiền (cho phép sai lệch tối đa 1000đ phòng phí ngân hàng)
            BigDecimal diff = order.getTotal().subtract(transferAmount).abs();
            if (diff.compareTo(BigDecimal.valueOf(1000)) > 0) {
                log.warn("[SePay] Order {} số tiền không khớp: expected={}, received={}",
                        orderCode, order.getTotal(), transferAmount);
                return false;
            }
            order.setStatus(OrderStatus.CONFIRMED);
            order.setPaymentExpiredAt(null); // xoá hạn chót khi đã thanh toán
            orderRepository.save(order);
            log.info("[SePay] Đã xác nhận thanh toán đơn hàng {}", orderCode);
            return true;
        }).orElse(false);
    }

    /**
     * Scheduler: Mỗi phút kiểm tra và tự động hủy đơn hàng BANK quá hạn 30 phút chưa thanh toán.
     */
    @Scheduled(fixedDelay = 60_000) // chạy mỗi 60 giây
    @Transactional
    public void autoCancelExpiredBankOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> expiredOrders = orderRepository
                .findByStatusAndPaymentMethodAndPaymentExpiredAtBefore(
                        OrderStatus.PENDING, "BANK", now);

        if (expiredOrders.isEmpty()) return;

        log.info("[Scheduler] Tự động hủy {} đơn hàng chuyển khoản quá hạn.", expiredOrders.size());
        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.CANCELLED);
            restoreStock(order);
            orderRepository.save(order);
            log.info("[Scheduler] Đã hủy đơn hàng {} (hết hạn lúc {})", order.getOrderCode(), order.getPaymentExpiredAt());
        }
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.PROCESSING
                    || next == OrderStatus.CONFIRMED
                    || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.CONFIRMED
                    || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.SHIPPING
                    || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.DELIVERED;
            case DELIVERED -> next == OrderStatus.REFUNDED;
            default -> false;
        };
        if (!valid) {
            throw AppException.badRequest(
                    "Không thể chuyển từ trạng thái " + current + " sang " + next);
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getVariantId() != null) {
                variantRepository.findById(item.getVariantId())
                        .ifPresent(variant -> {
                            variant.setStock(variant.getStock() + item.getQuantity());
                            variantRepository.save(variant);
                        });
            }
            productRepository.findById(item.getProductId())
                    .ifPresent(product -> {
                        int currentSoldCount = product.getSoldCount() == null ? 0 : product.getSoldCount();
                        product.setSoldCount(Math.max(0, currentSoldCount - item.getQuantity()));
                        productRepository.save(product);
                    });
        }
    }
}
