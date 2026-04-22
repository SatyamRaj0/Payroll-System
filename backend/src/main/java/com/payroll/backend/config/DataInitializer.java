package com.payroll.backend.config;

import com.payroll.backend.auth.model.User;
import com.payroll.backend.auth.repository.UserRepository;
import com.payroll.backend.employee.model.Employee;
import com.payroll.backend.employee.repository.EmployeeRepository;
import com.payroll.backend.payroll.model.SalaryStructure;
import com.payroll.backend.payroll.repository.SalaryStructureRepository;
import com.payroll.backend.tax.model.TaxSlab;
import com.payroll.backend.tax.repository.TaxSlabRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TaxSlabRepository taxSlabRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    @Override
    public void run(String... args) {
        seedUsers();
        seedTaxSlabs();
        seedSalaryStructures();
    }

    private void seedUsers() {
        createUser("admin@techcorp.in", "admin123", User.Role.ADMIN);
        createUser("hr@techcorp.in",    "hr123",    User.Role.HR);
        createUser("emp@techcorp.in",   "emp123",   User.Role.EMPLOYEE);
    }

    @SuppressWarnings("null")
    private void createUser(String email, String password, User.Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .enabled(true)
                .build());
            log.info("Seeded user: {} [{}]", email, role);
        }
    }

    @SuppressWarnings("null")
    private void seedTaxSlabs() {
        seedYearSlabs("2026-2027");
    }

    @SuppressWarnings("null")
    private void seedYearSlabs(String year) {
        if (taxSlabRepository.existsByFiscalYear(year)) return;

        List<TaxSlab> slabs = List.of(
            TaxSlab.builder().lowerLimit(BigDecimal.ZERO)
                .upperLimit(new BigDecimal("300000"))
                .rate(BigDecimal.ZERO)
                .regime(TaxSlab.TaxRegime.NEW)
                .fiscalYear(year).active(true).build(),

            TaxSlab.builder().lowerLimit(new BigDecimal("300000"))
                .upperLimit(new BigDecimal("600000"))
                .rate(new BigDecimal("5"))
                .regime(TaxSlab.TaxRegime.NEW)
                .fiscalYear(year).active(true).build(),

            TaxSlab.builder().lowerLimit(new BigDecimal("600000"))
                .upperLimit(new BigDecimal("900000"))
                .rate(new BigDecimal("10"))
                .regime(TaxSlab.TaxRegime.NEW)
                .fiscalYear(year).active(true).build(),

            TaxSlab.builder().lowerLimit(new BigDecimal("900000"))
                .upperLimit(new BigDecimal("1200000"))
                .rate(new BigDecimal("15"))
                .regime(TaxSlab.TaxRegime.NEW)
                .fiscalYear(year).active(true).build(),

            TaxSlab.builder().lowerLimit(new BigDecimal("1200000"))
                .upperLimit(new BigDecimal("1500000"))
                .rate(new BigDecimal("20"))
                .regime(TaxSlab.TaxRegime.NEW)
                .fiscalYear(year).active(true).build(),

            TaxSlab.builder().lowerLimit(new BigDecimal("1500000"))
                .upperLimit(null)
                .rate(new BigDecimal("30"))
                .regime(TaxSlab.TaxRegime.NEW)
                .fiscalYear(year).active(true).build()
        );

        //noinspection DataFlowIssue
        taxSlabRepository.saveAll(slabs);
        log.info("Seeded {} tax slabs for {}", slabs.size(), year);
    }

    @SuppressWarnings("null")
    private void seedSalaryStructures() {
        List<Employee> employees = employeeRepository.findAll();
        for (Employee emp : employees) {
            if (!salaryStructureRepository.existsByEmployeeId(emp.getId())) {
                SalaryStructure salary = SalaryStructure.builder()
                    .employee(emp)
                    .basic(new BigDecimal("50000"))
                    .hra(new BigDecimal("20000"))
                    .allowances(new BigDecimal("10000"))
                    .bonusPercent(new BigDecimal("10"))
                    .effectiveFrom(java.time.LocalDate.of(2025, 4, 1))
                    .build();
                salaryStructureRepository.save(salary);
                log.info("Seeded salary structure for employee: {}", emp.getName());
            }
        }
    }
}