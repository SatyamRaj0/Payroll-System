package com.payroll.backend.employee.repository;

import com.payroll.backend.employee.model.Employee;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT e FROM Employee e WHERE e.status = 'ACTIVE'")
    List<Employee> findAllActive();

    @Query("""
        SELECT e FROM Employee e
        WHERE (:search IS NULL
            OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:department IS NULL OR e.department = :department)
        AND (:status IS NULL OR CAST(e.status AS string) = :status)
    """)
    Page<Employee> findWithFilters(
        @Param("search") String search,
        @Param("department") String department,
        @Param("status") String status,
        Pageable pageable
    );
}