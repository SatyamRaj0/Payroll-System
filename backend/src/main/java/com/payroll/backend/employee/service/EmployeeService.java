package com.payroll.backend.employee.service;

import com.payroll.backend.audit.service.AuditService;
import com.payroll.backend.common.exception.ResourceNotFoundException;
import com.payroll.backend.employee.model.Employee;
import com.payroll.backend.employee.repository.EmployeeRepository;
import com.payroll.backend.payroll.model.SalaryStructure;
import com.payroll.backend.payroll.repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepo;
    private final AuditService auditService;
    private final SalaryStructureRepository salaryStructureRepo;

    public Page<Employee> findAll(String search, String department, Pageable pageable) {
        return employeeRepo.findWithFilters(search, department, null, pageable);
    }

    @Transactional
    @SuppressWarnings("null")
    public Employee create(Employee employee) {
        Employee saved = employeeRepo.save(employee);
        
        // Auto-create a default salary structure
        SalaryStructure defaultSalary = SalaryStructure.builder()
            .employee(saved)
            .basic(java.math.BigDecimal.valueOf(50000))
            .hra(java.math.BigDecimal.valueOf(20000))
            .allowances(java.math.BigDecimal.valueOf(10000))
            .bonusPercent(java.math.BigDecimal.valueOf(10))
            .effectiveFrom(java.time.LocalDate.now())
            .build();
        salaryStructureRepo.save(defaultSalary);
        
        auditService.log("EMPLOYEE_CREATED", "Employee", saved.getId(),
            "Created: " + saved.getName());
        return saved;
    }

    @Transactional
    @SuppressWarnings("null")
    public Employee update(Long id, Employee updated) {
        Employee existing = employeeRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        existing.setName(updated.getName());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setDesignation(updated.getDesignation());
        existing.setBankAccount(updated.getBankAccount());
        existing.setIfscCode(updated.getIfscCode());
        Employee saved = employeeRepo.save(existing);
        auditService.log("EMPLOYEE_UPDATED", "Employee", id,
            "Updated: " + saved.getName());
        return saved;
    }

    @Transactional
    @SuppressWarnings("null")
    public void delete(Long id) {
        Employee emp = employeeRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        emp.setStatus(Employee.EmployeeStatus.TERMINATED);
        employeeRepo.save(emp);
        auditService.log("EMPLOYEE_TERMINATED", "Employee", id,
            "Terminated: " + emp.getName());
    }

    public SalaryStructure getLatestSalary(Long empId) {
        return salaryStructureRepo.findLatestByEmployeeId(empId)
            .orElseThrow(() -> new ResourceNotFoundException("SalaryStructure for Employee", empId));
    }
}