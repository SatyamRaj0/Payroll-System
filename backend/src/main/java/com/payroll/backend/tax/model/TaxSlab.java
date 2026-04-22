package com.payroll.backend.tax.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tax_slabs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxSlab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal lowerLimit;

    private BigDecimal upperLimit;

    @Column(nullable = false)
    private BigDecimal rate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaxRegime regime;

    @Column(nullable = false)
    private String fiscalYear;

    @Builder.Default
    private boolean active = true;

    public enum TaxRegime { OLD, NEW }
}