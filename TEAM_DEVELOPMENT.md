# SquadUp — Team Development & Collaboration Guide

**Course**: API & Micro Services (241AI024)  
**Project**: SquadUp — Player Matching & Social Platform

---

## 1. Modular Division of Responsibilities (4-Person Team)

To eliminate code merge conflicts and streamline parallel feature delivery, development tasks are segregated into four distinct architectural domains:

### Developer 1: Backend & REST/SOAP APIs
- **Primary Modules**:
  - `com.squadup.controller` (REST v1 and v2 controllers, matrix variables)
  - `com.squadup.soap` (SOAP endpoint, JAXB marshalling, XSD schema)
  - `com.squadup.matching` (Recommendation engine & prototype-scoped `SquadMatcher`)
  - `com.squadup.jdbc` (`PlatformStatsDao` with `JdbcTemplate` analytical SQL)
- **Key Responsibilities**:
  - Ensure API contracts match OpenAPI schemas and DTO validations.
  - Implement dynamic Criteria API and Matrix Variable controllers.
  - Expose SOAP WSDL operations and fault handlers.

### Developer 2: Frontend & Real-Time UI
- **Primary Modules**:
  - `src/main/resources/static/` (Modern responsive UI components, CSS design system)
  - `realtime.js` and STOMP WebSocket frontend integration
  - Dashboard, Lobby Discovery, Match Recommendation cards, Profile views
- **Key Responsibilities**:
  - Maintain fluid responsive interfaces for desktop and mobile displays.
  - Handle client-side state, token storage, and dynamic DOM rendering.
  - Integrate real-time chat feeds, typing indicators, and friend notification badges.

### Developer 3: Database, Security & Testing
- **Primary Modules**:
  - `com.squadup.entity` & `com.squadup.repository` (JPA entities, derived queries, `@Modifying` queries)
  - `com.squadup.security` & `com.squadup.service.TokenService` (`SecurityConfig`, `AccessGuard`, `JsonSecurityErrorHandler`)
  - Concurrency management (`@Lock(PESSIMISTIC_WRITE)` in `SquadService`)
  - `src/test/java/` (JUnit 5, MockMvc, and `@DataJpaTest` test suites)
- **Key Responsibilities**:
  - Database schema evolution and MySQL/H2 dual profile persistence.
  - Password hashing and bearer-token authentication lifecycles.
  - Maintain the 53 automated tests and ensure zero regressions across all builds.

### Developer 4: Integration, Observability & Deployment
- **Primary Modules**:
  - `com.squadup.aop` (`LoggingAspect`, `PerformanceAspect`, `AuditAspect`)
  - `com.squadup.config` (`AppConfig`, `DataSeeder`, `OpenApiConfig`)
  - Build automation (`pom.xml`, Maven wrapper, `start.ps1`)
  - API documentation (`Swagger UI`, `API_DOCUMENTATION.md`, `README.md`)
- **Key Responsibilities**:
  - Aspect-oriented programming configuration and audit trail logging.
  - Realistic data seed population for presentation demos.
  - Swagger UI / OpenAPI documentation and environment configuration.

---

## 2. Git Branching Strategy & Workflow

```
main (Production ready, verified by all 53 tests)
  └── dev (Integration branch)
        ├── feature/auth-security       (Dev 3)
        ├── feature/squad-matching      (Dev 1)
        ├── feature/frontend-dashboard  (Dev 2)
        └── feature/aop-docs            (Dev 4)
```

1. **Feature Branches**: Each developer works on `feature/<name>` branched from `dev`.
2. **Pre-Commit Verification**: Run `.\mvnw.cmd test` locally before pushing code.
3. **Pull Requests**: Pull requests merge into `dev` only after automated test verification.
4. **Merge to Main**: `dev` is merged into `main` for review milestones and final demonstration.
