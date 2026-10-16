# Green Grid — Automated Testing Documentation

---

## 1. Test Execution Commands

```bash
# Run all server tests (Jest + Supertest)
npm --prefix server test

# From root workspace
npm run test
```

---

## 2. Test Suites
- **Authentication**: Registration, Login, Bad Credentials, JWT Verification.
- **Authorization & Ownership**: Attempting to view/modify other users' records $\rightarrow$ `404/403`. Admin-only endpoint protection $\rightarrow$ `403`.
- **Devices CRUD**: Creation, wattage validation, hours per day bounds, estimated daily kWh.
- **Consumption CRUD**: Valid record creation, auto-cost calculation with tariff, device association.
- **Renewable CRUD**: Solar/wind recording, capacity constraints.
- **Analytics & Calculations**: 30-day aggregations, carbon factor conversion, renewable self-consumption percentage.
- **Validation & Error Handling**: Invalid email, negative kWh, non-existent entity IDs.
