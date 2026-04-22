package com.payroll.backend.kafka;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PayrollEventProducer {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventProducer.class);
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendPayrollCompleted(String period, int count) {
        String message = "{\"period\":\"" + period + "\",\"count\":" + count + "}";
        kafkaTemplate.send("payroll-completed", message);
        log.info("[KAFKA] Sent payroll-completed for period: {}", period);
    }

    public void sendPayslipEmail(Long employeeId, String period) {
        String message = "{\"employeeId\":" + employeeId + ",\"period\":\"" + period + "\"}";
        kafkaTemplate.send("payslip-email", message);
        log.info("[KAFKA] Sent payslip-email for employee: {}", employeeId);
    }
}