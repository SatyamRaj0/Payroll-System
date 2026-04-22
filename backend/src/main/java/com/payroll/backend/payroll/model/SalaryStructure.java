package com.payroll.backend.payroll.model;

import com.payroll.backend.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "salary_structure")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private BigDecimal basic;

    @Column(nullable = false)
    private BigDecimal hra;

    @Column(nullable = false)
    private BigDecimal allowances;

    @Builder.Default
    private BigDecimal bonusPercent = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    public BigDecimal getBonusPercent() {
        return bonusPercent != null ? bonusPercent : BigDecimal.ZERO;
    }
}