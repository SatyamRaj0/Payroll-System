package com.payroll.backend.payroll.service;

import com.payroll.backend.audit.service.AuditService;
import com.payroll.backend.employee.model.Employee;
import com.payroll.backend.employee.repository.EmployeeRepository;
import com.payroll.backend.kafka.PayrollEventProducer;
import com.payroll.backend.payroll.model.*;
import com.payroll.backend.payroll.repository.*;
import com.payroll.backend.payslip.service.PayslipService;
import com.payroll.backend.tax.service.TaxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollEngine {

    private final EmployeeRepository empRepo;
    private final SalaryStructureRepository salaryRepo;
    private final PayrollRepository payrollRepo;
    private final TaxService taxService;
    private final AuditService auditService;
    private final PayrollEventProducer eventProducer;
    private final PayslipService payslipService;

    @Transactional
    @SuppressWarnings("null")
    public Map<String, Object> processMonthlyPayroll(YearMonth period) {
        String periodStr = period.toString();
        log.info("[PAYROLL] Starting payroll for: {}", periodStr);

        List<Employee> employees = empRepo.findAllActive();
        List<Long> processedIds = new ArrayList<>();
        List<Long> failedIds = new ArrayList<>();

        for (Employee emp : employees) {
            try {
                // Skip if already processed for this period
                if (payrollRepo.findByEmployee_IdAndPeriod(emp.getId(), periodStr).isPresent()) {
                    log.info("[PAYROLL] Skipping {} - already processed", emp.getId());
                    continue;
                }
                PayrollRecord record = calculateForEmployee(emp, periodStr);
                payrollRepo.save(record);
                
                // Generate and store PDF payslip
                payslipService.generateAndStore(record.getId());
                
                processedIds.add(emp.getId());
            } catch (Exception e) {
                log.error("[PAYROLL] Failed for {}: {}", emp.getId(), e.getMessage());
                failedIds.add(emp.getId());
            }
        }

        auditService.log("PAYROLL_RUN", "Payroll", null,
            "Period: " + periodStr + " | Processed: " + processedIds.size()
            + " | Failed: " + failedIds.size());

        if (!processedIds.isEmpty()) {
            eventProducer.sendPayrollCompleted(periodStr, processedIds.size());
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("period", periodStr);
        summary.put("totalProcessed", processedIds.size());
        summary.put("totalFailed", failedIds.size());
        summary.put("failedEmployeeIds", failedIds);
        return summary;
    }

    private PayrollRecord calculateForEmployee(Employee emp, String period) {
        SalaryStructure salary = salaryRepo
            .findLatestByEmployeeId(emp.getId())
            .orElseThrow(() -> new RuntimeException(
                "No salary structure found for employee: " + emp.getId()));

        BigDecimal basic = orZero(salary.getBasic());
        BigDecimal hra = orZero(salary.getHra());
        BigDecimal allowances = orZero(salary.getAllowances());
        BigDecimal bonusPercent = orZero(salary.getBonusPercent());

        BigDecimal bonus = basic
            .multiply(bonusPercent)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal gross = basic.add(hra).add(allowances).add(bonus);

        BigDecimal pf = basic
            .multiply(BigDecimal.valueOf(0.12))
            .setScale(2, RoundingMode.HALF_UP);

        BigDecimal monthlyTax = taxService
            .computeMonthlyTds(gross.multiply(BigDecimal.valueOf(12)));

        BigDecimal professionalTax = BigDecimal.valueOf(200);

        BigDecimal netPay = gross
            .subtract(pf)
            .subtract(monthlyTax)
            .subtract(professionalTax);

        return PayrollRecord.builder()
            .employee(emp)
            .period(period)
            .grossPay(gross)
            .basicPay(basic)
            .hra(hra)
            .allowances(allowances)
            .bonus(bonus)
            .pfDeduction(pf)
            .taxDeduction(monthlyTax)
            .professionalTax(professionalTax)
            .netPay(netPay)
            .status(PayrollRecord.PayrollStatus.PROCESSED)
            .processedAt(LocalDateTime.now())
            .build();
    }

    private BigDecimal orZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}