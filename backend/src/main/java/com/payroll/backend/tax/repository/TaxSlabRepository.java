package com.payroll.backend.tax.repository;

import com.payroll.backend.tax.model.TaxSlab;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaxSlabRepository extends JpaRepository<TaxSlab, Long> {
    List<TaxSlab> findByActiveAndFiscalYearAndRegimeOrderByLowerLimitAsc(boolean active, String fiscalYear, TaxSlab.TaxRegime regime);
    List<TaxSlab> findByActiveAndFiscalYearOrderByLowerLimitAsc(boolean active, String fiscalYear);
    boolean existsByFiscalYear(String fiscalYear);
}