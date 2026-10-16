# Green Grid — Technical Architecture Specification

---

## 1. Architectural Principles
Green Grid adheres to clean architecture principles:
- **Separation of Concerns**: Routes define paths and route guards; Controllers manage request/response mapping; Services encapsulate domain logic and mathematical calculations; Prisma handles data persistence; Middleware guarantees cross-cutting security.
- **Stateless Authorization**: Client authenticates using Bearer JSON Web Tokens (JWT).
- **Type Safety**: End-to-end TypeScript interfaces synchronized between backend DTOs and frontend components.
- **Fail-Safe Validation**: Every input is validated by Zod schemas before touching service layers.

---

## 2. Layered Architecture

```
Client (Vite + React + Tailwind + Recharts)
  │
  ▼ [Axios Client with Bearer Token]
Express.js HTTP Server (Port 5000)
  ├── Security Layer: Helmet, CORS, RateLimiter, Morgan Logger
  ├── Middleware Layer: AuthenticateJWT, RequireAdmin, ValidateBody/Query
  ├── Controller Layer: Auth, User, Device, Consumption, Renewable, Analytics, Admin
  ├── Service Layer: Business logic, tariff calculators, recommendation algorithms
  └── Persistence Layer: Prisma Client
        │
        ▼
PostgreSQL Database (Port 5432, "greengrid")
```

---

## 3. Technology Stack Breakdown

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript + Vite | Blazing fast client runtime with hot module replacement |
| **Styling & Design** | Tailwind CSS | Utility-first eco-friendly modern design system |
| **Data Visualization** | Recharts | Responsive SVG charts (Line, Bar, Area, Pie) |
| **State & Forms** | React Hook Form + Zod | High-performance uncontrolled forms with client validation |
| **Backend Runtime** | Node.js 22+ & Express.js | Robust, non-blocking asynchronous REST API server |
| **Language** | TypeScript 5.8 | Compile-time type safety across both client and server |
| **ORM** | Prisma 6 | Type-safe database queries, migrations, and relationships |
| **Database** | PostgreSQL 18 | ACID-compliant relational persistence |
| **Authentication** | JWT + BCrypt.js | Cryptographic token signing and salted password hashing |
| **Documentation** | Swagger / OpenAPI 3.0 | Interactive web-based API testing at `/api/docs` |
| **Testing** | Jest + Supertest | Unit and integration API test suite |
| **Containerization** | Docker Compose | Reproducible multi-platform PostgreSQL deployment |
