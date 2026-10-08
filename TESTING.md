# SquadUp — Testing Documentation & Test Suite Reference

---

## 1. Quick Test Execution Commands

SquadUp features a comprehensive automated test suite consisting of **53 unit and integration tests** covering every layer of the application.

### Run All Tests (Maven Wrapper)
```bash
# Windows PowerShell
.\mvnw.cmd test

# Linux / macOS / Git Bash
./mvnw test
```

### Run a Specific Test Class
```bash
.\mvnw.cmd test -Dtest=SquadFriendChatApiTest
```

### Run Tests with Debug Logging
```bash
.\mvnw.cmd test -Dtest=AopAdviceTest -X
```

---

## 2. Test Architecture & Coverage Breakdown

The 53 automated tests are organized across the 5 curriculum units of the *API & Micro Services* specification:

```
src/test/java/com/squadup/
├── AutowiringAndLoggingTest.java            (Unit I & II: IoC, beans, logging)
├── aop/
│   └── AopAdviceTest.java                  (Unit II: Logging, Performance, Audit AOP)
├── client/
│   └── SquadUpApiClientTest.java           (Unit V: RestTemplate client integration)
├── controller/
│   ├── AuthAndUserApiTest.java             (Unit V: Auth, profiles, pagination, cascade delete)
│   └── SquadFriendChatApiTest.java         (Unit V: Criteria search, join, friends, chat)
├── repository/
│   └── RepositoryTest.java                 (Unit III: Derived queries, custom criteria, JPQL)
├── service/
│   └── ChatModeratorTest.java              (Unit I: Profanity filtering logic)
├── soap/
│   └── PlayerSoapEndpointTest.java         (Unit IV: SOAP contract, JAXB marshalling, faults)
└── websocket/
    └── ChatWebSocketTest.java              (Real-time: STOMP handshake, broadcast, history)
```

---

## 3. Test Suites Overview

| Test Suite | Tests | Purpose |
|---|---|---|
| `AuthAndUserApiTest` | 10 | Validates registration, duplicate constraints, login, token issuance, paged search, profile update, password change, and cascade account deletion. |
| `SquadFriendChatApiTest` | 13 | Validates squad creation, member limits, pessimistic lock joins, leave squad, recommendation ranking, friend request lifecycle, and chat room authorization. |
| `RepositoryTest` | 8 | `@DataJpaTest` validating custom Criteria API filtering, JPQL `@Modifying` queries, and named queries on User and Squad entities. |
| `PlayerSoapEndpointTest` | 4 | Validates SOAP XML request payloads, `getPlayerRequest`, `searchPlayersRequest`, and `@SoapFault` handling. |
| `ChatWebSocketTest` | 2 | End-to-end WebSocket connection over `/ws`, token verification, STOMP message send and room broadcast. |
| `AopAdviceTest` | 7 | Verifies `@Before`, `@Around` latency tracking, `@AfterReturning`, and audit logging behavior. |
| `SquadUpApiClientTest` | 5 | Tests the Spring `RestTemplate` client wrapper against the running application. |
| `AutowiringAndLoggingTest` | 2 | Confirms IoC dependency injection, prototype-scoped `SquadMatcher`, and SLF4J logger configuration. |
| `ChatModeratorTest` | 2 | Unit tests for profanity replacement algorithms. |

---

## 4. Test Output Verification

Execution result sample:
```
[INFO] Results:
[INFO] 
[INFO] Tests run: 53, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```
Reports and detailed surefire logs are saved to `target/surefire-reports/`.
