package com.lilifashion.module.sale.repository;

import com.lilifashion.module.sale.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    @Query("SELECT s FROM Sale s WHERE s.status = 'ACTIVE' AND (s.startTime IS NULL OR s.startTime <= :now) AND (s.endTime IS NULL OR s.endTime >= :now)")
    List<Sale> findActiveSales(@Param("now") LocalDateTime now);

    Optional<Sale> findByCouponCode(String couponCode);
}
