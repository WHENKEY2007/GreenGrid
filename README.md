# Green Grid — Smart Energy Management and Sustainability Platform

Green Grid is a full-stack smart energy management and sustainability platform that helps users monitor electricity consumption, track renewable energy generation, understand energy usage, estimate costs, identify inefficient consumption, and improve energy efficiency.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on v22 & v25)
- **PostgreSQL**: PostgreSQL 16+ or Docker

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
DATABASE_URL="postgresql://postgres@localhost:5432/greengrid?schema=public"
JWT_SECRET="greengrid_super_secret_jwt_key_2026_production_grade"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

### 3. Database Migration & Seed
```bash
npm run prisma:push
npm run prisma:seed
```

### 4. Start Development Servers
```bash
# Start both Backend and Frontend concurrently:
npm run dev

# Or independently:
npm run dev:server   # Backend on http://localhost:5000
npm run dev:client   # Frontend on http://localhost:5173
```

### 5. Access Endpoints
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Swagger Documentation**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@greengrid.com` | `Admin@123` | Full system access, platform analytics, user management |
| **Normal User (Eco Pro)** | `alex@greengrid.com` | `User@123` | 30-day realistic consumption, 7 devices, solar generation, alerts |
| **Normal User** | `sam@greengrid.com` | `User@123` | Smart-meter tracking, AC & water pump |
| **Normal User** | `jordan@greengrid.com` | `User@123` | High renewable prosumer |

---

## 🧪 Running Tests
```bash
npm run test
```

---

## 🐳 Docker Deployment
```bash
docker compose up -d
```
