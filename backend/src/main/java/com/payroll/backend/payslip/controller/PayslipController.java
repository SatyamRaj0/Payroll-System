package com.payroll.backend.payslip.controller;

import com.payroll.backend.payslip.service.PayslipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee/payslips")
@RequiredArgsConstructor
@Tag(name = "Payslip")
public class PayslipController {

    private final PayslipService payslipService;

    @PostMapping("/generate/{payrollRecordId}")
    @Operation(summary = "Generate and store payslip PDF for a payroll record")
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> generate(@PathVariable Long payrollRecordId) {
        byte[] pdf = payslipService.generateAndStore(payrollRecordId);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=payslip-" + payrollRecordId + ".pdf")
            .body(pdf);
    }

    @GetMapping("/download")
    @Operation(summary = "Download payslip by employee ID and period")
    @SuppressWarnings("null")
    public ResponseEntity<byte[]> download(
            @RequestParam Long empId,
            @RequestParam String period) {
        byte[] pdf = payslipService.download(empId, period);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=payslip-" + empId + "-" + period + ".pdf")
            .body(pdf);
    }
}