package com.payroll.backend.payroll.repository;

import com.payroll.backend.payroll.model.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {

    @Query("""
        SELECT s FROM SalaryStructure s
        WHERE s.employee.id = :empId
        ORDER BY s.effectiveFrom DESC
        LIMIT 1
    """)
    Optional<SalaryStructure> findLatestByEmployeeId(@Param("empId") Long empId);

    boolean existsByEmployeeId(Long empId);
}