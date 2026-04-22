package com.payroll.backend.payslip.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.*;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.*;
import com.payroll.backend.common.exception.ResourceNotFoundException;
import com.payroll.backend.kafka.PayrollEventProducer;
import com.payroll.backend.payroll.model.PayrollRecord;
import com.payroll.backend.payroll.repository.PayrollRepository;
import com.payroll.backend.payslip.model.Payslip;
import com.payroll.backend.payslip.repository.PayslipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayslipService {

    private final PayrollRepository payrollRepo;
    private final PayslipRepository payslipRepo;
    private final PayrollEventProducer eventProducer;

    @Transactional
    public byte[] generateAndStore(Long payrollRecordId) {
        PayrollRecord record = payrollRepo.findById(payrollRecordId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollRecord", payrollRecordId));

        byte[] pdf = buildPdf(record);

        Payslip payslip = payslipRepo
            .findByPayrollRecord_Id(payrollRecordId)
            .orElse(Payslip.builder().payrollRecord(record).build());

        payslip.setPdfData(pdf);
        payslip.setGeneratedAt(LocalDateTime.now());
        payslipRepo.save(payslip);

        // Fire Kafka event → email consumer picks it up
        eventProducer.sendPayslipEmail(record.getEmployee().getId(), record.getPeriod());

        return pdf;
    }

    public byte[] download(Long empId, String period) {
        Payslip payslip = payslipRepo
            .findByPayrollRecord_Employee_IdAndPayrollRecord_Period(empId, period)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Payslip not found for employee " + empId + " period " + period));
        return payslip.getPdfData();
    }

    private byte[] buildPdf(PayrollRecord r) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 50, 40, 50);

            // Header
            Paragraph header = new Paragraph("TechCorp India Pvt. Ltd.")
                .setFontSize(20).setBold()
                .setFontColor(ColorConstants.WHITE)
                .setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(31, 78, 200))
                .setPadding(20).setTextAlignment(TextAlignment.CENTER);
            doc.add(header);

            doc.add(new Paragraph("Payslip — " + r.getPeriod())
                .setFontSize(12).setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(4));

            doc.add(new Paragraph(" "));

            // Employee info table
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100));
            addInfoCell(infoTable, "Employee Name", r.getEmployee().getName());
            addInfoCell(infoTable, "Department", r.getEmployee().getDepartment());
            addInfoCell(infoTable, "Designation", r.getEmployee().getDesignation());
            addInfoCell(infoTable, "Period", r.getPeriod());
            doc.add(infoTable);

            doc.add(new Paragraph(" "));

            // Earnings table
            doc.add(new Paragraph("Earnings").setBold().setFontSize(12)
                .setMarginBottom(4));
            Table earnTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .setWidth(UnitValue.createPercentValue(100));
            addSalaryRow(earnTable, "Basic Salary", r.getBasicPay(), false);
            addSalaryRow(earnTable, "HRA", r.getHra(), false);
            addSalaryRow(earnTable, "Allowances", r.getAllowances(), false);
            addSalaryRow(earnTable, "Bonus", r.getBonus(), false);
            addSalaryRow(earnTable, "Gross Pay", r.getGrossPay(), true);
            doc.add(earnTable);

            doc.add(new Paragraph(" "));

            // Deductions table
            doc.add(new Paragraph("Deductions").setBold().setFontSize(12)
                .setMarginBottom(4));
            Table dedTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .setWidth(UnitValue.createPercentValue(100));
            addSalaryRow(dedTable, "Provident Fund (12%)", r.getPfDeduction(), false);
            addSalaryRow(dedTable, "Income Tax (TDS)", r.getTaxDeduction(), false);
            addSalaryRow(dedTable, "Professional Tax", r.getProfessionalTax(), false);
            doc.add(dedTable);

            doc.add(new Paragraph(" "));

            // Net pay
            Table netTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                .setWidth(UnitValue.createPercentValue(100));
            Cell netLabel = new Cell().add(new Paragraph("NET PAY").setBold())
                .setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(220, 240, 255))
                .setPadding(10);
            Cell netValue = new Cell().add(new Paragraph(fmt(r.getNetPay())).setBold())
                .setBackgroundColor(new com.itextpdf.kernel.colors.DeviceRgb(220, 240, 255))
                .setTextAlignment(TextAlignment.RIGHT).setPadding(10);
            netTable.addCell(netLabel);
            netTable.addCell(netValue);
            doc.add(netTable);

            doc.add(new Paragraph("\nThis is a computer-generated payslip and does not require a signature.")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20));

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate payslip PDF: " + e.getMessage());
        }
    }

    private void addInfoCell(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setFontSize(10)
            .setFontColor(ColorConstants.GRAY)));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "-").setFontSize(10)));
    }

    private void addSalaryRow(Table table, String label, BigDecimal amount, boolean bold) {
        Paragraph lp = new Paragraph(label).setFontSize(11);
        Paragraph vp = new Paragraph(fmt(amount)).setFontSize(11)
            .setTextAlignment(TextAlignment.RIGHT);
        if (bold) { lp.setBold(); vp.setBold(); }
        table.addCell(new Cell().add(lp).setPadding(6));
        table.addCell(new Cell().add(vp).setPadding(6));
    }

    private String fmt(BigDecimal v) {
        if (v == null) return "₹0.00";
        return "₹" + String.format("%,.2f", v);
    }
}