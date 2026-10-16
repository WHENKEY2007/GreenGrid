# Green Grid — Security Architecture & Guidelines

---

## 1. Authentication & Session Management
- **Stateless JWT**: Standardized Bearer token exchange.
- **Salted Password Hashing**: Passwords hashed with BCrypt (10 salt rounds).
- **Zero Credential Leakage**: Password hashes are stripped from all user queries and responses.

---

## 2. Authorization & Ownership Matrix
- **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` and `ADMIN`.
- **Admin Isolation**: Admin routes (`/api/admin/**`) are safeguarded by `requireAdmin` middleware.
- **Data Isolation**: All CRUD queries for devices, consumption records, renewable logs, alerts, settings, and reports enforce `userId: req.user.id`. A user can never access or modify data belonging to another user.

---

## 3. Defense in Depth
- **Input Sanitization**: Request bodies, route parameters, and query strings are validated with Zod.
- **HTTP Security Headers**: Powered by `helmet` to mitigate clickjacking, MIME sniffing, and cross-site scripting.
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts and API abuse.
- **CORS Policy**: Configured to restrict origins to the approved client application URL.
- **Safe Error Reporting**: Stack traces are logged server-side and never returned to the client.
