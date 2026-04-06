# Auth Module - Autentifikatsiya va Avtorizatsiya

## 📋 Umumiy Ma'lumot

**Module:** `AuthModule`  
**Phase:** 1 - Foundation  
**Status:** ✅ Completed  
**Yaratilgan:** 2024-01-15

---

## 🔐 Auth Endpoints

| Method | Endpoint | Auth | Tavsif |
|--------|----------|------|--------|
| POST | `/auth/login` | ❌ | Login (autentifikatsiya) |
| POST | `/auth/refresh` | ❌ | Refresh token |
| POST | `/auth/logout` | ✅ | Logout |
| POST | `/auth/change-password` | ✅ | Parol o'zgartirish |
| GET | `/auth/me` | ✅ | O'z profilini olish |

---

## 📝 Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "login": "admin",
  "password": "Admin@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Muvaffaqiyatli kirish",
  "data": {
    "user": {
      "id": 1,
      "full_name": "System Administrator",
      "login": "admin",
      "email": "admin@clinic.com",
      "phone": "+998900000000",
      "role": {
        "id": 1,
        "name": "ADMIN",
        "permissions": { "all": true }
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m",
    "tokenType": "Bearer"
  }
}
```

---

## 🔄 Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m",
    "tokenType": "Bearer"
  }
}
```

---

## 🚪 Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Muvaffaqiyatli chiqish"
}
```

---

## 🔑 Change Password

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "old_password": "Admin@123",
  "new_password": "NewAdmin@456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Parol muvaffaqiyatli o'zgartirildi"
}
```

**Password Talablari:**
- Kamida 8 belgi
- Kamida 1 ta katta harf (A-Z)
- Kamida 1 ta kichik harf (a-z)
- Kamida 1 ta raqam (0-9)
- Kamida 1 ta maxsus belgi (!@#$%^&*)

---

## 👤 Get Current User (Me)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "System Administrator",
    "login": "admin",
    "email": "admin@clinic.com",
    "phone": "+998900000000",
    "role_id": 1,
    "role": {
      "id": 1,
      "name": "ADMIN",
      "permissions": { "all": true }
    },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

---

## ⚠️ Error Codes

| Kod | HTTP Status | Xabar | Sabab |
|-----|-------------|-------|-------|
| `AUTH_001` | 401 | Login yoki parol noto'g'ri | Authentication failed |
| `AUTH_002` | 403 | Account blokirovka qilingan | User status !== ACTIVE |
| `AUTH_003` | 401 | Noto'g'ri token turi | Token type mismatch |
| `AUTH_005` | 404 | Foydalanuvchi topilmadi | User ID not exists |
| `AUTH_006` | 400 | Eski parol noto'g'ri | Password mismatch |
| `AUTH_007` | 400 | Yangi parol juda zaif | Password validation failed |
| `AUTH_008` | 401 | Token noto'g'ri yoki amal qilmaydi | Invalid token |

---

## 🛡️ JWT Token Struktura

**Access Token Payload:**
```json
{
  "sub": 1,
  "login": "admin",
  "role_id": 1,
  "role_name": "ADMIN",
  "type": "access",
  "iat": 1704067200,
  "exp": 1704068100
}
```

**Refresh Token Payload:**
```json
{
  "sub": 1,
  "type": "refresh",
  "iat": 1704067200,
  "exp": 1704672000
}
```

---

## 📦 Default Admin Credentials

```
Login: admin
Password: Admin@123
```

> ⚠️ **Muhim:** Production'da bu parolni darhol o'zgartiring!

---

## 🧪 Test qilish

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"Admin@123"}'

# 2. Get Me (access token kerak)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"

# 3. Refresh Token
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token>"}'

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <access_token>"

# 5. Change Password
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"old_password":"Admin@123","new_password":"NewAdmin@456"}'
```

---

## 📁 Module Structure

```
src/modules/auth/
├── dto/
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   └── change-password.dto.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts

src/common/
├── guards/
│   └── jwt-auth.guard.ts
└── strategies/
    └── jwt.strategy.ts
```

---

## 🔧 Configuration

**.env:**
```env
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

---

## 📝 Keyingi Qadamlar

- [ ] Redis blacklist implementatsiyasi (logout qilingan tokenlar uchun)
- [ ] Rate limiting (login uchun 5 urinish/15 daqiqa)
- [ ] Login history/audit log
- [ ] Two-factor authentication (2FA)
- [ ] Password reset via email
