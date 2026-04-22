-- SQL schema for salary_structure table
CREATE TABLE IF NOT EXISTS salary_structure (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    basic DECIMAL(15,2) NOT NULL,
    hra DECIMAL(15,2) NOT NULL,
    allowances DECIMAL(15,2) NOT NULL,
    bonus_percent DECIMAL(5,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    CONSTRAINT fk_salary_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Example seed for ACTIVE employees (adjust values as needed)
INSERT INTO salary_structure (employee_id, basic, hra, allowances, bonus_percent, effective_from)
SELECT id, 50000, 20000, 10000, 10, '2025-04-01' FROM employees WHERE status = 'ACTIVE';
