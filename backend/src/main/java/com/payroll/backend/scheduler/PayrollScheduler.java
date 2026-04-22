package com.payroll.backend.scheduler;

import com.payroll.backend.payroll.service.PayrollEngine;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.YearMonth;

@Component
@RequiredArgsConstructor
public class PayrollScheduler {

    private static final Logger log = LoggerFactory.getLogger(PayrollScheduler.class);
    private final PayrollEngine payrollEngine;

    @Scheduled(cron = "0 0 6 L * ?")
    public void autoRunPayroll() {
        YearMonth period = YearMonth.now();
        log.info("[SCHEDULER] Auto-payroll triggered for {}", period);
        try {
            var summary = payrollEngine.processMonthlyPayroll(period);
            log.info("[SCHEDULER] Done: {}", summary);
        } catch (Exception e) {
            log.error("[SCHEDULER] Payroll failed: {}", e.getMessage());
        }
    }
}