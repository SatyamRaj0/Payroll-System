package com.payroll.backend.audit.controller;

import com.payroll.backend.audit.model.AuditLog;
import com.payroll.backend.audit.repository.AuditLogRepository;
import com.payroll.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@Tag(name = "Audit Logs")
public class AuditController {

    private final AuditLogRepository auditLogRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLog> logs = auditLogRepo
            .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(logs, "Audit logs fetched"));
    }

    @GetMapping("/entity")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getByEntity(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AuditLog> logs = auditLogRepo
            .findByEntityTypeAndEntityId(entityType, entityId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(logs, "Entity audit logs fetched"));
    }
}