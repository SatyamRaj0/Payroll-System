package com.payroll.backend.common.exception;

public class PayrollException extends RuntimeException {
    public PayrollException(String message) {
        super(message);
    }
}