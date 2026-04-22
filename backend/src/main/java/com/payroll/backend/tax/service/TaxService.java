package com.payroll.backend.tax.service;

import com.payroll.backend.common.util.DateUtil;
import com.payroll.backend.tax.model.TaxSlab;
import com.payroll.backend.tax.repository.TaxSlabRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxService {

    private final TaxSlabRepository taxSlabRepo;

    @Cacheable("taxSlabs")
    public List<TaxSlab> getActiveSlabs(TaxSlab.TaxRegime regime) {
        return taxSlabRepo
            .findByActiveAndFiscalYearAndRegimeOrderByLowerLimitAsc(
                true, DateUtil.getCurrentFiscalYear(), regime);
    }

    public List<TaxSlab> getActiveSlabs() {
        return getActiveSlabs(TaxSlab.TaxRegime.NEW);
    }

    public BigDecimal computeAnnualTax(BigDecimal annualIncome) {
        if (annualIncome == null || annualIncome.compareTo(BigDecimal.ZERO) <= 0)
            return BigDecimal.ZERO;

        List<TaxSlab> slabs = getActiveSlabs();
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = annualIncome;

        for (TaxSlab slab : slabs) {
            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal slabSize = slab.getUpperLimit() == null
                ? remaining
                : slab.getUpperLimit().subtract(slab.getLowerLimit());

            BigDecimal taxable = remaining.min(slabSize);
            tax = tax.add(
                taxable.multiply(slab.getRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
            );
            remaining = remaining.subtract(taxable);
        }

        // 4% health & education cess
        return tax.multiply(BigDecimal.valueOf(1.04))
            .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal computeMonthlyTds(BigDecimal annualGross) {
        return computeAnnualTax(annualGross)
            .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
    }
}