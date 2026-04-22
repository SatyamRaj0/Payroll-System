package com.payroll.backend.payroll.controller;

import com.payroll.backend.payroll.model.PayrollRecord;
import com.payroll.backend.payroll.repository.PayrollRepository;
import com.payroll.backend.payroll.service.PayrollEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api/hr/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll Engine")
public class PayrollController {

    private final PayrollEngine payrollEngine;
    private final PayrollRepository payrollRepo;

    @PostMapping("/run")
    @Operation(summary = "Run payroll for a given month (e.g. 2025-04)")
    public ResponseEntity<Map<String, Object>> runPayroll(@RequestParam String period) {
        return ResponseEntity.ok(payrollEngine.processMonthlyPayroll(YearMonth.parse(period)));
    }

    @GetMapping("/{period}")
    @Operation(summary = "Get all payroll records for a period")
    public ResponseEntity<List<PayrollRecord>> getByPeriod(@PathVariable String period) {
        return ResponseEntity.ok(payrollRepo.findByPeriodOrderByEmployee_NameAsc(period));
    }

    @GetMapping("/employee/{empId}")
    @Operation(summary = "Get payroll history for one employee")
    public ResponseEntity<List<PayrollRecord>> getByEmployee(@PathVariable Long empId) {
        return ResponseEntity.ok(payrollRepo.findByEmployee_IdOrderByPeriodDesc(empId));
    }
}