package com.lilifashion.module.sale.service;

import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.sale.dto.SaleDto;
import com.lilifashion.module.sale.dto.SaleRequest;
import com.lilifashion.module.sale.entity.Sale;
import com.lilifashion.module.sale.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<SaleDto> getAll() {
        return saleRepository.findAll().stream().map(SaleDto::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleDto getById(Long id) {
        return SaleDto.from(saleRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Sale")));
    }

    @Transactional(readOnly = true)
    public List<SaleDto> getActiveSales() {
        return saleRepository.findActiveSales(LocalDateTime.now()).stream()
                .map(SaleDto::from).collect(Collectors.toList());
    }

    @Transactional
    public SaleDto create(SaleRequest req) {
        Sale sale = Sale.builder()
                .name(req.getName())
                .discountPercent(req.getDiscountPercent())
                .couponCode(req.getCouponCode())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .status(req.getStatus() != null ? Sale.SaleStatus.valueOf(req.getStatus().toUpperCase()) : Sale.SaleStatus.DRAFT)
                .build();

        if (req.getProductIds() != null && !req.getProductIds().isEmpty()) {
            List<Long> ids = req.getProductIds();
            List<Product> products = productRepository.findAllById((Iterable<Long>) ids);
            sale.setProducts(products);
        }

        return SaleDto.from(saleRepository.save(sale));
    }

    @Transactional
    public SaleDto update(Long id, SaleRequest req) {
        Sale sale = saleRepository.findById(id).orElseThrow(() -> AppException.notFound("Sale"));

        if (req.getName() != null) sale.setName(req.getName());
        if (req.getDiscountPercent() != null) sale.setDiscountPercent(req.getDiscountPercent());
        if (req.getCouponCode() != null) sale.setCouponCode(req.getCouponCode());
        if (req.getStartTime() != null) sale.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) sale.setEndTime(req.getEndTime());
        if (req.getStatus() != null) sale.setStatus(Sale.SaleStatus.valueOf(req.getStatus().toUpperCase()));
        if (req.getProductIds() != null) {
            List<Long> ids = req.getProductIds();
            sale.setProducts(productRepository.findAllById((Iterable<Long>) ids));
        }

        return SaleDto.from(saleRepository.save(sale));
    }

    @Transactional
    public void delete(Long id) {
        saleRepository.deleteById(id);
    }
}
