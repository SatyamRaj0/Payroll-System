package com.payroll.backend.audit.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;

    private String entityType;
    private Long entityId;
    private String performedBy;

    @Column(length = 1000)
    private String details;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}