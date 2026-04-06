# 📋 RFC-008: Autentifikatsiya va Avtorizatsiya Boshqaruvi (Auth Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-008 |
| **Nomi** | Auth Management |
| **Phase** | 1 - Foundation |
| **Model** | `User`, `UserRole` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Security) |
| **Bog'liq RFC** | RFC-001 (UserRole), RFC-002 (User) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Section 8 - Xavfsizlik) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC tizimga xavfsiz kirish (autentifikatsiya) va foydalanuvchi huquqlarini boshqarish (avtorizatsiya) uchun to'liq texnik specifikatsiyani taqdim etadi. JWT token orqali sessiyani boshqarish, parol xavfsizligini ta'minlash va har bir so'rovni autentifikatsiya qilish.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Login (autentifikatsiya) | ❌ Password reset via email |
| ✅ Token refresh | ❌ Two-factor authentication |
| ✅ Logout (token blacklist) | ❌ Social login (Google, etc.) |
| ✅ Password change | ❌ OAuth integratsiya |
| ✅ Protected route guard | ❌ Frontend implementatsiya |
| ✅ RBAC (Role-Based Access Control) | |
| ✅ Permissions based access | |

### 1.3 Biznes Qiymati
- Tizim xavfsizligini ta'minlash (Reference: `Klinika.md` 8.1)
- Har bir harakatni audit qilish (kim kirgan/kim o'zgartirgan)
- Rol asosida ruxsatlarni boshqarish (RBAC)
- Session hijacking oldini olish
- Brute force attacklardan himoya
- Klinika ma'lumotlarini himoya qilish (HIPAA/GDPR compliance)

---

## 2. PRISMA MODEL (Reference: `klinika_prisma.txt`)

### 2.1 User Model (Auth uchun asosiy)

```prisma
model User {
  id          Int          @id @default(autoincrement())
  role_id     Int?         @map("role_id")
  full_name   String       @db.VarChar(100)
  login       String       @db.VarChar(50)
  password    String       @db.VarChar(255)
  phone       String?      @db.VarChar(20)
  email       String?      @db.VarChar(100)
  description String?      @db.Text
  status      RecordStatus @default(ACTIVE)
  created_at  Timestamptz  @default(now())
  updated_at  Timestamptz  @updatedAt
  deleted_at  Timestamptz?

  // Relations
  role        UserRole?    @relation("fk_user_role", fields: [role_id], references: [id], onDelete: SetNull, onUpdate: Cascade)

  // Audit relations - Modified
  modified_clients      Client[]      @relation("fk_client_modified_by")
  modified_visits       Visit[]       @relation("fk_visit_modified_by")
  modified_payments     Payment[]     @relation("fk_payment_modified_by")
  // ... (boshqa audit relations)

  // Business relations
  doctor_visits         Visit[]       @relation("fk_visit_doctor")
  user_payments         Payment[]     @relation("fk_payment_user")
  service_users         ServiceUser[] @relation("fk_service_user_user")

  @@index([role_id])
  @@index([login])
  @@index([status])
  @@index([created_at])
  @@index([deleted_at])
  @@unique([login])
  @@unique([email])
  @@map("users")
}
```

### 2.2 UserRole Model (Permissions uchun)

```prisma
model UserRole {
  id          Int          @id @default(autoincrement())
  name        String       @db.VarChar(50)
  description String?      @db.Text
  permissions Json?        @db.JsonB
  status      RecordStatus @default(ACTIVE)
  created_at  Timestamptz  @default(now())
  updated_at  Timestamptz  @updatedAt
  deleted_at  Timestamptz?

  users User[] @relation("fk_user_role")

  @@index([status])
  @@index([name])
  @@map("user_roles")
}
```

### 2.3 Model Maydonlari Tafsiloti (Auth uchun muhim)

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `login` | String | ✅ | - | VARCHAR(50) | **Kirish logini**. Unikal, 3-50 belgi. Autentifikatsiya uchun asosiy maydon (Reference: `Klinika.md` 3.1) |
| `password` | String | ✅ | - | VARCHAR(255) | **Hash qilingan parol**. bcrypt bilan shifrlangan (salt rounds: 10). Hech qachon plain text saqlanmaydi (Reference: `Klinika.md` 8.1) |
| `email` | String | ❌ | null | VARCHAR(100) | **Email manzil**. Unikal, valid email format. Login uchun alternativ sifatida ishlatilishi mumkin |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE bo'lmagan userlar kira olmaydi (Reference: `Klinika.md` 3.1) |
| `role_id` | Int | ❌ | null | INTEGER | **Foreign Key**. UserRole jadvaliga bog'lanish. User ruxsatlarini aniqlash uchun (RBAC) |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Audit uchun muhim (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan (Reference: `Klinika.md` 8.1) |

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([role_id])` | role_id | Rol bo'yicha filter qilishni tezlashtirish |
| `@@index([login])` | login | Login bo'yicha qidiruvni tezlashtirish (autentifikatsiya uchun muhim) |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv userlar) |
| `@@index([created_at])` | created_at | Yaratilgan vaqt bo'yicha sort/filter (audit uchun) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@unique([login])` | login | Login unikal bo'lishini ta'minlash (database level constraint) |
| `@@unique([email])` | email | Email unikal bo'lishini ta'minlash (database level constraint) |

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_user_role` | UserRole | N:1 | SetNull | Cascade | Rol o'chirilganda userning role_id NULL ga o'zgaradi. User ma'lumoti saqlanib qoladi |
| `fk_client_modified_by` | Client | 1:N | SetNull | Cascade | User o'chirilganda client.modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi (Reference: `Klinika.md` 5.2) |
| `fk_client_registered_by` | Client | 1:N | SetNull | Cascade | User o'chirilganda client.registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_visit_doctor` | Visit | 1:N | SetNull | Cascade | User o'chirilganda visit.doctor_id NULL ga o'zgaradi. Visit tarixi saqlanadi |
| `fk_payment_user` | Payment | 1:N | SetNull | Cascade | User o'chirilganda payment.user_id NULL ga o'zgaradi. Moliya tarixi saqlanadi |

---

## 3. ENUM TUZILISHI (Reference: `klinika_prisma.txt`)

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - user tizimga kira oladi
  INACTIVE    // ⏸️ Nofaol - user vaqtincha blokirovka qilingan
  ARCHIVED    // 📦 Arxiv - user tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | User to'liq ishlaydi | Yangi user yaratilganda default. Tizimga kira oladi (Reference: `Klinika.md` 3.1) |
| `INACTIVE` | User vaqtincha o'chirilgan | Ta'til, kasallik, intizomiy jazolar uchun |
| `ARCHIVED` | User arxivlangan | Ishdan bo'shagan, lekin tarix uchun saqlanadi |

### 3.2 Status O'zgarish Qoidalari

```
ACTIVE → INACTIVE  ✅ Ruxsat etiladi (Admin tomonidan)
ACTIVE → ARCHIVED  ✅ Ruxsat etiladi (Ishdan bo'shaganda)
INACTIVE → ACTIVE  ✅ Ruxsat etiladi (Qayta faollashtirish)
INACTIVE → ARCHIVED ✅ Ruxsat etiladi
ARCHIVED → ACTIVE  ⚠️ Faqat Admin ruxsati bilan
ARCHIVED → INACTIVE ✅ Ruxsat etiladi
```

### 3.3 JWT Token Types

```typescript
enum TokenType {
  ACCESS = 'access',    // 24 soat amal qiladi
  REFRESH = 'refresh'   // 7 kun amal qiladi
}
```

| Token Type | Expiry | Maqsad |
|------------|--------|--------|
| `access` | 24 soat | API so'rovlari uchun autentifikatsiya |
| `refresh` | 7 kun | Access token yangilash uchun |

---

## 4. API SPECIFIKATSIYASI

### 4.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/auth/login` | ❌ | Barchasi | Login (autentifikatsiya) |
| 2 | POST | `/api/v1/auth/refresh` | ❌ | Barchasi | Token refresh |
| 3 | POST | `/api/v1/auth/logout` | ✅ JWT | Barchasi | Logout |
| 4 | POST | `/api/v1/auth/change-password` | ✅ JWT | Barchasi | Password o'zgartirish |
| 5 | GET | `/api/v1/auth/me` | ✅ JWT | Barchasi | O'z profilini olish |

---

### 4.2 POST /api/v1/auth/login

**Tavsif:** Foydalanuvchi autentifikatsiyasi va JWT token olish

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```typescript
interface LoginDto {
  login: string;    // Login yoki email
  password: string; // Parol
}
```

**Request Body Example:**
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
      "role": {
        "id": 1,
        "name": "Admin",
        "permissions": {
          "client": { "create": true, "read": true, "update": true, "delete": true },
          "visit": { "create": true, "read": true, "update": true, "delete": true },
          "payment": { "create": true, "read": true, "update": true, "delete": true }
        }
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "tokenType": "Bearer"
  }
}
```

**Service Layer Implementation:**
```typescript
// auth.service.ts
async login(loginDto: LoginDto, ipAddress: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  // 1. Rate limit tekshirish (Reference: Klinika.md 8.1)
  const attempts = await this.cacheService.get(`login_attempts:${ipAddress}`);
  if (attempts >= 5) {
    throw new TooManyRequestsException('AUTH_010');
  }

  // 2. User topish (login yoki email orqali)
  const user = await this.prisma.user.findFirst({
    where: {
      OR: [
        { login: loginDto.login },
        { email: loginDto.login }
      ],
      deleted_at: null
    },
    include: {
      role: {
        select: { id: true, name: true, permissions: true }
      }
    }
  });

  if (!user) {
    await this.cacheService.increment(`login_attempts:${ipAddress}`, { ttl: 900 });
    throw new UnauthorizedException('AUTH_001');
  }

  // 3. Status tekshirish (Reference: Klinika.md 3.1)
  if (user.status !== 'ACTIVE') {
    throw new ForbiddenException('AUTH_002');
  }

  // 4. Password tekshirish (Reference: Klinika.md 8.1)
  const isValid = await bcrypt.compare(loginDto.password, user.password);
  if (!isValid) {
    await this.cacheService.increment(`login_attempts:${ipAddress}`, { ttl: 900 });
    throw new UnauthorizedException('AUTH_001');
  }

  // 5. Rate limit reset
  await this.cacheService.del(`login_attempts:${ipAddress}`);

  // 6. JWT Access Token yaratish
  const accessToken = this.jwtService.sign({
    sub: user.id,
    login: user.login,
    role_id: user.role_id,
    role_name: user.role?.name,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 soat
  });

  // 7. JWT Refresh Token yaratish
  const refreshToken = this.jwtService.sign({
    sub: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 kun
  });

  // 8. Refresh token saqlash (Redis)
  await this.cacheService.set(`refresh_token:${user.id}`, refreshToken, { ttl: 604800 });

  // 9. Password response dan olib tashlash
  delete user.password;

  return { user, accessToken, refreshToken };
}
```

**Rate Limiting Configuration:**
```typescript
// Reference: Klinika.md 8.1
{
  maxAttempts: 5,        // 5 ta urinish
  lockoutTime: 900000,   // 15 daqiqa blok
  trackBy: 'ip_address'  // IP address bo'yicha kuzatish
}
```

---

### 4.3 POST /api/v1/auth/refresh

**Tavsif:** Access token yangilash (refresh token orqali)

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```typescript
interface RefreshTokenDto {
  refreshToken: string;
}
```

**Request Body Example:**
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
    "expiresIn": 86400,
    "tokenType": "Bearer"
  }
}
```

**Service Layer Implementation:**
```typescript
async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
  // 1. Refresh token validate qilish
  const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
    secret: process.env.JWT_REFRESH_SECRET
  });

  // 2. Token type tekshirish
  if (payload.type !== 'refresh') {
    throw new UnauthorizedException('AUTH_003');
  }

  // 3. Redis dan token tekshirish
  const storedToken = await this.cacheService.get(`refresh_token:${payload.sub}`);
  if (!storedToken || storedToken !== refreshTokenDto.refreshToken) {
    throw new UnauthorizedException('AUTH_004');
  }

  // 4. User mavjudligini va active ekanligini tekshirish
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    include: { role: true }
  });

  if (!user || user.deleted_at || user.status !== 'ACTIVE') {
    await this.cacheService.del(`refresh_token:${payload.sub}`);
    throw new ForbiddenException('AUTH_002');
  }

  // 5. Yangi access token yaratish
  const accessToken = this.jwtService.sign({
    sub: user.id,
    login: user.login,
    role_id: user.role_id,
    role_name: user.role?.name,
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  });

  // 6. Yangi refresh token yaratish
  const newRefreshToken = this.jwtService.sign({
    sub: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  });

  // 7. Eski refresh token o'chirish, yangisini saqlash
  await this.cacheService.del(`refresh_token:${payload.sub}`);
  await this.cacheService.set(`refresh_token:${payload.sub}`, newRefreshToken, { ttl: 604800 });

  return { accessToken, refreshToken: newRefreshToken };
}
```

---

### 4.4 POST /api/v1/auth/logout

**Tavsif:** Logout qilish va tokenlarni blacklist ga qo'shish

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface LogoutDto {
  refreshToken?: string;
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Muvaffaqiyatli chiqish"
}
```

**Service Layer Implementation:**
```typescript
async logout(userId: number, refreshToken?: string): Promise<void> {
  // 1. Refresh token blacklist ga qo'shish
  if (refreshToken) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
      ignoreExpiration: true
    });
    
    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn > 0) {
      await this.cacheService.set(`blacklist:${refreshToken}`, 'true', { 
        ttl: Math.floor(expiresIn / 1000) 
      });
    }
  }

  // 2. User refresh token o'chirish
  await this.cacheService.del(`refresh_token:${userId}`);
}
```

---

### 4.5 POST /api/v1/auth/change-password

**Tavsif:** Parolni o'zgartirish

**Request Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface ChangePasswordDto {
  old_password: string;
  new_password: string;
}
```

**Request Body Example:**
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

**Service Layer Implementation:**
```typescript
async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
  // 1. User topish
  const user = await this.prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.deleted_at) {
    throw new NotFoundException('AUTH_005');
  }

  // 2. Eski password tekshirish
  const isValid = await bcrypt.compare(changePasswordDto.old_password, user.password);
  if (!isValid) {
    throw new BadRequestException('AUTH_006');
  }

  // 3. Yangi password strength tekshirish (Reference: Klinika.md 8.1)
  const strength = this.validatePasswordStrength(changePasswordDto.new_password);
  if (!strength.valid) {
    throw new BadRequestException({
      code: 'AUTH_007',
      errors: strength.errors
    });
  }

  // 4. Yangi password hash va saqlash (Reference: Klinika.md 8.1)
  const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);
  
  await this.prisma.user.update({
    where: { id: userId },
     {
      password: hashedPassword,
      updated_at: new Date()
    }
  });

  // 5. Barcha refresh tokenlarni o'chirish (security)
  await this.cacheService.del(`refresh_token:${userId}`);
}

private validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Parol kamida 8 belgi bo\'lishi kerak');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Kamida 1 ta katta harf bo\'lishi kerak');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Kamida 1 ta kichik harf bo\'lishi kerak');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Kamida 1 ta raqam bo\'lishi kerak');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Kamida 1 ta maxsus belgi bo\'lishi kerak');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

### 4.6 GET /api/v1/auth/me

**Tavsif:** O'z profilini olish (autentifikatsiya qilingan user uchun)

**Request Headers:**
```http
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
    "role": {
      "id": 1,
      "name": "Admin",
      "permissions": {
        "client": { "create": true, "read": true, "update": true, "delete": true },
        "visit": { "create": true, "read": true, "update": true, "delete": true },
        "payment": { "create": true, "read": true, "update": true, "delete": true }
      }
    },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async getProfile(userId: number): Promise<User> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        select: { id: true, name: true, permissions: true }
      }
    }
  });

  if (!user || user.deleted_at) {
    throw new NotFoundException('AUTH_005');
  }

  delete user.password;
  return user;
}
```

---

## 5. VALIDATSIYA QOIDALARI

### 5.1 Class Validator DTO

```typescript
// login.dto.ts
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Login kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Login 100 belgidan oshmasligi kerak' })
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  password: string;
}

// change-password.dto.ts
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Yangi parol kamida 8 belgi bo\'lishi kerak' })
  @MaxLength(255)
  new_password: string;
}
```

### 5.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `login` | Required | AUTH_011 | Login majburiy |
| `login` | MinLength 3 | AUTH_011 | Login kamida 3 belgi |
| `login` | MaxLength 100 | AUTH_011 | Login 100 belgidan oshmasin |
| `password` | Required | AUTH_001 | Parol majburiy |
| `password` | MinLength 8 | AUTH_007 | Parol kamida 8 belgi |
| `password` | RequireUppercase | AUTH_007 | Kamida 1 katta harf |
| `password` | RequireLowercase | AUTH_007 | Kamida 1 kichik harf |
| `password` | RequireDigit | AUTH_007 | Kamida 1 raqam |
| `password` | RequireSpecial | AUTH_007 | Kamida 1 maxsus belgi |
| `refreshToken` | Required | AUTH_004 | Refresh token majburiy |
| `refreshToken` | Valid JWT | AUTH_004 | Noto'g'ri token format |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `AUTH_001` | 401 Unauthorized | Login yoki parol noto'g'ri | Authentication failed | Ma'lumotlarni tekshiring |
| `AUTH_002` | 403 Forbidden | Account blokirovka qilingan | User status !== ACTIVE | Admin bilan bog'laning |
| `AUTH_003` | 401 Unauthorized | Noto'g'ri token turi | Token type mismatch | To'g'ri token ishlatilsin |
| `AUTH_004` | 401 Unauthorized | Token amal qilish muddati tugagan | Token expired | Refresh token yoki qayta login |
| `AUTH_005` | 404 Not Found | Foydalanuvchi topilmadi | User ID not exists | ID ni tekshiring |
| `AUTH_006` | 400 Bad Request | Eski parol noto'g'ri | Password mismatch | Eski parolni tekshiring |
| `AUTH_007` | 400 Bad Request | Yangi parol juda zaif | Password validation failed | Murakkabroq parol o'ylab toping |
| `AUTH_008` | 401 Unauthorized | Token noto'g'ri yoki amal qilmaydi | Invalid token | Qayta login qiling |
| `AUTH_009` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin bilan bog'laning |
| `AUTH_010` | 429 Too Many Requests | Juda ko'p urinishlar | Rate limit exceeded | 15 daqiqa kuting |
| `AUTH_011` | 400 Bad Request | Login noto'g'ri format | Validation failed | 3-100 belgi kiriting |

### 6.2 Exception Filter

```typescript
// auth-exception.filter.ts
@Catch()
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      status,
      code: this.getErrorCode(exception),
      message: this.getErrorMessage(exception),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(exception: unknown): string {
    if (exception instanceof ConflictException) return 'AUTH_001';
    if (exception instanceof BadRequestException) return 'AUTH_007';
    if (exception instanceof NotFoundException) return 'AUTH_005';
    if (exception instanceof ForbiddenException) return 'AUTH_002';
    if (exception instanceof UnauthorizedException) return 'AUTH_001';
    if (exception instanceof TooManyRequestsException) return 'AUTH_010';
    return 'AUTH_008';
  }
}
```

---

## 7. XAVFSIZLIK TALABLARI (Reference: `Klinika.md` 8.1)

### 7.1 Password Hash

```typescript
// bcrypt konfiguratsiya (Reference: Klinika.md 8.1)
const saltRounds = 10;
const hash = await bcrypt.hash(password, saltRounds);
const isValid = await bcrypt.compare(password, hash);
```

**Talablar:**
- ✅ Algorithm: bcrypt
- ✅ Salt rounds: 10
- ✅ Min length: 8 characters
- ✅ Require uppercase: 1+
- ✅ Require lowercase: 1+
- ✅ Require digit: 1+
- ✅ Require special: 1+ (!@#$%^&*)

### 7.2 JWT Token Configuration

```typescript
// Access Token (Reference: Klinika.md 8.1)
{
  algorithm: 'HS256',
  expiresIn: '24h',
  secret: process.env.JWT_SECRET
}

// Refresh Token
{
  algorithm: 'HS256',
  expiresIn: '7d',
  secret: process.env.JWT_REFRESH_SECRET
}
```

**Token Payload Structure:**
```json
{
  "sub": 1,
  "login": "admin",
  "role_id": 1,
  "role_name": "Admin",
  "type": "access",
  "iat": 1704067200,
  "exp": 1704153600
}
```

### 7.3 Rate Limiting (Login uchun)

```typescript
// Login attempt limit (Reference: Klinika.md 8.1)
const maxAttempts = 5;
const lockoutTime = 15 * 60 * 1000; // 15 daqiqa

// Redis da saqlash
const key = `login_attempts:${ip_address}`;
const attempts = await redis.get(key);

if (attempts >= maxAttempts) {
  throw new TooManyRequestsException('AUTH_010');
}
```

### 7.4 Token Blacklist (Logout uchun)

```typescript
// Logout qilingan tokenlarni blacklist ga qo'shish
await redis.set(`blacklist:${token}`, 'true', {
  EX: tokenExpiryTimestamp
});

// Har bir so'rovda blacklist tekshirish
const isBlacklisted = await redis.get(`blacklist:${token}`);
if (isBlacklisted) {
  throw new UnauthorizedException('AUTH_004');
}
```

### 7.5 HTTPS (Reference: `Klinika.md` 8.1)
- ✅ Barcha so'rovlar HTTPS orqali amalga oshiriladi
- ✅ SSL/TLS sertifikat ishlatiladi
- ✅ HSTS header qo'shiladi

### 7.6 Audit (Reference: `klinika_prisma.txt` & `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `login_attempts` | Login urinishlar | ✅ Redis da saqlanadi |
| `last_login` | Oxirgi kirish | ⏳ Kelajakda qo'shiladi |

### 7.7 RBAC (Reference: `Klinika.md` 6.1)

| Modul | Admin | Doctor | Receptionist | Accountant |
|-------|-------|--------|--------------|------------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Client CRUD | ✅ | ✅ | ✅ | ✅ |
| Visit Create | ✅ | ✅ | ✅ | ✅ |
| Visit Complete | ✅ | ✅ | ❌ | ❌ |
| Payment Create | ✅ | ❌ | ✅ | ✅ |
| Payment View | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ❌ | ❌ | ❌ |

---

## 8. SEED DATA (Reference: `Klinika.md` 3.1)

### 8.1 Boshlang'ich Admin User

```typescript
// seed/auth.seed.ts
import * as bcrypt from 'bcrypt';

export async function seedAuth(prisma: PrismaClient) {
  // Admin user yaratish (Reference: Klinika.md 3.1)
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  
  await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      full_name: 'System Administrator',
      login: 'admin',
      password: adminPassword,
      phone: '+998900000000',
      email: 'admin@clinic.com',
      role_id: 1, // Admin role (RFC-001 dan)
      description: 'Tizim administratori',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Auth seed completed (Admin user created)');
  console.log('⚠️ Production da default parolni o\'zgartirish majburiy!');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat auth
npm run seed:auth
```

### 8.3 Production Checklist

- [ ] Default admin parolini birinchi kirishda o'zgartirish
- [ ] JWT_SECRET va JWT_REFRESH_SECRET environment variable larni sozlash
- [ ] HTTPS sertifikat o'rnatish
- [ ] Rate limit konfiguratsiyasini production uchun sozlash
- [ ] Redis server konfiguratsiyasi

---

## 9. TEST TALABLARI

### 9.1 Unit Test Coverage

| Test Type | Minimum Coverage | Priority |
|-----------|-----------------|----------|
| Service Layer | 90% | 🔴 High |
| Controller Layer | 80% | 🟡 Medium |
| Validation | 95% | 🔴 High |
| Integration | 70% | 🟡 Medium |

### 9.2 Test Cases

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, CacheService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      const dto: LoginDto = { login: 'admin', password: 'Admin@123' };

      prisma.user.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        login: 'admin',
        password: 'hashed_password',
        status: 'ACTIVE',
        role: { id: 1, name: 'Admin' }
      });

      bcrypt.compare = jest.fn().mockResolvedValue(true);
      cacheService.get = jest.fn().mockResolvedValue(null);
      cacheService.set = jest.fn().mockResolvedValue(null);

      const result = await service.login(dto, '127.0.0.1');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.login).toBe('admin');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const dto: LoginDto = { login: 'admin', password: 'Wrong@123' };

      prisma.user.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        login: 'admin',
        password: 'hashed_password',
        status: 'ACTIVE'
      });

      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(service.login(dto, '127.0.0.1')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw TooManyRequestsException on rate limit', async () => {
      const dto: LoginDto = { login: 'admin', password: 'Admin@123' };

      cacheService.get = jest.fn().mockResolvedValue(5);

      await expect(service.login(dto, '127.0.0.1')).rejects.toThrow(TooManyRequestsException);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const dto: ChangePasswordDto = {
        old_password: 'Old@123',
        new_password: 'New@456'
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        password: 'hashed_old_password'
      });

      bcrypt.compare = jest.fn().mockResolvedValue(true);
      bcrypt.hash = jest.fn().mockResolvedValue('hashed_new_password');
      prisma.user.update = jest.fn().mockResolvedValue({});
      cacheService.del = jest.fn().mockResolvedValue(null);

      await expect(service.changePassword(1, dto)).resolves.not.toThrow();
    });
  });
});
```

### 9.3 E2E Test

```typescript
// auth.e2e-spec.ts
describe('Auth (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
  });

  it('/api/v1/auth/login (POST) - Login', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        login: 'admin',
        password: 'Admin@123',
      })
      .expect(200);
  });

  it('/api/v1/auth/refresh (POST) - Refresh token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      })
      .expect(200);
  });

  it('/api/v1/auth/me (GET) - Get profile', () => {
    return request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/auth/change-password (POST) - Change password', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        old_password: 'Admin@123',
        new_password: 'NewAdmin@456',
      })
      .expect(200);
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

```bash
# Development migration (User va UserRole allaqachon mavjud)
npx prisma migrate dev --name add_auth_indexes

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Indexes already exist in klinika_prisma.txt
-- Additional indexes for auth optimization

CREATE INDEX IF NOT EXISTS "users_login_idx" ON "users"("login");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users"("status");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "users_login_key" ON "users"("login");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
```

### 10.3 Environment Variables

```bash
# .env
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Security
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_MAX_ATTEMPTS=5
RATE_LIMIT_TTL=900
```

### 10.4 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "add_auth_indexes"

# Manual rollback (emergency)
-- No table drop needed (User and UserRole already exist)
-- Only remove indexes if needed
DROP INDEX IF EXISTS "users_login_idx";
```

### 10.5 Deployment Checklist

- [ ] Prisma schema tasdiqlandi (Reference: `klinika_prisma.txt`)
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (Admin user)
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor
- [ ] Default admin paroli o'zgartirildi (production)
- [ ] JWT_SECRET va JWT_REFRESH_SECRET sozlangan
- [ ] HTTPS sertifikat o'rnatilgan
- [ ] Redis server konfiguratsiyasi

---

## 11. PERFORMANCE OPTIMALLASHTIRISH

### 11.1 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
@@index([role_id])           // Rol filter uchun
@@index([login])             // Login search uchun (autentifikatsiya uchun muhim)
@@index([status])            // Status filter uchun
@@index([created_at])        // Sort uchun
@@index([deleted_at])        // Soft delete filter uchun
```

### 11.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| User Profile | Redis | 5 daqiqa | User update/delete |
| User Permissions | Redis | 15 daqiqa | Role update |
| Token Blacklist | Redis | Token expiry | Automatic |
| Login Attempts | Redis | 15 daqiqa | Automatic |
| Refresh Tokens | Redis | 7 kun | Logout/Password change |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const user = await prisma.user.findFirst({
  where: { login: loginDto.login, deleted_at: null },
  select: { 
    id: true, 
    login: true, 
    password: true, 
    status: true,
    role_id: true 
  }
});

// ✅ Yaxshi - Include with select
const user = await prisma.user.findFirst({
  where: { login: loginDto.login, deleted_at: null },
  include: {
    role: {
      select: { id: true, name: true, permissions: true }
    }
  }
});

// ❌ Yomon - Barcha maydonlar (password ham!)
const user = await prisma.user.findFirst({
  where: { login: loginDto.login }
});
```

### 11.4 Token Validation Optimization

```typescript
// ✅ Yaxshi - Cache token validation result
async validateToken(token: string): Promise<boolean> {
  // Check blacklist first
  const isBlacklisted = await this.cacheService.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return false;
  }

  // Cache validation result for 5 minutes
  const cacheKey = `token_valid:${token}`;
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return cached === 'true';
  }

  // Validate token
  const isValid = await this.jwtService.verifyAsync(token);
  
  // Cache result
  await this.cacheService.set(cacheKey, isValid ? 'true' : 'false', { ttl: 300 });
  
  return isValid;
}
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `08-auth-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Security Spec | `Klinika.md` Section 8 | ✅ Tasdiqlandi |
| Client RFC | `RFC-009-client-management.md` | ⏳ Keyingi |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Login login yoki email orqali ishlashi
- [ ] Password hash qilingan holda saqlanishi (bcrypt, salt rounds: 10)
- [ ] Password strength validatsiyasi ishlashi (Reference: `Klinika.md` 8.1)
- [ ] JWT access token yaratilishi va 24 soat amal qilishi
- [ ] JWT refresh token yaratilishi va 7 kun amal qilishi
- [ ] Token refresh ishlashi
- [ ] Logout qilinganda token blacklist ga qo'shilishi
- [ ] Password o'zgarganda barcha tokenlar o'chirilishi
- [ ] Rate limiting ishlashi (5 urinish / 15 daqiqa)
- [ ] User status !== ACTIVE bo'lsa login qilolmasligi
- [ ] Protected route'lar JWT bilan himoyalangan bo'lishi
- [ ] RBAC (Role-Based Access Control) ishlashi (Reference: `Klinika.md` 6.1)
- [ ] Permissions based access control ishlashi
- [ ] Audit trail saqlanishi (Reference: `Klinika.md` 5.2)

### 13.2 Non-Functional Requirements

- [ ] API response time < 200ms (Reference: `Klinika.md` 9.1)
- [ ] Database query time < 100ms (Reference: `Klinika.md` 9.1)
- [ ] Login attempt tracking ishlashi
- [ ] Token validation time < 50ms
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq
- [ ] HTTPS enabled (Reference: `Klinika.md` 8.1)

---

## 14. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Password zaif bo'lishi | Yuqori | Yuqori | Strict validation + strength check |
| Brute force attack | O'rta | Yuqori | Rate limiting (5 attempts/15 min) + account lockout |
| Session hijacking | Past | Yuqori | JWT + HTTPS + short expiry + token blacklist |
| User data leak | Past | Yuqori | Password hash + select only needed fields |
| Token replay attack | O'rta | Yuqori | Token blacklist + short expiry |
| SQL Injection | Past | Yuqori | Prisma ORM (parameterized queries) |
| XSS Attack | Past | Yuqori | Input sanitization + output encoding |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Password reset via email | 🟢 Low | Phase 3 |
| Two-factor authentication (2FA) | 🟡 Medium | Phase 4 |
| Social login (Google) | 🟢 Low | Phase 4 |
| Login history/audit | 🟡 Medium | Phase 3 |
| Session management dashboard | 🟢 Low | Phase 3 |
| User avatar/profile picture | 🟢 Low | Phase 4 |
| Remember me functionality | 🟢 Low | Phase 3 |
| Account lockout notification | 🟢 Low | Phase 3 |

---

## 16. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |

---
