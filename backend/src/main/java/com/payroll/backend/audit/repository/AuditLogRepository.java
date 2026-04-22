package com.payroll.backend.audit.repository;

import com.payroll.backend.audit.model.AuditLog;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @NonNull
    Page<AuditLog> findAllByOrderByCreatedAtDesc(@NonNull Pageable pageable);
    @NonNull
    Page<AuditLog> findByEntityTypeAndEntityId(@NonNull String entityType, @NonNull Long entityId, @NonNull Pageable pageable);
}