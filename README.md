# Payroll Management System

A full-stack payroll platform built with Spring Boot and React for managing employees, salary processing, taxes, payslips, and audit logs.

## Tech Stack

- Backend: Java 21, Spring Boot 3.3.5, Spring Security, Spring Data JPA, MySQL, Redis, Kafka, JWT, Swagger
- Frontend: React 19, Vite, React Router, Zustand, Axios, React Query, Recharts
- Infrastructure: Docker Compose (MySQL, Redis, Zookeeper, Kafka)

## Project Structure

```text
payroll-system/
  backend/      # Spring Boot REST API
  frontend/     # React + Vite application
  docker-compose.yml
```

## Core Features

- JWT-based authentication with refresh token flow
- Role-aware access paths (`ADMIN`, `HR`, `EMPLOYEE`)
- Employee CRUD with search/filter/pagination
- Payroll run by period (monthly payroll processing)
- Payslip PDF generation and download
- Tax slab management and tax computation endpoints
- Audit log retrieval for admin use-cases
- Swagger/OpenAPI docs for backend APIs

## Default Seeded Users

The backend seeds sample users automatically at startup (if not present):

- `admin@techcorp.in` / `admin123` (ADMIN)
- `hr@techcorp.in` / `hr123` (HR)
- `emp@techcorp.in` / `emp123` (EMPLOYEE)

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+ and npm
- Docker Desktop (or Docker Engine + Compose)

## Environment and Services

The following services are expected by the backend config:

- MySQL: `localhost:3306` (database `payroll_db`, user `root`, password `root`)
- Redis: `localhost:6379`
- Kafka: `localhost:9092` (with Zookeeper)

Start infra services:

```bash
docker compose up -d
```

Stop infra services:

```bash
docker compose down
```

## Run Locally

### 1) Start Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend base URL: `http://localhost:8080`

Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2) Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

The frontend proxies `/api` requests to `http://localhost:8080` via Vite config.

## Build and Test

Backend tests:

```bash
cd backend
./mvnw test
```

Backend package:

```bash
cd backend
./mvnw clean package
```

Frontend production build:

```bash
cd frontend
npm run build
```

Frontend preview build:

```bash
cd frontend
npm run preview
```

## Useful API Paths

- Auth: `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/validate`
- Employees: `/api/hr/employees`
- Payroll: `POST /api/hr/payroll/run?period=YYYY-MM`, `GET /api/hr/payroll/{period}`
- Payslips: `/api/employee/payslips`
- Tax: `/api/hr/tax/slabs`, `/api/hr/tax/compute`
- Audit: `/api/admin/audit`

## Notes

- If startup fails due to DB connection, make sure Docker services are healthy.
- Mail settings in backend config are placeholders and should be replaced for real SMTP use.
- Generated runtime/build folders are excluded via `.gitignore`.
