# Green Grid — API Documentation

**Base URL**: `http://localhost:5000/api`  
**Swagger UI**: `http://localhost:5000/api/docs`  
**Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Response & Error Envelopes

### Success Envelope
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ ... ]
  }
}
```

---

## 2. API Endpoints Reference

### 2.1. Authentication
* `POST /api/auth/register` — `{ name, email, password, confirmPassword, phone }` $\rightarrow$ `201 Created`
* `POST /api/auth/login` — `{ email, password }` $\rightarrow$ `200 OK { token, user }`
* `GET /api/auth/me` — Returns current authenticated user and role.
* `POST /api/auth/logout` — Revokes/clears client-side session.

### 2.2. Users
* `GET /api/users/me` — Get user profile & energy settings.
* `PUT /api/users/me` — Update name and phone.
* `PUT /api/users/me/password` — Change password.

### 2.3. Devices
* `GET /api/devices` — List registered devices with calculated `dailyConsumptionKwh`.
* `POST /api/devices` — Add new device `{ name, category, ratedPower, quantity, usageHoursPerDay }`.
* `GET /api/devices/:id` — Get device details.
* `PUT /api/devices/:id` — Update device parameters.
* `DELETE /api/devices/:id` — Remove device.

### 2.4. Energy Consumption
* `GET /api/consumption` — Paged consumption history (supports `?startDate=&endDate=&deviceId=&source=&page=&limit=`).
* `POST /api/consumption` — Log consumption `{ deviceId?, date, energyKwh, source }`. Auto-calculates cost via active tariff and checks thresholds.
* `GET /api/consumption/:id` — Single consumption record.
* `PUT /api/consumption/:id` — Edit consumption record.
* `DELETE /api/consumption/:id` — Delete consumption record.

### 2.5. Renewable Generation
* `GET /api/renewable` — List renewable generation records.
* `POST /api/renewable` — Record solar/wind generation `{ source, generationKwh, date, capacityKw }`.
* `GET /api/renewable/:id` — Single renewable record.
* `PUT /api/renewable/:id` — Edit renewable record.
* `DELETE /api/renewable/:id` — Delete renewable record.

### 2.6. Analytics
* `GET /api/analytics/summary` — Total consumption, today's usage, monthly kWh, estimated monthly cost, renewable generated, renewable %, carbon emissions, avoided emissions.
* `GET /api/analytics/daily` — 30-day daily consumption timeline with renewable breakdown.
* `GET /api/analytics/weekly` — Weekly aggregated consumption.
* `GET /api/analytics/monthly` — Monthly consumption and cost metrics.
* `GET /api/analytics/devices` — Device-wise consumption rankings and share percentages.
* `GET /api/analytics/renewable` — Renewable generation vs. grid consumption trend.
* `GET /api/analytics/carbon` — Carbon emissions timeline vs. abated carbon.

### 2.7. Recommendations
* `GET /api/recommendations` — Rule-based recommendations derived from user's actual database consumption patterns (AC overuse, lighting inefficiency, low renewable ratio, high off-peak potential).

### 2.8. Alerts
* `GET /api/alerts` — List alerts with unread counter.
* `PUT /api/alerts/:id/read` — Mark alert as read.
* `DELETE /api/alerts/:id` — Dismiss alert.

### 2.9. Energy Settings
* `GET /api/settings` — Current user thresholds and carbon factor.
* `PUT /api/settings` — Update `dailyConsumptionLimit`, `monthlyCostLimit`, `carbonFactor`, `alertEnabled`.

### 2.10. Reports
* `GET /api/reports/energy` — Period summary report with metrics and recommendations.
* `GET /api/reports/energy/export` — Download complete CSV energy report.

### 2.11. Admin Endpoints (Require `ADMIN` Role)
* `GET /api/admin/dashboard` — Platform stats: total users, active users, system-wide kWh, total renewable, estimated platform carbon impact, recent registrations.
* `GET /api/admin/users` — Paged and searchable user directory.
* `GET /api/admin/users/:id` — Detailed user metrics and device inventory.
* `PUT /api/admin/users/:id/status` — `{ isActive: true | false }` toggle.
* `GET /api/admin/analytics` — Platform-wide macro consumption analytics.
* `GET /api/admin/alerts` — System-wide alert telemetry.
* `GET /api/admin/tariffs` — List all energy tariffs.
* `POST /api/admin/tariffs` — Create and activate a new tariff.
