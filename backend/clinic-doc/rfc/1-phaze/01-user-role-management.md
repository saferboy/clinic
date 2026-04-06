# 📋 RFC-001: Foydalanuvchi Rollarini Boshqarish (User Role Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-001 |
| **Nomi** | User Role Management |
| **Phase** | 1 - Foundation |
| **Model** | `UserRole` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikani boshqarish tizimida foydalanuvchi rollarini (UserRole) yaratish, o'zgartirish, ko'rish va boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Rol yaratish (Create) | ❌ User yaratish (bu alohida RFC) |
| ✅ Rol ro'yxatini olish (Read) | ❌ Permission detallari (bu alohida RFC) |
| ✅ Rol yangilash (Update) | ❌ Frontend implementatsiya |
| ✅ Rol o'chirish - Soft Delete | ❌ Third-party integratsiya |
| ✅ Rol validatsiyasi | |

### 1.3 Biznes Qiymati
- Tizim xavfsizligini ta'minlash (RBAC)
- Foydalanuvchi huquqlarini aniq boshqarish
- Audit va compliance talablariga javob berish
- Kelajakda yangi rollar qo'shish imkoniyati

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema

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

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi |
| `name` | String | ✅ | - | VARCHAR(50) | **Rol nomi**. 3-50 belgi, unikal bo'lishi shart. Misol: "Admin", "Doctor" |
| `description` | String | ❌ | null | TEXT | **Rol tavsifi**. 0-255 belgi, ixtiyoriy. Rol haqida qo'shimcha ma'lumot |
| `permissions` | Json | ❌ | null | JSONB | **Ruxsatlar obyekti**. Har bir modul uchun CRUD ruxsatlari saqlanadi. JSONB tezkor qidiruv uchun |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. 3 ta qiymat: `ACTIVE` (ishlaydi), `INACTIVE` (vaqtincha to'xtatilgan), `ARCHIVED` (arxivlangan) |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi |

### 2.3 Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish |
| `@@index([name])` | name | Rol nomi bo'yicha qidiruvni tezlashtirish |
| `@@unique([name])` | name | Rol nomi unikal bo'lishini ta'minlash (application level) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_user_role` | User | 1:N | SetNull | Cascade | Rol o'chirilganda userlarning role_id NULL ga o'zgaradi |

---

## 3. ENUM TUZILISHI

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - rol ishlatiladi
  INACTIVE    // ⏸️ Nofaol - rol vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - rol tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | Rol to'liq ishlaydi | Yangi rol yaratilganda default |
| `INACTIVE` | Rol vaqtincha o'chirilgan | Rolni vaqtincha bloklash kerak bo'lganda |
| `ARCHIVED` | Rol arxivlangan | Rol endi kerak emas, lekin tarix uchun saqlanadi |

---

## 4. API SPECIFIKATSIYASI

### 4.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/user-roles` | ✅ JWT | Admin | Yangi rol yaratish |
| 2 | GET | `/api/v1/user-roles` | ✅ JWT | Barchasi | Rol ro'yxatini olish |
| 3 | GET | `/api/v1/user-roles/:id` | ✅ JWT | Barchasi | Bitta rol ma'lumotlari |
| 4 | PUT | `/api/v1/user-roles/:id` | ✅ JWT | Admin | Rol yangilash |
| 5 | DELETE | `/api/v1/user-roles/:id` | ✅ JWT | Admin | Rol o'chirish (soft) |

---

### 4.2 POST /api/v1/user-roles

**Tavsif:** Yangi foydalanuvchi roli yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateRoleDto {
  name: string;           // 3-50 belgi, unikal
  description?: string;   // 0-255 belgi
  permissions?: object;   // Valid JSON struktura
  status?: string;        // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Doctor",
  "description": "Shifokor roli - qabul va xizmat ko'rsatish",
  "permissions": {
    "client": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "visit": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "payment": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false
    }
  },
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Rol muvaffaqiyatli yaratildi",
  "data": {
    "id": 2,
    "name": "Doctor",
    "description": "Shifokor roli - qabul va xizmat ko'rsatish",
    "permissions": {
      "client": { "create": true, "read": true, "update": true, "delete": false },
      "visit": { "create": true, "read": true, "update": true, "delete": false },
      "payment": { "create": false, "read": true, "update": false, "delete": false }
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
// user-role.service.ts
async create(data: CreateRoleDto, userId: number): Promise<UserRole> {
  // 1. Name unikal ekanligini tekshirish
  const existing = await this.prisma.userRole.findFirst({
    where: {
      name: data.name,
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('ROL_001');
  }
  
  // 2. Rol yaratish
  return this.prisma.userRole.create({
    data: {
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      status: data.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date()
    }
  });
}
```

---

### 4.3 GET /api/v1/user-roles

**Tavsif:** Barcha rollar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 10 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter |
| `search` | string | - | Rol nomi bo'yicha qidiruv |
| `sortBy` | string | created_at | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/user-roles?page=1&limit=10&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "description": "Tizim administratori",
      "permissions": { ... },
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "users": 5 }
    },
    {
      "id": 2,
      "name": "Doctor",
      "description": "Shifokor",
      "permissions": { ... },
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "users": 10 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetRolesQuery): Promise<PaginatedResult<UserRole>> {
  const where: any = { deleted_at: null };
  
  if (query.status) {
    where.status = query.status;
  }
  
  if (query.search) {
    where.name = {
      contains: query.search,
      mode: 'insensitive'
    };
  }
  
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);
  
  const [data, total] = await Promise.all([
    this.prisma.userRole.findMany({
      where,
      skip,
      take,
      orderBy: { [query.sortBy || 'created_at']: query.sortOrder || 'desc' },
      include: { _count: { select: { users: true } } }
    }),
    this.prisma.userRole.count({ where })
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

### 4.4 GET /api/v1/user-roles/:id

**Tavsif:** Bitta rol ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Rol ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Doctor",
    "description": "Shifokor roli",
    "permissions": { ... },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "users": [
      { "id": 5, "full_name": "Dr. Smith", "login": "drsmith" },
      { "id": 6, "full_name": "Dr. John", "login": "drjohn" }
    ]
  }
}
```

**Service Layer Implementation:**
```typescript
async findOne(id: number): Promise<UserRole> {
  const role = await this.prisma.userRole.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, full_name: true, login: true }
      }
    }
  });
  
  if (!role || role.deleted_at) {
    throw new NotFoundException('ROL_004');
  }
  
  return role;
}
```

---

### 4.5 PUT /api/v1/user-roles/:id

**Tavsif:** Rol ma'lumotlarini yangilash

**Request Body:**
```json
{
  "name": "Senior Doctor",
  "description": "Katta shifokor roli",
  "permissions": { ... },
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol muvaffaqiyatli yangilandi",
  "data": {
    "id": 2,
    "name": "Senior Doctor",
    "description": "Katta shifokor roli",
    "permissions": { ... },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
async update(id: number, data: UpdateRoleDto, userId: number): Promise<UserRole> {
  // 1. Rol mavjudligini tekshirish
  const role = await this.prisma.userRole.findUnique({ where: { id } });
  
  if (!role || role.deleted_at) {
    throw new NotFoundException('ROL_004');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (data.name && data.name !== role.name) {
    const existing = await this.prisma.userRole.findFirst({
      where: {
        name: data.name,
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('ROL_001');
    }
  }
  
  // 3. Rol yangilash
  return this.prisma.userRole.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date()
    }
  });
}
```

---

### 4.6 DELETE /api/v1/user-roles/:id

**Tavsif:** Rolni soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol muvaffaqiyatli o'chirildi",
  "data": {
    "id": 2,
    "name": "Doctor",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, userId: number): Promise<UserRole> {
  // 1. Rol mavjudligini tekshirish
  const role = await this.prisma.userRole.findUnique({ where: { id } });
  
  if (!role || role.deleted_at) {
    throw new NotFoundException('ROL_004');
  }
  
  // 2. Rolga biriktirilgan userlar sonini tekshirish
  const userCount = await this.prisma.user.count({
    where: { role_id: id }
  });
  
  // 3. Warning log (agar userlar bo'lsa)
  if (userCount > 0) {
    this.logger.warn(`Role ${id} has ${userCount} users. Their role_id will be set to NULL.`);
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.userRole.update({
    where: { id },
    data: {
      status: 'INACTIVE',
      deleted_at: new Date()
    }
  });
}
```

---

## 5. VALIDATSIYA QOIDALARI

### 5.1 Class Validator DTO

```typescript
// create-role.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsObject,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Rol nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(50, { message: 'Rol nomi 50 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z0-9_\s-]+$/, {
    message: 'Rol nomi faqat harf, raqam, _, -, space belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsObject()
  permissions?: object;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}
```

### 5.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | ROL_002 | Rol nomi majburiy |
| `name` | MinLength 3 | ROL_002 | Rol nomi kamida 3 belgi |
| `name` | MaxLength 50 | ROL_003 | Rol nomi 50 belgidan oshmasin |
| `name` | Pattern | ROL_002 | Noto'g'ri belgilar |
| `name` | Unique | ROL_001 | Rol nomi allaqachon mavjud |
| `description` | MaxLength 255 | ROL_003 | Tavsif 255 belgidan oshmasin |
| `permissions` | IsObject | ROL_006 | Permissions JSON formatda bo'lishi kerak |
| `status` | Enum | ROL_007 | Status ACTIVE/INACTIVE/ARCHIVED bo'lishi kerak |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `ROL_001` | 409 Conflict | Rol nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `ROL_002` | 400 Bad Request | Rol nomi juda qisqa | Validation failed (min 3) | Kamida 3 belgi kiriting |
| `ROL_003` | 400 Bad Request | Rol nomi juda uzun | Validation failed (max 50) | 50 belgidan oshmasin |
| `ROL_004` | 404 Not Found | Rol topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `ROL_005` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `ROL_006` | 400 Bad Request | Noto'g'ri permissions format | Invalid JSON | JSON formatni tekshiring |
| `ROL_007` | 400 Bad Request | Noto'g'ri status qiymati | Invalid enum | ACTIVE/INACTIVE/ARCHIVED |
| `ROL_008` | 400 Bad Request | Rolga biriktirilgan userlar bor | Business rule | Userlarni boshqa rolga o'tkazing |
| `ROL_009` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |

### 6.2 Exception Filter

```typescript
// role-exception.filter.ts
@Catch()
export class RoleExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'ROL_001';
    if (exception instanceof BadRequestException) return 'ROL_002';
    if (exception instanceof NotFoundException) return 'ROL_004';
    if (exception instanceof ForbiddenException) return 'ROL_005';
    return 'ROL_009';
  }
}
```

---

## 7. XAVFSIZLIK TALABLARI

### 7.1 Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi
- ✅ Token expiry: 24 soat
- ✅ Refresh token mexanizmi mavjud
- ✅ Token blacklist (logout uchun)

### 7.2 Avtorizatsiya (RBAC)
| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /user-roles | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /user-roles | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /user-roles/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /user-roles/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /user-roles/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 Audit
- ✅ `created_at` - Har bir yozuv yaratilgan vaqti
- ✅ `updated_at` - Har bir o'zgarish vaqti (avtomatik)
- ✅ `deleted_at` - Soft delete vaqti
- ⏳ `created_by` - Kelajakda qo'shiladi (User ID)
- ⏳ `updated_by` - Kelajakda qo'shiladi (User ID)

### 7.4 Input Sanitizatsiya
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

### 8.1 Boshlang'ich Rollar

```typescript
// seed/user-role.seed.ts
export async function seedUserRoles(prisma: PrismaClient) {
  const roles = [
    {
      id: 1,
      name: 'Admin',
      description: 'Tizim administratori - to\'liq huquq',
      permissions: {
        client: { create: true, read: true, update: true, delete: true },
        visit: { create: true, read: true, update: true, delete: true },
        payment: { create: true, read: true, update: true, delete: true },
        user: { create: true, read: true, update: true, delete: true },
        role: { create: true, read: true, update: true, delete: true },
        report: { create: true, read: true, update: true, delete: true },
      },
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Doctor',
      description: 'Shifokor - qabul va xizmat ko\'rsatish',
      permissions: {
        client: { create: true, read: true, update: true, delete: false },
        visit: { create: true, read: true, update: true, delete: false },
        payment: { create: false, read: true, update: false, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: false, read: true, update: false, delete: false },
      },
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Nurse',
      description: 'Hamshira - yordamchi funksiyalar',
      permissions: {
        client: { create: false, read: true, update: false, delete: false },
        visit: { create: false, read: true, update: false, delete: false },
        payment: { create: false, read: false, update: false, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: false, read: true, update: false, delete: false },
      },
      status: 'ACTIVE',
    },
    {
      id: 4,
      name: 'Receptionist',
      description: 'Qabul xonasi - ro\'yxatga olish',
      permissions: {
        client: { create: true, read: true, update: true, delete: false },
        visit: { create: true, read: true, update: true, delete: false },
        payment: { create: true, read: true, update: false, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: false, read: true, update: false, delete: false },
      },
      status: 'ACTIVE',
    },
    {
      id: 5,
      name: 'Accountant',
      description: 'Buxgalter - moliya boshqaruvi',
      permissions: {
        client: { create: false, read: true, update: false, delete: false },
        visit: { create: false, read: true, update: false, delete: false },
        payment: { create: true, read: true, update: true, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: true, read: true, update: false, delete: false },
      },
      status: 'ACTIVE',
    },
  ];

  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  console.log('✅ User roles seeded successfully');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod
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
// user-role.service.spec.ts
describe('UserRoleService', () => {
  let service: UserRoleService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRoleService, PrismaService],
    }).compile();

    service = module.get<UserRoleService>(UserRoleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new role successfully', async () => {
      const dto: CreateRoleDto = {
        name: 'TestRole',
        description: 'Test description',
        status: 'ACTIVE',
      };

      prisma.userRole.findFirst = jest.fn().mockResolvedValue(null);
      prisma.userRole.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('TestRole');
      expect(prisma.userRole.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if role name exists', async () => {
      const dto: CreateRoleDto = { name: 'Admin' };

      prisma.userRole.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Admin' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const query: GetRolesQuery = { page: 1, limit: 10 };

      prisma.userRole.findMany = jest.fn().mockResolvedValue([]);
      prisma.userRole.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft delete a role', async () => {
      prisma.userRole.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.user.count = jest.fn().mockResolvedValue(0);
      prisma.userRole.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

### 9.3 E2E Test

```typescript
// user-role.e2e-spec.ts
describe('UserRole (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    // App setup
    app = await createTestApp();
    await app.init();
    
    // Get admin token
    authToken = await getAdminToken();
  });

  it('/api/v1/user-roles (POST) - Create role', () => {
    return request(app.getHttpServer())
      .post('/api/v1/user-roles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'TestRole',
        description: 'Test',
        status: 'ACTIVE',
      })
      .expect(201);
  });

  it('/api/v1/user-roles (GET) - Get all roles', () => {
    return request(app.getHttpServer())
      .get('/api/v1/user-roles')
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
npx prisma migrate dev --name create_user_role

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Enum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- Create Table
CREATE TABLE "user_roles" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL UNIQUE,
  "description" TEXT,
  "permissions" JSONB,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);

-- Create Indexes
CREATE INDEX "user_roles_status_idx" ON "user_roles"("status");
CREATE INDEX "user_roles_name_idx" ON "user_roles"("name");
CREATE INDEX "user_roles_deleted_at_idx" ON "user_roles"("deleted_at");
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_user_role"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TYPE IF EXISTS "RecordStatus" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security review o'tkazildi
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor

---

## 11. PERFORMANCE OPTIMALLASHTIRISH

### 11.1 Database Indexlar

```prisma
@@index([status])           // Status filter uchun
@@index([name])             // Name search uchun
@@index([deleted_at])       // Soft delete filter uchun
```

### 11.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Role List | Redis | 1 soat | Rol create/update/delete |
| Single Role | Redis | 30 daqiqa | Rol update/delete |
| Permissions | In-Memory | App lifetime | App restart |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const roles = await prisma.userRole.findMany({
  select: { id: true, name: true, status: true },
  where: { deleted_at: null }
});

// ❌ Yomon - Barcha maydonlar
const roles = await prisma.userRole.findMany();
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `01-user-role-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User Management RFC | `RFC-002-user-management.md` | ⏳ Keyingi |
| RBAC Permissions RFC | `RFC-013-permissions.md` | ⏳ Kelajakda |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Rol nomi unikal bo'lishi
- [ ] Rol nomi 3-50 belgi orasida bo'lishi
- [ ] Permissions valid JSON formatda bo'lishi
- [ ] Status faqat ACTIVE/INACTIVE/ARCHIVED qiymat qabul qilishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin rol yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar rol ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi

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
| Rol o'chirilganda userlar qoladi | O'rta | Yuqori | Userlarni boshqa rolga o'tkazish scripti |
| Permissions JSON noto'g'ri format | Yuqori | O'rta | Strict validation + schema |
| Performance degradation | Past | O'rta | Caching + indexing |
| Security breach | Past | Yuqori | RBAC + audit log + encryption |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Role hierarchy (parent-child) | 🟡 Medium | Phase 3 |
| Permission templates | 🟢 Low | Phase 3 |
| Role change history | 🟢 Low | Phase 4 |
| Bulk role operations | 🟢 Low | Phase 4 |

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