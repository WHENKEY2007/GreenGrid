# Green Grid — Team Development & Git Workflow Guide

---

## 1. 4-Person Engineering Team Roles

### Developer 1: Backend Core & REST APIs
- Express router setup, middleware, controllers, routes.
- JWT authentication, BCrypt, role-based authorization.
- Device, Consumption, Renewable CRUD endpoints.

### Developer 2: Frontend UI & Dashboards
- Vite + React + Tailwind CSS client architecture.
- Recharts dashboard components (daily, monthly, cost, carbon).
- Navigation layout, sidebar, responsiveness, and toast notifications.

### Developer 3: Database, Data Integrity & Automated Testing
- Prisma schema migrations, seed dataset generation.
- Jest + Supertest suites for auth, device, and analytics endpoints.
- PostgreSQL performance indexes and query optimization.

### Developer 4: Analytics Engine, Reports & DevOps
- Analytics calculators (carbon emissions, avoided carbon, cost projections).
- Dynamic recommendation engine and threshold alert triggers.
- CSV export & print reports.
- Docker compose, OpenAPI/Swagger documentation, and production build pipelines.

---

## 2. Git Branching Strategy

```
main (Production deployment)
  └── dev (Staging/Integration)
        ├── feature/auth-jwt
        ├── feature/device-management
        ├── feature/consumption-analytics
        ├── feature/frontend-dashboard
        └── feature/admin-cockpit
```
