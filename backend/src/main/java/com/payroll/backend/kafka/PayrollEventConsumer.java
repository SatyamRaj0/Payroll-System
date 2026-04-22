package com.payroll.backend.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PayrollEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventConsumer.class);

    @KafkaListener(topics = "payroll-completed", groupId = "payroll-group")
    public void onPayrollCompleted(String message) {
        log.info("[KAFKA] Received payroll-completed: {}", message);
    }

    @KafkaListener(topics = "payslip-email", groupId = "payroll-group")
    public void onPayslipEmail(String message) {
        log.info("[KAFKA] Received payslip-email: {}", message);
    }
}