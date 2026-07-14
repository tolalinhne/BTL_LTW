package com.lilifashion.module.rbac.repository;

import com.lilifashion.module.rbac.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    Optional<Permission> findByKey(String key);
    boolean existsByKey(String key);
    List<Permission> findByKeyIn(List<String> keys);
}
