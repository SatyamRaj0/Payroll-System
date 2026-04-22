package com.payroll.backend.tax.controller;

import com.payroll.backend.common.dto.ApiResponse;
import com.payroll.backend.tax.model.TaxSlab;
import com.payroll.backend.tax.repository.TaxSlabRepository;
import com.payroll.backend.tax.service.TaxService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hr/tax")
@RequiredArgsConstructor
@Tag(name = "Tax Management")
public class TaxController {

    private final TaxService taxService;
    private final TaxSlabRepository taxSlabRepo;

    @GetMapping("/slabs")
    public ResponseEntity<ApiResponse<List<TaxSlab>>> getSlabs() {
        return ResponseEntity.ok(ApiResponse.ok(taxService.getActiveSlabs(), "Tax slabs fetched"));
    }

    @PostMapping("/slabs")
    public ResponseEntity<ApiResponse<TaxSlab>> addSlab(@RequestBody TaxSlab slab) {
        return ResponseEntity.ok(ApiResponse.ok(taxSlabRepo.save(slab), "Tax slab added"));
    }

    @GetMapping("/compute")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> compute(
            @RequestParam BigDecimal annualIncome) {
        BigDecimal annual = taxService.computeAnnualTax(annualIncome);
        BigDecimal monthly = taxService.computeMonthlyTds(annualIncome);
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("annualTax", annual, "monthlyTds", monthly),
            "Tax computed"));
    }
}