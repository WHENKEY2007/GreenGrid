# Green Grid — Database Schema Specification

**RDBMS**: PostgreSQL 18  
**ORM**: Prisma ORM  
**Database**: `greengrid`

---

## 1. Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Device : owns
    User ||--o{ EnergyConsumption : logs
    User ||--o{ RenewableGeneration : generates
    User ||--o{ Alert : receives
    User ||--|| EnergySettings : configures
    Device ||--o{ EnergyConsumption : records

    User {
        String id PK
        String name
        String email UK
        String password
        String phone
        Enum role "USER | ADMIN"
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }

    Device {
        String id PK
        String userId FK
        String name
        String category
        Float ratedPower
        Int quantity
        Float usageHoursPerDay
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }

    EnergyConsumption {
        String id PK
        String userId FK
        String deviceId FK "Nullable"
        DateTime date
        Float energyKwh
        Float cost
        Enum source "MANUAL | SMART_METER | ESTIMATED"
        DateTime createdAt
    }

    RenewableGeneration {
        String id PK
        String userId FK
        Enum source "SOLAR | WIND | OTHER"
        Float generationKwh
        DateTime date
        Float capacityKw
        DateTime createdAt
    }

    EnergyTariff {
        String id PK
        String name
        Float ratePerKwh
        Float fixedCharge
        DateTime effectiveFrom
        DateTime effectiveTo "Nullable"
        Boolean isActive
        DateTime createdAt
    }

    Alert {
        String id PK
        String userId FK
        Enum type "HIGH_CONSUMPTION | HIGH_COST | DEVICE_OVERUSE | LOW_RENEWABLE_RATIO | GENERAL"
        String title
        String message
        Float threshold "Nullable"
        Boolean isRead
        DateTime createdAt
    }

    EnergySettings {
        String id PK
        String userId FK,UK
        Float dailyConsumptionLimit
        Float monthlyConsumptionLimit
        Float monthlyCostLimit
        Float carbonFactor
        Boolean alertEnabled
        DateTime updatedAt
    }
```

---

## 2. Table Specifications & Indexes

### `User`
- `id`: CUID primary key
- `email`: Unique index (`@@index([email])`)
- `role`: Index (`@@index([role])`)
- Cascades deletion to Devices, Consumptions, RenewableGenerations, Alerts, and Settings.

### `Device`
- `ratedPower`: Stored in Watts.
- `dailyConsumption`: Calculated on read as `(ratedPower * quantity * usageHoursPerDay) / 1000` (kWh).
- `userId`: Foreign key with `@@index([userId])`.

### `EnergyConsumption`
- `userId`, `date`: Composite index `@@index([userId, date])` for high-speed chronological range scans.
- `deviceId`: Nullable foreign key for aggregate and device-specific logs.

### `RenewableGeneration`
- `userId`, `date`: Composite index `@@index([userId, date])` for self-consumption ratio queries.

### `EnergyTariff`
- `isActive`: Indexed for instantaneous active tariff lookup.

### `Alert`
- `userId`, `isRead`: Index `@@index([userId, isRead])` for active notification badge queries.
