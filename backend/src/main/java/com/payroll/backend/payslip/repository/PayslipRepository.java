package com.payroll.backend.payslip.repository;

import com.payroll.backend.payslip.model.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    Optional<Payslip> findByPayrollRecord_Id(Long payrollRecordId);
    Optional<Payslip> findByPayrollRecord_Employee_IdAndPayrollRecord_Period(
        Long empId, String period);
}