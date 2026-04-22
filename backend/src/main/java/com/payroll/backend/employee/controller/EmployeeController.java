package com.payroll.backend.employee.controller;

import com.payroll.backend.employee.model.Employee;
import com.payroll.backend.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hr/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "List employees with search, filter, and pagination")
    public ResponseEntity<Page<Employee>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(
            employeeService.findAll(search, department, PageRequest.of(page, size)));
    }

    @PostMapping
    @Operation(summary = "Add a new employee")
    public ResponseEntity<Employee> create(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.create(employee));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee details")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.update(id, employee));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Terminate an employee")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/salary")
    @Operation(summary = "Get latest salary structure for an employee")
    public ResponseEntity<?> getSalary(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getLatestSalary(id));
    }
}