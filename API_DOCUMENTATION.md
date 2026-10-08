# SquadUp — API Documentation

**Base URL**: `http://localhost:5500`  
**Interactive Swagger UI**: `http://localhost:5500/api/docs`  
**SOAP WSDL Service**: `http://localhost:5500/soap/players.wsdl`  
**Real-Time STOMP WebSocket**: `ws://localhost:5500/ws`

---

## 1. Response & Error Envelope Format

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response Structure (RFC 7807 Compliant)
```json
{
  "error": "Human readable error description",
  "status": 400,
  "path": "/api/v1/squads",
  "requestId": "a1b2c3d4",
  "timestamp": "2026-10-08T14:30:00Z",
  "fieldErrors": {
    "name": "Squad name must be between 3 and 100 characters"
  }
}
```

---

## 2. Authentication & Authorization

All endpoints except `/api/v1/auth/register`, `/api/v1/auth/login`, and `/api/docs` require an HTTP header:
```http
Authorization: Bearer <64_character_hex_token>
```

---

## 3. REST API Endpoint Reference

### 3.1. Authentication Module

#### `POST /api/v1/auth/register`
- **Purpose**: Register a new player account.
- **Authentication**: None (Public).
- **Request Body**:
```json
{
  "username": "sniperking",
  "email": "sniperking@example.com",
  "password": "password123"
}
```
- **Response**: `201 Created`
```json
{
  "id": 1,
  "username": "sniperking",
  "email": "sniperking@example.com",
  "displayName": "sniperking",
  "bio": "",
  "gameTags": [],
  "region": "",
  "language": "",
  "playstyle": ""
}
```
- **Errors**: `400 Bad Request` (validation failure), `409 Conflict` (username or email taken).

---

#### `POST /api/v1/auth/login`
- **Purpose**: Authenticate player credentials and receive a stateless bearer token.
- **Authentication**: None (Public).
- **Request Body**:
```json
{
  "username": "sniperking",
  "password": "password123"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "token": "aeaee432a6d30b6277075cde704402fb1ab83938fcef31359c38525eac2ab347",
  "user": {
    "id": 1,
    "username": "sniperking",
    "email": "sniperking@example.com",
    "displayName": "sniperking",
    "gameTags": ["Valorant", "Apex Legends"],
    "region": "NA",
    "language": "English",
    "playstyle": "Competitive"
  }
}
```
- **Errors**: `401 Unauthorized` (invalid username or password).

---

#### `POST /api/v1/auth/logout`
- **Purpose**: Invalidate current bearer authentication token.
- **Authentication**: Bearer Token.
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3.2. User Management Module

#### `GET /api/v1/users`
- **Purpose**: Retrieve paged directory of players.
- **Authentication**: Bearer Token.
- **Parameters**: `page` (default 0), `size` (default 10), `sort` (e.g., `username,asc`).
- **Response**: `200 OK` (Spring Data `Page<UserSummary>`).

---

#### `GET /api/v1/users/search`
- **Purpose**: Search players by username substring with pagination.
- **Authentication**: Bearer Token.
- **Parameters**: `username` (string, required), `page`, `size`.
- **Response**: `200 OK` (`Page<UserSummary>`).

---

#### `GET /api/v1/users/{id}`
- **Purpose**: Get detailed player profile.
- **Authentication**: Bearer Token.
- **Parameters**: `id` (path, required).
- **Response**: `200 OK` (`UserDto`).
- **Errors**: `404 Not Found`.

---

#### `PUT /api/v1/users/{id}`
- **Purpose**: Update own profile details (gameTags, bio, language, playstyle).
- **Authentication**: Bearer Token (Enforced by `AccessGuard`: caller must match `{id}`).
- **Request Body**:
```json
{
  "displayName": "ViperMain",
  "bio": "Climbing immortal in Valorant",
  "gameTags": ["Valorant", "CS:GO"],
  "region": "NA",
  "language": "English",
  "playstyle": "Competitive"
}
```
- **Response**: `200 OK` (`UserDto`).
- **Errors**: `403 Forbidden` (modifying another user's profile).

---

#### `DELETE /api/v1/users/{id}`
- **Purpose**: Cascade delete own user account and related associations.
- **Authentication**: Bearer Token (Caller must match `{id}`).
- **Response**: `204 No Content`.

---

### 3.3. Squad Lobbies Module

#### `GET /api/v1/squads`
- **Purpose**: Search and filter squad lobbies dynamically using JPA Criteria API.
- **Authentication**: Bearer Token.
- **Parameters**: `q` (search query), `game`, `language`, `openOnly` (boolean), `page`, `size`, `sort`.
- **Response**: `200 OK` (`Page<SquadDto>`).

---

#### `GET /api/v1/squads/browse/filter;game={g};language={l};openOnly={o}`
- **Purpose**: Dynamic squad discovery using Spring Matrix Variables.
- **Authentication**: Bearer Token.
- **Matrix Variables**: `game`, `language`, `openOnly`.
- **Response**: `200 OK` (`List<SquadDto>`).

---

#### `GET /api/v1/squads/recommended?limit=5`
- **Purpose**: Receive AI-weighted squad recommendations tailored to player profile.
- **Authentication**: Bearer Token.
- **Algorithm**: $50\%$ Game $+ 30\%$ Language $+ 20\%$ Playstyle Match.
- **Response**: `200 OK`
```json
[
  {
    "squad": {
      "id": 12,
      "name": "Radiant Push",
      "game": "Valorant",
      "language": "English",
      "playstyle": "Competitive",
      "maxMembers": 5,
      "members": [...]
    },
    "score": 100,
    "reasons": ["Same game: Valorant", "Same language: English", "Matching playstyle: Competitive"]
  }
]
```

---

#### `POST /api/v1/squads`
- **Purpose**: Create a new squad lobby.
- **Authentication**: Bearer Token.
- **Request Body**:
```json
{
  "name": "Night Owls",
  "game": "Valorant",
  "language": "English",
  "playstyle": "Competitive",
  "maxMembers": 5
}
```
- **Response**: `201 Created` (`Location: /api/v1/squads/{id}`).

---

#### `POST /api/v1/squads/{id}/join`
- **Purpose**: Join an open squad lobby with pessimistic write lock concurrency protection.
- **Authentication**: Bearer Token.
- **Response**: `200 OK` (`SquadDto`).
- **Errors**: `409 Conflict` (Lobby is full or user already joined).

---

#### `DELETE /api/v1/squads/{id}`
- **Purpose**: Leave squad or delete squad if host.
- **Authentication**: Bearer Token.
- **Response**: `204 No Content`.

---

### 3.4. Squads API v2 (Content Negotiation & Versioning)

- **Endpoints**:
  - `GET /api/v2/squads`
  - `GET /api/squads` with header `X-API-Version: 2`
- **Purpose**: Returns lightweight, compact representations designed for mobile clients.

---

### 3.5. Social & Friends Module

#### `GET /api/v1/friends/{userId}`
- **Purpose**: List accepted friends of the logged-in user.
- **Authentication**: Bearer Token (Caller must match `{userId}`).
- **Response**: `200 OK` (`List<UserSummary>`).

---

#### `GET /api/v1/friends/pending/{userId}`
- **Purpose**: Retrieve incoming pending friend requests.
- **Authentication**: Bearer Token (Caller must match `{userId}`).
- **Response**: `200 OK` (`List<FriendshipDto>`).

---

#### `POST /api/v1/friends/request`
- **Purpose**: Send a friend request by username.
- **Authentication**: Bearer Token.
- **Request Body**:
```json
{
  "recipientUsername": "neon_ninja"
}
```
- **Response**: `200 OK` (`FriendshipDto`).

---

#### `POST /api/v1/friends/respond`
- **Purpose**: Accept or reject a pending friend request.
- **Authentication**: Bearer Token.
- **Request Body**:
```json
{
  "friendshipId": 42,
  "action": "accept"
}
```
- **Response**: `200 OK`. Dispatches live notification to `/user/queue/friends`.

---

#### `DELETE /api/v1/friends/{friendshipId}`
- **Purpose**: Remove an existing friendship.
- **Authentication**: Bearer Token.
- **Response**: `204 No Content`.

---

### 3.6. Real-Time Chat & History

#### `GET /api/v1/chat/history/{roomId}?limit=50`
- **Purpose**: Fetch message history for authorized room members.
- **Authentication**: Bearer Token.
- **Response**: `200 OK` (`List<ChatMessageDto>`).

#### STOMP Destinations:
- **Client Publish**: `/app/chat.send` -> `{ "roomId": "squad_1", "text": "hello team" }`
- **Typing Indicator**: `/app/chat.typing` -> `{ "roomId": "squad_1", "typing": true }`
- **Room Subscription**: `/topic/room.{roomId}` -> Broadcasts filtered messages.
- **User Alerts**: `/user/queue/friends` -> Dispatches social updates.

---

### 3.7. Analytics & Platform Statistics

#### `GET /api/v1/stats?topGames=5`
- **Purpose**: Retrieve platform-wide metrics via raw high-speed SQL in `PlatformStatsDao`.
- **Authentication**: Bearer Token.
- **Response**: `200 OK`
```json
{
  "totalSquads": 18,
  "totalUsers": 20,
  "activeUsers": 15,
  "topGames": [
    { "game": "Valorant", "squadCount": 6 },
    { "game": "CS:GO", "squadCount": 5 },
    { "game": "Apex Legends", "squadCount": 4 },
    { "game": "League of Legends", "squadCount": 3 }
  ]
}
```

---

### 3.8. Contract-First SOAP XML Web Service

- **Endpoint**: `POST /soap`
- **WSDL URL**: `http://localhost:5500/soap/players.wsdl`
- **Namespace**: `http://squadup.com/soap/players`
- **Operations**:
  1. `getPlayerRequest` -> returns `getPlayerResponse` containing player metadata.
  2. `searchPlayersRequest` -> returns `searchPlayersResponse` containing matching player summaries.
