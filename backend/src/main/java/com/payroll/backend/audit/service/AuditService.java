package com.payroll.backend.audit.service;

import com.payroll.backend.audit.model.AuditLog;
import com.payroll.backend.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepo;

    @SuppressWarnings("null")
    public void log(String action, String entityType, Long entityId, String details) {
        String currentUser = getCurrentUser();
        try {
            AuditLog logEntry = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .performedBy(currentUser)
                .details(details)
                .createdAt(java.time.LocalDateTime.now())
                .build();
            auditLogRepo.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", e.getMessage());
        }
    }

    private String getCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) return auth.getName();
        } catch (Exception ignored) {}
        return "SYSTEM";
    }
}