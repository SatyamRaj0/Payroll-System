package com.payroll.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.*;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic payrollCompletedTopic() {
        return TopicBuilder.name("payroll-completed").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic payslipEmailTopic() {
        return TopicBuilder.name("payslip-email").partitions(1).replicas(1).build();
    }
}