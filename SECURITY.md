# SquadUp — Security Architecture & Guidelines

---

## 1. Authentication Architecture

### 1.1. Stateless Bearer Tokens
SquadUp implements a stateless bearer-token authentication model:
- Token generation is handled by `TokenService.issue(User user)` utilizing `SecureRandom` to generate 64-character cryptographic hex strings (256 bits of entropy).
- Tokens are stored in the database with creation and expiration timestamps (TTL default: 24 hours).
- Each protected HTTP request must include the header:
  ```http
  Authorization: Bearer <64_character_hex_token>
  ```
- The `TokenAuthenticationFilter` intercepts requests before Spring Security's `UsernamePasswordAuthenticationFilter`, queries `TokenService.authenticate(token)`, and populates the `SecurityContext` with an authenticated `AuthUser` principal.
- On logout (`POST /api/v1/auth/logout`), the token is immediately revoked from the repository.

### 1.2. Password Hashing
- Player passwords are never stored in plaintext.
- BCrypt hashing via Spring Security's `PasswordEncoder` is enforced during registration and password change workflows.
- Password hashes are excluded from all DTO responses (`UserDto`, `UserSummary`) to guarantee zero credential leakage.

---

## 2. Authorization & Ownership Guards (`AccessGuard`)

Fine-grained resource access control is enforced at the service and security layer:
1. **User Profile Ownership**: Players can only edit or cascade-delete their own account (`authId == targetUserId`). Any attempt to modify another user's profile results in HTTP `403 Forbidden`.
2. **Squad Lobby Ownership**:
   - Only the squad creator (`ownerId`) can delete or disband the squad.
   - Non-owner members calling squad delete will trigger member removal (leave) rather than lobby termination.
3. **Friendship Ownership**:
   - Only the direct recipient of a friendship request can accept or reject it.
   - Only participants in a friendship can terminate the relationship.
4. **Chat Room Access**:
   - STOMP WebSocket channel interceptors and `ChatService.canAccessRoom()` verify that the user is an active squad member or a participant in the direct messaging channel before permitting access to message history or publishing messages.

---

## 3. Defense Against Common Vulnerabilities

| Threat | Mitigation Strategy |
|---|---|
| **SQL Injection** | Spring Data JPA / Hibernate parameterized queries; JPQL and Criteria API prevent string concatenation. Raw SQL in `PlatformStatsDao` uses `JdbcTemplate` parameterized statements with `?` placeholders. |
| **Cross-Site Scripting (XSS)** | Inputs sanitized and validated with Bean Validation (`@NotBlank`, `@Size`). Chat messages are pre-processed and moderated via `ChatModerator`. |
| **Cross-Site Request Forgery (CSRF)** | CSRF protection is safely disabled because authentication relies exclusively on the `Authorization` header rather than ambient browser cookies. |
| **Clickjacking** | Configured `X-Frame-Options: SAMEORIGIN` via Spring Security header configuration (allowing embedded H2 console while protecting against external framing). |
| **Timing Attacks** | `TokenService` lookup uses indexed unique token queries and constant-time password verification via `PasswordEncoder.matches()`. |

---

## 4. Input Validation & Error Handling

- **Jakarta Bean Validation**: All incoming request DTOs (`RegisterRequest`, `LoginRequest`, `CreateSquadRequest`, `UpdateProfileRequest`) use annotations: `@NotBlank`, `@Email`, `@Size(min = 3, max = 50)`, `@Min`, `@Max`.
- **Structured JSON Security Errors**: Handled by `JsonSecurityErrorHandler`, implementing both `AuthenticationEntryPoint` and `AccessDeniedHandler`:
  - Returns `401 Unauthorized` for missing/invalid tokens.
  - Returns `403 Forbidden` for permission violations.
  - Replaces default HTML error pages with JSON.
- **Global Exception Handler**: `@RestControllerAdvice` (`GlobalExceptionHandler`) intercepts validation errors, resource not found exceptions, and business rule conflicts (`409 Conflict`), returning clean RFC 7807 problem payloads without leaking stack traces.

---

## 5. Audit Logging (`AuditAspect`)

Security-critical events are captured by Spring AOP's `AuditAspect` and written to an isolated audit log (`logs/audit.log`):
- `LOGIN_SUCCESS`: Records username and user ID upon successful authentication.
- `LOGIN_FAILURE`: Records attempted username upon bad credentials.
- `PASSWORD_CHANGE`: Records password updates.
- `ACCOUNT_DELETION`: Records permanent user purge events.
