package com.lilifashion.module.cart.service;

import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.cart.entity.Cart;
import com.lilifashion.module.cart.entity.CartItem;
import com.lilifashion.module.cart.repository.CartRepository;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.entity.ProductVariant;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.product.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional
    public Cart getCart(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = Cart.builder().user(user).build();
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public Cart addItem(User user, Long productId, Long variantId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> AppException.notFound("Sản phẩm"));

        ProductVariant variant = null;
        if (variantId != null) {
            variant = variantRepository.findById(variantId)
                    .orElseThrow(() -> AppException.notFound("Phiên bản sản phẩm"));

            if (variant.getStock() < quantity) {
                throw AppException.badRequest("Sản phẩm không đủ tồn kho (còn " + variant.getStock() + ")");
            }
        }

        Cart cart = getCart(user);

        // Check if item already exists
        ProductVariant finalVariant = variant;
        CartItem existing = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId)
                        && (finalVariant == null || (i.getVariant() != null && i.getVariant().getId().equals(finalVariant.getId()))))
                .findFirst().orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(quantity)
                    .priceSnapshot(product.getPrice())
                    .build();
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateItem(User user, Long itemId, int quantity) {
        Cart cart = getCart(user);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst().orElseThrow(() -> AppException.notFound("Cart item"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeItem(User user, Long itemId) {
        Cart cart = getCart(user);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }
}
