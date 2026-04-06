# 📋 RFC-002: Foydalanuvchi Boshqaruvi (User Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-002 |
| **Nomi** | User Management |
| **Phase** | 1 - Foundation |
| **Model** | `User` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path) |
| **Bog'liq RFC** | RFC-001 (UserRole) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikani boshqarish tizimida foydalanuvchilarni (User) yaratish, autentifikatsiya, profil boshqaruvi va ruxsatlarni taqsimlash uchun to'liq texnik specifikatsiyani taqdim etadi.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ User yaratish (Create) | ❌ Password reset email (kelajakda) |
| ✅ Login/Logout (Auth) | ❌ Two-factor authentication |
| ✅ User ro'yxatini olish (Read) | ❌ Social login (Google, etc.) |
| ✅ User yangilash (Update) | ❌ OAuth integratsiya |
| ✅ User o'chirish - Soft Delete | ❌ Frontend implementatsiya |
| ✅ Password o'zgartirish | |

### 1.3 Biznes Qiymati
- Tizim xavfsizligini ta'minlash (autentifikatsiya)
- Har bir harakatni audit qilish (kim yaratdi/o'zgartirdi)
- Rol asosida ruxsatlarni boshqarish (RBAC)
- Klinika xodimlarini markazlashtirilgan boshqarish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema

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
  modified_client_paid  ClientPaid[]  @relation("fk_client_paid_modified_by")
  modified_other_paid   OtherPaid[]   @relation("fk_other_paid_modified_by")
  modified_visit_services VisitService[] @relation("fk_visit_service_modified_by")
  modified_visit_rooms  VisitRoom[]   @relation("fk_visit_room_modified_by")
  modified_visit_referrals VisitReferral[] @relation("fk_visit_referral_modified_by")
  modified_service_users ServiceUser[] @relation("fk_service_user_modified_by")
  modified_client_groups ClientGroup[] @relation("fk_client_group_modified_by")
  modified_departments  Department[]  @relation("fk_department_modified_by")
  modified_rooms        Room[]        @relation("fk_room_modified_by")
  modified_services     Service[]     @relation("fk_service_modified_by")
  modified_referrals    Referral[]    @relation("fk_referral_modified_by")
  modified_sources      Source[]      @relation("fk_source_modified_by")
  modified_loc_regions  LocRegion[]   @relation("fk_loc_region_modified_by")
  modified_loc_districts LocDistrict[] @relation("fk_loc_district_modified_by")
  modified_other_paid_groups OtherPaidGroup[] @relation("fk_other_paid_group_modified_by")

  // Audit relations - Registered
  registered_clients    Client[]      @relation("fk_client_registered_by")
  registered_visits     Visit[]       @relation("fk_visit_registered_by")
  registered_payments   Payment[]     @relation("fk_payment_registered_by")
  registered_client_paid ClientPaid[] @relation("fk_client_paid_registered_by")
  registered_other_paid OtherPaid[]   @relation("fk_other_paid_registered_by")
  registered_visit_services VisitService[] @relation("fk_visit_service_registered_by")
  registered_visit_rooms VisitRoom[]  @relation("fk_visit_room_registered_by")
  registered_visit_referrals VisitReferral[] @relation("fk_visit_referral_registered_by")
  registered_service_users ServiceUser[] @relation("fk_service_user_registered_by")
  registered_client_groups ClientGroup[] @relation("fk_client_group_registered_by")
  registered_departments Department[]  @relation("fk_department_registered_by")
  registered_rooms      Room[]        @relation("fk_room_registered_by")
  registered_services   Service[]     @relation("fk_service_registered_by")
  registered_referrals  Referral[]    @relation("fk_referral_registered_by")
  registered_sources    Source[]      @relation("fk_source_registered_by")
  registered_loc_regions LocRegion[]  @relation("fk_loc_region_registered_by")
  registered_loc_districts LocDistrict[] @relation("fk_loc_district_registered_by")
  registered_other_paid_groups OtherPaidGroup[] @relation("fk_other_paid_group_registered_by")

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

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Barcha audit relation'larda ishlatiladi |
| `role_id` | Int | ❌ | null | INTEGER | **Foreign Key**. UserRole jadvaliga bog'lanish. SetNull cascade - rol o'chirilganda null bo'ladi. Admin tomonidan biriktiriladi |
| `full_name` | String | ✅ | - | VARCHAR(100) | **F.I.O**. Foydalanuvchining to'liq ismi, 3-100 belgi. Lotin va Kirill harflari ruxsat etiladi |
| `login` | String | ✅ | - | VARCHAR(50) | **Kirish logini**. Unikal, 3-50 belgi, autentifikatsiya uchun ishlatiladi. Faqat harf, raqam, _ belgilari |
| `password` | String | ✅ | - | VARCHAR(255) | **Hash qilingan parol**. bcrypt/argon2 bilan shifrlangan, 255 belgigacha. Hech qachon plain text saqlanmaydi |
| `phone` | String | ❌ | null | VARCHAR(20) | **Telefon raqam**. +998 formatida (masalan: +998901234567). Aloqa uchun, unikal emas |
| `email` | String | ❌ | null | VARCHAR(100) | **Email manzil**. Valid email format, unikal. Password reset uchun kelajakda ishlatiladi |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha ma'lumot**. Foydalanuvchi haqida qo'shimcha ma'lumot, ixtiyoriy |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (vaqtincha to'xtatilgan), ARCHIVED (arxivlangan) |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |

### 2.3 Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([role_id])` | role_id | Rol bo'yicha filter qilishni tezlashtirish (masalan: barcha doctorlarni olish) |
| `@@index([login])` | login | Login bo'yicha qidiruvni tezlashtirish (autentifikatsiya uchun muhim) |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv userlar) |
| `@@index([created_at])` | created_at | Yaratilgan vaqt bo'yicha sort/filter (hisobotlar uchun) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan userlarni ajratish) |
| `@@unique([login])` | login | Login unikal bo'lishini ta'minlash (database level constraint) |
| `@@unique([email])` | email | Email unikal bo'lishini ta'minlash (database level constraint) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_user_role` | UserRole | N:1 | SetNull | Cascade | Rol o'chirilganda userning role_id NULL ga o'zgaradi. User ma'lumoti saqlanib qoladi |
| `fk_client_modified_by` | Client | 1:N | SetNull | Cascade | User o'chirilganda client.modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_client_registered_by` | Client | 1:N | SetNull | Cascade | User o'chirilganda client.registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_visit_doctor` | Visit | 1:N | SetNull | Cascade | User o'chirilganda visit.doctor_id NULL ga o'zgaradi. Visit tarixi saqlanadi |
| `fk_payment_user` | Payment | 1:N | SetNull | Cascade | User o'chirilganda payment.user_id NULL ga o'zgaradi. Moliya tarixi saqlanadi |
| `fk_service_user_user` | ServiceUser | 1:N | Cascade | Cascade | User o'chirilganda ServiceUser yozuvlari o'chiriladi. Stavka ma'lumotlari kerak emas |

### 2.5 Audit Relation Tushunchasi

User modeli **36 ta audit relation** ga ega. Bu har bir o'zgarishni kuzatish uchun:

```
Registered By (Kim yaratdi):
- registered_clients, registered_visits, registered_payments, ...

Modified By (Kim o'zgartirdi):
- modified_clients, modified_visits, modified_payments, ...

Business Relations (Biznes bog'liqlik):
- doctor_visits (shifokor sifatida qabul qilgan visitlar)
- user_payments (to'lovni amalga oshirgan user)
- service_users (shifokor stavkalari)
```

---

## 3. ENUM TUZILISHI

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
| `ACTIVE` | User to'liq ishlaydi | Yangi user yaratilganda default. Tizimga kira oladi |
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

---

## 4. API SPECIFIKATSIYASI

### 4.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/users` | ✅ JWT | Admin | Yangi user yaratish |
| 2 | POST | `/api/v1/auth/login` | ❌ | Barchasi | Login (autentifikatsiya) |
| 3 | POST | `/api/v1/auth/logout` | ✅ JWT | Barchasi | Logout |
| 4 | GET | `/api/v1/users` | ✅ JWT | Barchasi | User ro'yxatini olish |
| 5 | GET | `/api/v1/users/:id` | ✅ JWT | Barchasi | Bitta user ma'lumotlari |
| 6 | PUT | `/api/v1/users/:id` | ✅ JWT | Admin/O'zi | User yangilash |
| 7 | POST | `/api/v1/users/:id/password` | ✅ JWT | Admin/O'zi | Password o'zgartirish |
| 8 | DELETE | `/api/v1/users/:id` | ✅ JWT | Admin | User o'chirish (soft) |
| 9 | GET | `/api/v1/auth/me` | ✅ JWT | Barchasi | O'z profilini olish |

---

### 4.2 POST /api/v1/users

**Tavsif:** Admin tomonidan yangi foydalanuvchi yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateUserDto {
  full_name: string;      // 3-100 belgi
  login: string;          // 3-50 belgi, unikal
  password: string;       // Min 8 belgi, murakkab
  phone?: string;         // +998 format
  email?: string;         // Valid email, unikal
  role_id?: number;       // Mavjud UserRole ID
  description?: string;   // 0-255 belgi
  status?: string;        // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "full_name": "Dr. John Smith",
  "login": "drjohn",
  "password": "SecurePass@123",
  "phone": "+998901234567",
  "email": "drjohn@clinic.com",
  "role_id": 2,
  "description": "Tajribali shifokor, 10 yillik tajriba",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Foydalanuvchi muvaffaqiyatli yaratildi",
  "data": {
    "id": 5,
    "full_name": "Dr. John Smith",
    "login": "drjohn",
    "phone": "+998901234567",
    "email": "drjohn@clinic.com",
    "role": {
      "id": 2,
      "name": "Doctor"
    },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// user.service.ts
async create(createUserDto: CreateUserDto, adminId: number): Promise<User> {
  // 1. Login unikal ekanligini tekshirish
  const existingLogin = await this.prisma.user.findFirst({
    where: {
      login: createUserDto.login,
      deleted_at: null
    }
  });
  
  if (existingLogin) {
    throw new ConflictException('USER_001');
  }
  
  // 2. Email unikal ekanligini tekshirish (agar kiritilgan bo'lsa)
  if (createUserDto.email) {
    const existingEmail = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        deleted_at: null
      }
    });
    
    if (existingEmail) {
      throw new ConflictException('USER_002');
    }
  }
  
  // 3. Role mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createUserDto.role_id) {
    const role = await this.prisma.userRole.findUnique({
      where: { id: createUserDto.role_id }
    });
    
    if (!role || role.deleted_at) {
      throw new NotFoundException('USER_003');
    }
  }
  
  // 4. Password hash qilish (bcrypt, 10 salt rounds)
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
  // 5. User yaratish
  const user = await this.prisma.user.create({
    data: {
      full_name: createUserDto.full_name,
      login: createUserDto.login,
      password: hashedPassword,
      phone: createUserDto.phone,
      email: createUserDto.email,
      role_id: createUserDto.role_id,
      description: createUserDto.description,
      status: createUserDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    },
    include: {
      role: {
        select: { id: true, name: true }
      }
    }
  });
  
  // 6. Password ni response dan olib tashlash (xavfsizlik)
  delete user.password;
  
  return user;
}
```

---

### 4.3 POST /api/v1/auth/login

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
  "login": "drjohn",
  "password": "SecurePass@123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Muvaffaqiyatli kirish",
  "data": {
    "user": {
      "id": 5,
      "full_name": "Dr. John Smith",
      "login": "drjohn",
      "email": "drjohn@clinic.com",
      "role": {
        "id": 2,
        "name": "Doctor",
        "permissions": {
          "client": { "create": true, "read": true, "update": true, "delete": false },
          "visit": { "create": true, "read": true, "update": true, "delete": false },
          "payment": { "create": false, "read": true, "update": false, "delete": false }
        }
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsImxvZ2luIjoiZHJqb2huIiwicm9sZV9pZCI6Miwicm9sZV9uYW1lIjoiRG9jdG9yIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjE3MDQxNTM2MDB9.abc123...",
    "expires_in": 86400
  }
}
```

**Service Layer Implementation:**
```typescript
// auth.service.ts
async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
  // 1. User topish (login yoki email orqali)
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
    throw new UnauthorizedException('AUTH_001');
  }
  
  // 2. Status tekshirish (faqat ACTIVE userlar kira oladi)
  if (user.status !== 'ACTIVE') {
    throw new ForbiddenException('AUTH_002');
  }
  
  // 3. Password tekshirish (bcrypt compare)
  const isValid = await bcrypt.compare(loginDto.password, user.password);
  
  if (!isValid) {
    throw new UnauthorizedException('AUTH_001');
  }
  
  // 4. JWT Token yaratish
  const token = this.jwtService.sign({
    sub: user.id,
    login: user.login,
    role_id: user.role_id,
    role_name: user.role?.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 soat
  });
  
  // 5. Password ni response dan olib tashlash
  delete user.password;
  
  return { user, token };
}
```

---

### 4.4 GET /api/v1/users

**Tavsif:** Barcha foydalanuvchilar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 10 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `role_id` | number | - | Rol bo'yicha filter |
| `search` | string | - | Full_name yoki login bo'yicha qidiruv |
| `sortBy` | string | created_at | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/users?page=1&limit=10&status=ACTIVE&role_id=2&search=john&sortBy=created_at&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "full_name": "Dr. John Smith",
      "login": "drjohn",
      "phone": "+998901234567",
      "email": "drjohn@clinic.com",
      "role": {
        "id": 2,
        "name": "Doctor"
      },
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "updated_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 6,
      "full_name": "Dr. Jane Doe",
      "login": "drjane",
      "phone": "+998901234568",
      "email": "drjane@clinic.com",
      "role": {
        "id": 2,
        "name": "Doctor"
      },
      "status": "ACTIVE",
      "created_at": "2024-01-15T11:00:00.000Z",
      "updated_at": "2024-01-15T11:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetUsersQuery, currentUserId: number, currentUserRole: string): Promise<PaginatedResult<User>> {
  const where: any = { deleted_at: null };
  
  // Admin bo'lmasa, faqat o'zini ko'rish (xavfsizlik)
  if (currentUserRole !== 'Admin') {
    where.id = currentUserId;
  }
  
  // Status filter
  if (query.status) {
    where.status = query.status;
  }
  
  // Role filter
  if (query.role_id) {
    where.role_id = query.role_id;
  }
  
  // Search filter (full_name yoki login)
  if (query.search) {
    where.OR = [
      { full_name: { contains: query.search, mode: 'insensitive' } },
      { login: { contains: query.search, mode: 'insensitive' } }
    ];
  }
  
  // Pagination
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);
  
  // Sorting
  const orderBy = {
    [query.sortBy || 'created_at']: query.sortOrder || 'desc'
  };
  
  const [data, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        full_name: true,
        login: true,
        phone: true,
        email: true,
        role: { select: { id: true, name: true } },
        status: true,
        created_at: true,
        updated_at: true
      }
    }),
    this.prisma.user.count({ where })
  ]);
  
  return {
    data,
    pagination: {
      page: query.page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
      hasNextPage: skip + take < total,
      hasPrevPage: query.page > 1
    }
  };
}
```

---

### 4.5 PUT /api/v1/users/:id

**Tavsif:** Foydalanuvchi ma'lumotlarini yangilash

**Request Body:**
```json
{
  "full_name": "Dr. John Smith Jr.",
  "phone": "+998901234568",
  "email": "drjohn.jr@clinic.com",
  "description": "Katta shifokor",
  "role_id": 2,
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Foydalanuvchi muvaffaqiyatli yangilandi",
  "data": {
    "id": 5,
    "full_name": "Dr. John Smith Jr.",
    "login": "drjohn",
    "phone": "+998901234568",
    "email": "drjohn.jr@clinic.com",
    "role": {
      "id": 2,
      "name": "Doctor"
    },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
async update(id: number, updateUserDto: UpdateUserDto, currentUserId: number, currentUserRole: string): Promise<User> {
  // 1. User mavjudligini tekshirish
  const user = await this.prisma.user.findUnique({
    where: { id }
  });
  
  if (!user || user.deleted_at) {
    throw new NotFoundException('USER_004');
  }
  
  // 2. Ruxsat tekshirish (faqat o'zini yoki Admin)
  if (currentUserRole !== 'Admin' && currentUserId !== id) {
    throw new ForbiddenException('USER_005');
  }
  
  // 3. Email unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateUserDto.email && updateUserDto.email !== user.email) {
    const existingEmail = await this.prisma.user.findFirst({
      where: {
        email: updateUserDto.email,
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existingEmail) {
      throw new ConflictException('USER_002');
    }
  }
  
  // 4. Role mavjudligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateUserDto.role_id) {
    const role = await this.prisma.userRole.findUnique({
      where: { id: updateUserDto.role_id }
    });
    
    if (!role || role.deleted_at) {
      throw new NotFoundException('USER_003');
    }
  }
  
  // 5. User yangilash
  const updated = await this.prisma.user.update({
    where: { id },
    data: {
      ...updateUserDto,
      updated_at: new Date()
    },
    include: {
      role: { select: { id: true, name: true } }
    }
  });
  
  delete updated.password;
  
  return updated;
}
```

---

### 4.6 POST /api/v1/users/:id/password

**Tavsif:** Parolni o'zgartirish

**Request Body:**
```json
{
  "old_password": "SecurePass@123",
  "new_password": "NewSecurePass@456"
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
    throw new NotFoundException('USER_004');
  }
  
  // 2. Eski password tekshirish
  const isValid = await bcrypt.compare(changePasswordDto.old_password, user.password);
  
  if (!isValid) {
    throw new BadRequestException('USER_006');
  }
  
  // 3. Yangi password validatsiya (strength check)
  if (!this.validatePasswordStrength(changePasswordDto.new_password)) {
    throw new BadRequestException('USER_007');
  }
  
  // 4. Yangi password hash va saqlash
  const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);
  
  await this.prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      updated_at: new Date()
    }
  });
}

private validatePasswordStrength(password: string): boolean {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
}
```

---

### 4.7 DELETE /api/v1/users/:id

**Tavsif:** Foydalanuvchini soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Foydalanuvchi muvaffaqiyatli o'chirildi",
  "data": {
    "id": 5,
    "full_name": "Dr. John Smith",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, currentUserId: number): Promise<User> {
  // 1. User mavjudligini tekshirish
  const user = await this.prisma.user.findUnique({
    where: { id }
  });
  
  if (!user || user.deleted_at) {
    throw new NotFoundException('USER_004');
  }
  
  // 2. O'zini o'chirishni taqiqlash (kamida 1 admin bo'lishi kerak)
  if (id === currentUserId) {
    throw new BadRequestException('USER_008');
  }
  
  // 3. Bog'liq yozuvlarni tekshirish va warning log
  const visitCount = await this.prisma.visit.count({
    where: { doctor_id: id, deleted_at: null }
  });
  
  if (visitCount > 0) {
    this.logger.warn(`User ${id} has ${visitCount} visits. Their doctor_id will be set to NULL.`);
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.user.update({
    where: { id },
    data: {
      status: 'INACTIVE',
      deleted_at: new Date()
    }
  });
}
```

---

### 4.8 GET /api/v1/auth/me

**Tavsif:** O'z profilini olish (autentifikatsiya qilingan user uchun)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "full_name": "Dr. John Smith",
    "login": "drjohn",
    "phone": "+998901234567",
    "email": "drjohn@clinic.com",
    "role": {
      "id": 2,
      "name": "Doctor",
      "permissions": {
        "client": { "create": true, "read": true, "update": true, "delete": false },
        "visit": { "create": true, "read": true, "update": true, "delete": false },
        "payment": { "create": false, "read": true, "update": false, "delete": false }
      }
    },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 5. VALIDATSIYA QOIDALARI

### 5.1 Class Validator DTO

```typescript
// create-user.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsEnum,
  IsInt,
  Matches,
  IsObject,
  ValidateNested
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Ism kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Ism 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Ism faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Login kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(50, { message: 'Login 50 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Login faqat harf, raqam, _ belgilarini o\'z ichiga olishi mumkin'
  })
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Parol kamida 8 belgi bo\'lishi kerak' })
  @MaxLength(255)
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Telefon +998901234567 formatda bo\'lishi kerak'
  })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Noto\'g\'ri email format' })
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  role_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}
```

### 5.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `full_name` | Required | USER_010 | Ism majburiy |
| `full_name` | MinLength 3 | USER_010 | Ism kamida 3 belgi |
| `full_name` | MaxLength 100 | USER_010 | Ism 100 belgidan oshmasin |
| `login` | Required | USER_011 | Login majburiy |
| `login` | MinLength 3 | USER_011 | Login kamida 3 belgi |
| `login` | MaxLength 50 | USER_011 | Login 50 belgidan oshmasin |
| `login` | Unique | USER_001 | Login allaqachon mavjud |
| `password` | MinLength 8 | USER_007 | Parol kamida 8 belgi |
| `password` | RequireUppercase | USER_007 | Kamida 1 katta harf |
| `password` | RequireLowercase | USER_007 | Kamida 1 kichik harf |
| `password` | RequireDigit | USER_007 | Kamida 1 raqam |
| `password` | RequireSpecial | USER_007 | Kamida 1 maxsus belgi |
| `email` | IsEmail | USER_012 | Noto'g'ri email format |
| `email` | Unique | USER_002 | Email allaqachon mavjud |
| `phone` | Pattern | USER_013 | +998 formatida bo'lishi kerak |
| `role_id` | Must Exist | USER_003 | Rol topilmadi |
| `status` | Enum | USER_014 | ACTIVE/INACTIVE/ARCHIVED |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `USER_001` | 409 Conflict | Login allaqachon mavjud | Login unique constraint | Boshqa login tanlang |
| `USER_002` | 409 Conflict | Email allaqachon mavjud | Email unique constraint | Boshqa email tanlang |
| `USER_003` | 404 Not Found | Rol topilmadi | Role ID not exists | Rol ID ni tekshiring |
| `USER_004` | 404 Not Found | Foydalanuvchi topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `USER_005` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak yoki o'z profilini yangilang |
| `USER_006` | 400 Bad Request | Eski parol noto'g'ri | Password mismatch | Eski parolni tekshiring |
| `USER_007` | 400 Bad Request | Yangi parol juda zaif | Password validation failed | Murakkabroq parol o'ylab toping |
| `USER_008` | 400 Bad Request | O'zini o'chirish mumkin emas | Business rule | Boshqa admin o'chirsin |
| `USER_009` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |
| `USER_010` | 400 Bad Request | Ism noto'g'ri format | Validation failed | 3-100 belgi, faqat harf |
| `USER_011` | 400 Bad Request | Login noto'g'ri format | Validation failed | 3-50 belgi, harf/raqam/_ |
| `USER_012` | 400 Bad Request | Email noto'g'ri format | Validation failed | Valid email format |
| `USER_013` | 400 Bad Request | Telefon noto'g'ri format | Validation failed | +998901234567 format |
| `USER_014` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |
| `AUTH_001` | 401 Unauthorized | Login yoki parol noto'g'ri | Authentication failed | Ma'lumotlarni tekshiring |
| `AUTH_002` | 403 Forbidden | Account blokirovka qilingan | User status !== ACTIVE | Admin bilan bog'laning |

### 6.2 Exception Filter

```typescript
// user-exception.filter.ts
@Catch()
export class UserExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'USER_001';
    if (exception instanceof BadRequestException) return 'USER_010';
    if (exception instanceof NotFoundException) return 'USER_004';
    if (exception instanceof ForbiddenException) return 'USER_005';
    if (exception instanceof UnauthorizedException) return 'AUTH_001';
    return 'USER_009';
  }
}
```

---

## 7. XAVFSIZLIK TALABLARI

### 7.1 Password Hash

```typescript
// bcrypt konfiguratsiya
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

### 7.2 JWT Token

```typescript
// Token konfiguratsiya
{
  algorithm: 'HS256',
  expiresIn: '24h',
  secret: process.env.JWT_SECRET
}

// Token payload
{
  sub: user.id,
  login: user.login,
  role_id: user.role_id,
  role_name: user.role?.name,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
}
```

### 7.3 Rate Limiting (Login uchun)

```typescript
// Login attempt limit
const maxAttempts = 5;
const lockoutTime = 15 * 60 * 1000; // 15 daqiqa

// Redis da saqlash
const key = `login_attempts:${ip_address}`;
const attempts = await redis.get(key);

if (attempts >= maxAttempts) {
  throw new TooManyRequestsException('AUTH_003');
}
```

### 7.4 Audit

| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi | ⏳ Kelajakda |
| `modified_by` | Kim o'zgartirdi | ⏳ Kelajakda |

### 7.5 Input Sanitizatsiya

```typescript
// Sanitizatsiya middleware
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')  // XSS oldini olish
    .trim()
    .normalize('NFC');     // Unicode normalizatsiya
}
```

---

## 8. SEED DATA

### 8.1 Boshlang'ich Userlar

```typescript
// seed/user.seed.ts
import * as bcrypt from 'bcrypt';

export async function seedUsers(prisma: PrismaClient) {
  // Admin user yaratish
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

  // Test doctor user
  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  
  await prisma.user.upsert({
    where: { login: 'doctor1' },
    update: {},
    create: {
      full_name: 'Dr. John Smith',
      login: 'doctor1',
      password: doctorPassword,
      phone: '+998901111111',
      email: 'doctor1@clinic.com',
      role_id: 2, // Doctor role
      description: 'Terapevt, 10 yillik tajriba',
      status: 'ACTIVE'
    }
  });

  // Test receptionist user
  const receptionistPassword = await bcrypt.hash('Reception@123', 10);
  
  await prisma.user.upsert({
    where: { login: 'receptionist1' },
    update: {},
    create: {
      full_name: 'Jane Doe',
      login: 'receptionist1',
      password: receptionistPassword,
      phone: '+998902222222',
      email: 'receptionist1@clinic.com',
      role_id: 4, // Receptionist role
      description: 'Qabul xonasi',
      status: 'ACTIVE'
    }
  });

  // Test accountant user
  const accountantPassword = await bcrypt.hash('Accountant@123', 10);
  
  await prisma.user.upsert({
    where: { login: 'accountant1' },
    update: {},
    create: {
      full_name: 'Bob Johnson',
      login: 'accountant1',
      password: accountantPassword,
      phone: '+998903333333',
      email: 'accountant1@clinic.com',
      role_id: 5, // Accountant role
      description: 'Buxgalter',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Users seeded successfully');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat userlar
npm run seed:users
```

### 8.3 Production Password O'zgartirish

```bash
# Production da default parollarni o'zgartirish majburiy!
# Admin parolini birinchi kirishda o'zgartirish
```

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
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;
  let bcrypt: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const dto: CreateUserDto = {
        full_name: 'Dr. Test',
        login: 'drtest',
        password: 'Test@123',
        email: 'test@clinic.com',
        role_id: 2,
      };

      prisma.user.findFirst = jest.fn().mockResolvedValue(null);
      prisma.userRole.findUnique = jest.fn().mockResolvedValue({ id: 2 });
      bcrypt.hash = jest.fn().mockResolvedValue('hashed_password');
      prisma.user.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.login).toBe('drtest');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if login exists', async () => {
      const dto: CreateUserDto = {
        full_name: 'Dr. Test',
        login: 'admin',
        password: 'Test@123',
      };

      prisma.user.findFirst = jest.fn().mockResolvedValue({ id: 1, login: 'admin' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
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

      const result = await service.login(dto);

      expect(result.token).toBeDefined();
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

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, deleted_at: null });
      prisma.visit.count = jest.fn().mockResolvedValue(0);
      prisma.user.update = jest.fn().mockResolvedValue({ id: 2, deleted_at: new Date() });

      const result = await service.remove(2, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });

    it('should throw BadRequestException if deleting self', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });

      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
```

### 9.3 E2E Test

```typescript
// user.e2e-spec.ts
describe('User (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    
    authToken = await getAdminToken();
  });

  it('/api/v1/users (POST) - Create user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        full_name: 'Dr. Test',
        login: 'drtest',
        password: 'Test@123',
        email: 'test@clinic.com',
        role_id: 2,
      })
      .expect(201);
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

  it('/api/v1/users (GET) - Get all users', () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_user

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "role_id" INTEGER,
  "full_name" VARCHAR(100) NOT NULL,
  "login" VARCHAR(50) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "email" VARCHAR(100) UNIQUE,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  
  CONSTRAINT "fk_user_role" 
    FOREIGN KEY ("role_id") 
    REFERENCES "user_roles"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "users_role_id_idx" ON "users"("role_id");
CREATE INDEX "users_login_idx" ON "users"("login");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_created_at_idx" ON "users"("created_at");
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_user"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "users" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor
- [ ] Default parollar o'zgartirildi (production)

---

## 11. PERFORMANCE OPTIMALLASHTIRISH

### 11.1 Database Indexlar

```prisma
@@index([role_id])           // Rol filter uchun
@@index([login])             // Login search uchun
@@index([status])            // Status filter uchun
@@index([created_at])        // Sort uchun
@@index([deleted_at])        // Soft delete filter uchun
```

### 11.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| User List | Redis | 5 daqiqa | User create/update/delete |
| Single User | Redis | 2 daqiqa | User update/delete |
| User Permissions | In-Memory | Token lifetime | Token refresh |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const users = await prisma.user.findMany({
  select: { 
    id: true, 
    full_name: true, 
    login: true, 
    role: { select: { name: true } } 
  },
  where: { deleted_at: null }
});

// ❌ Yomon - Barcha maydonlar (password ham!)
const users = await prisma.user.findMany();
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `02-user-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| Client RFC | `RFC-003-client-management.md` | ⏳ Keyingi |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Login unikal bo'lishi
- [ ] Email unikal bo'lishi
- [ ] Password hash qilingan holda saqlanishi
- [ ] Password strength validatsiyasi ishlashi
- [ ] JWT token yaratilishi va 24 soat amal qilishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin barcha userlarni boshqara olishi
- [ ] Boshqa rollar faqat o'z profilini boshqara olishi
- [ ] Login attempt limit ishlashi (5 urinish = 15 daqiqa blok)
- [ ] O'zini o'chirish taqiqlangan bo'lishi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanishi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytarilishi

### 13.2 Non-Functional Requirements

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi
- [ ] Documentation to'liq

---

## 14. RISKLAR VA YECHIMLAR

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Password zaif bo'lishi | Yuqori | Yuqori | Strict validation + strength check |
| Brute force attack | O'rta | Yuqori | Rate limiting + account lockout |
| Session hijacking | Past | Yuqori | JWT + HTTPS + short expiry |
| User data leak | Past | Yuqori | Password hash + select only needed fields |
| Cascade delete issues | O'rta | O'rta | SetNull cascade + warning logs |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Password reset via email | 🟡 Medium | Phase 3 |
| Two-factor authentication | 🟡 Medium | Phase 4 |
| Social login (Google) | 🟢 Low | Phase 4 |
| Login history/audit | 🟢 Low | Phase 3 |
| Session management | 🟢 Low | Phase 3 |
| User avatar/profile picture | 🟢 Low | Phase 4 |

---

## 16. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |

---

**RFC Versiyasi:** 1.0
**Status:** Draft
**Oxirgi Yangilanish:** 2024-01-15