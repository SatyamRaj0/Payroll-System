package com.payroll.backend.payroll.model;

import com.payroll.backend.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll",
    uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "period"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PayrollRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    private String period;
    private BigDecimal grossPay;
    private BigDecimal basicPay;
    private BigDecimal hra;
    private BigDecimal allowances;
    private BigDecimal bonus;
    private BigDecimal pfDeduction;
    private BigDecimal taxDeduction;
    private BigDecimal professionalTax;
    private BigDecimal netPay;

    @Enumerated(EnumType.STRING)
    private PayrollStatus status;

    private LocalDateTime processedAt;

    public enum PayrollStatus { PROCESSING, PROCESSED, FAILED }
}