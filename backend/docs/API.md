# API.md - Clinic Backend API Specification

## Base Configuration

**Base URL:** `http://localhost:3000/api`  
**Swagger:** `http://localhost:3000/docs`  
**Auth:** JWT Bearer Token  
**Global Prefix:** `/api`

---

## Authentication

### POST /auth/login
Login and receive tokens.

**Request:**
```json
{
  "login": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "eyJhbG...",
  "user": {
    "id": 1,
    "full_name": "Admin",
    "login": "admin",
    "role": "ADMIN"
  }
}
```

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "eyJhbG..."
}
```

### POST /auth/logout
Logout and invalidate tokens.

### GET /auth/me
Get current user info.

---

## Users Module

### POST /users
Create new user.

**Request:**
```json
{
  "role_id": 1,
  "full_name": "John Doe",
  "login": "johndoe",
  "password": "SecurePass123!",
  "phone": "+998901234567",
  "email": "john@example.com",
  "description": "Doctor"
}
```

**Response:**
```json
{
  "id": 2,
  "role_id": 1,
  "full_name": "John Doe",
  "login": "johndoe",
  "phone": "+998901234567",
  "email": "john@example.com",
  "description": "Doctor",
  "status": "ACTIVE",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "deleted_at": null
}
```

### GET /users
Get all users (non-deleted).

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "Admin",
    "login": "admin",
    "role_id": 1,
    "status": "ACTIVE"
  }
]
```

### GET /users/:id
Get user by ID.

### PATCH /users/:id
Update user.

**Request:**
```json
{
  "full_name": "John Updated",
  "phone": "+998909876543"
}
```

### DELETE /users/:id
Soft delete user (sets deleted_at).

---

## User Roles Module

### POST /user-roles
Create new role.

**Request:**
```json
{
  "name": "DOCTOR",
  "description": "Medical doctor",
  "permissions": {
    "visits": ["read", "create", "update"],
    "clients": ["read"]
  }
}
```

### GET /user-roles
Get all roles.

### GET /user-roles/:id
Get role by ID.

### PATCH /user-roles/:id
Update role.

### DELETE /user-roles/:id
Soft delete role.

---

## Regions Module

### POST /regions
Create new region.

**Request:**
```json
{
  "name": "Toshkent"
}
```

### GET /regions
Get all regions.

### GET /regions/:id
Get region by ID.

### PATCH /regions/:id
Update region.

### DELETE /regions/:id
Soft delete region.

---

## Districts Module

### POST /districts
Create new district.

**Request:**
```json
{
  "name": "Yunusobod",
  "region_id": 1
}
```

### GET /districts
Get all districts (optionally filter by region_id).

**Query Params:**
- `region_id` (optional) - Filter by region

### GET /districts/:id
Get district by ID.

### PATCH /districts/:id
Update district.

### DELETE /districts/:id
Soft delete district.

---

## Sources Module

### POST /sources
Create new source.

**Request:**
```json
{
  "name": "Instagram",
  "description": "Social media"
}
```

### GET /sources
Get all sources.

### GET /sources/:id
Get source by ID.

### PATCH /sources/:id
Update source.

### DELETE /sources/:id
Soft delete source.

---

## Client Groups Module

### POST /client-groups
Create new client group.

**Request:**
```json
{
  "name": "VIP",
  "description": "VIP clients"
}
```

### GET /client-groups
Get all client groups.

### GET /client-groups/:id
Get client group by ID.

### PATCH /client-groups/:id
Update client group.

### DELETE /client-groups/:id
Soft delete client group.

---

## Departments Module

### POST /departments
Create new department.

**Request:**
```json
{
  "name": "Dentistry",
  "description": "Dental services"
}
```

### GET /departments
Get all departments.

### GET /departments/:id
Get department by ID.

### PATCH /departments/:id
Update department.

### DELETE /departments/:id
Soft delete department.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "phone", "message": "Invalid phone format" }
    ]
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input data |
| `NOT_FOUND` | Resource not found |
| `UNAUTHORIZED` | Invalid or missing token |
| `FORBIDDEN` | Insufficient permissions |
| `CONFLICT` | Resource already exists |
| `INTERNAL_ERROR` | Server error |

---

## Headers

**Required Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Optional Headers:**
```
X-Request-ID: <uuid>  // For tracing
```

---

## Query Parameters

**Common Query Params:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (default: created_at)
- `order` - Sort order: asc/desc (default: desc)
- `search` - Search term (for text search)
- `status` - Filter by status: ACTIVE/INACTIVE/ARCHIVED

**Example:**
```
GET /users?page=1&limit=10&sort=full_name&order=asc&status=ACTIVE
```

---

## DTOs (Data Transfer Objects)

### CreateUserDto
```typescript
{
  role_id?: number
  full_name: string (max 100)
  login: string (max 50, unique)
  password: string (min 8)
  phone?: string (max 20)
  email?: string (max 100, unique)
  description?: string
}
```

### UpdateUserDto
```typescript
{
  role_id?: number
  full_name?: string
  password?: string
  phone?: string
  email?: string
  description?: string
}
```

### CreateRegionDto
```typescript
{
  name: string (max 100, unique)
}
```

### UpdateRegionDto
```typescript
{
  name?: string
}
```

### CreateDistrictDto
```typescript
{
  name: string (max 100)
  region_id?: number
}
```

---

## Validation Rules

**String Fields:**
- `@IsString()` - Must be string
- `@MaxLength(n)` - Maximum length
- `@MinLength(n)` - Minimum length

**Number Fields:**
- `@IsInt()` - Must be integer
- `@Min(n)` - Minimum value
- `@Max(n)` - Maximum value

**Optional Fields:**
- `@IsOptional()` - Field is optional

**Enum Fields:**
- `@IsEnum(EnumName)` - Must be enum value

**Date Fields:**
- `@IsDateString()` - ISO 8601 format

---

## Future Modules (To Implement)

### Clients Module
```
POST   /clients           - Create client
GET    /clients           - List clients
GET    /clients/:id       - Get client
PATCH  /clients/:id       - Update client
DELETE /clients/:id       - Soft delete
GET    /clients/:id/visits    - Client visits
GET    /clients/:id/payments  - Client payments
```

### Visits Module
```
POST   /visits                  - Create visit
GET    /visits                  - List visits
GET    /visits/:id              - Get visit
PATCH  /visits/:id/status       - Update status
POST   /visits/:id/services     - Add service
POST   /visits/:id/rooms        - Assign room
POST   /visits/:id/payments     - Add payment
```

### Services Module
```
POST   /services          - Create service
GET    /services          - List services
GET    /services/:id      - Get service
PATCH  /services/:id      - Update service
DELETE /services/:id      - Soft delete
```

### Payments Module
```
POST   /payments          - Create payment
GET    /payments          - List payments
GET    /payments/:id      - Get payment
POST   /client-paid       - Prepayment
POST   /other-paid        - Other income/expense
GET    /reports/finance   - Financial report
```

---

## Rate Limiting (TODO)

**Default Limits:**
- 100 requests per minute per IP
- 1000 requests per hour per user

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

---

## CORS Configuration

**Allowed Origins:**
- `http://localhost:3001` (Frontend dev)
- `http://localhost:5173` (Vite dev)

**Allowed Methods:** GET, POST, PATCH, DELETE  
**Allowed Headers:** Content-Type, Authorization  
**Credentials:** true (cookies)

---

## File Upload (TODO)

**Endpoint:** `POST /files/upload`  
**Max Size:** 5MB  
**Allowed Types:** image/jpeg, image/png, application/pdf

**Response:**
```json
{
  "url": "https://storage.example.com/files/abc123.jpg",
  "filename": "original.jpg",
  "size": 1024000
}
```
