-- SQL schema for payroll table
CREATE TABLE IF NOT EXISTS payroll (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    period VARCHAR(16) NOT NULL,
    gross_pay DECIMAL(15,2),
    basic_pay DECIMAL(15,2),
    hra DECIMAL(15,2),
    allowances DECIMAL(15,2),
    bonus DECIMAL(15,2),
    pf_deduction DECIMAL(15,2),
    tax_deduction DECIMAL(15,2),
    professional_tax DECIMAL(15,2),
    net_pay DECIMAL(15,2),
    status VARCHAR(16),
    processed_at DATETIME,
    CONSTRAINT fk_payroll_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
    CONSTRAINT uc_employee_period UNIQUE (employee_id, period)
);
