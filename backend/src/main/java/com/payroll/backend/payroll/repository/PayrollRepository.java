package com.payroll.backend.payroll.repository;

import com.payroll.backend.payroll.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<PayrollRecord, Long> {
    List<PayrollRecord> findByPeriodOrderByEmployee_NameAsc(String period);
    Optional<PayrollRecord> findByEmployee_IdAndPeriod(Long empId, String period);
    List<PayrollRecord> findByEmployee_IdOrderByPeriodDesc(Long empId);
}