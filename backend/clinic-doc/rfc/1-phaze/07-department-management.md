# 📋 RFC-007: Bo'limlar Boshqaruvi (Department Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-007 |
| **Nomi** | Department Management |
| **Phase** | 1 - Foundation |
| **Model** | `Department` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Foundation - Klassifikator) |
| **Bog'liq RFC** | RFC-001 (UserRole), RFC-002 (User), RFC-009 (Room), RFC-010 (Service) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinika bo'limlarini (kafedralarini) boshqarish va tashkil qilish uchun to'liq texnik specifikatsiyani taqdim etadi. Har bir bo'lim uchun xizmatlar, xonalar va shifokorlarni biriktirish. Klinikaning tashkiliy tuzilmasini raqamlashtirish va hisobotlarda bo'lim kesimida statistika olish uchun reference ma'lumotlar bazasini yaratish.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Bo'lim yaratish (Create) | ❌ Xizmat boshqaruvi (bu alohida RFC) |
| ✅ Bo'lim ro'yxatini olish (Read) | ❌ Xona boshqaruvi (bu alohida RFC) |
| ✅ Bo'lim yangilash (Update) | ❌ Frontend implementatsiya |
| ✅ Bo'lim o'chirish - Soft Delete | ❌ Third-party integratsiya |
| ✅ Bo'lim validatsiyasi | |

### 1.3 Biznes Qiymati
- Klinikaning tashkiliy tuzilmasini raqamlashtirish (Reference: `Klinika.md` 3.4)
- Xizmatlarni bo'limlar bo'yicha kategoriyalash
- Xonalarni bo'limlarga biriktirish
- Hisobotlarda bo'lim kesimida statistika olish (Reference: `Klinika.md` 7.1)
- Shifokorlarni bo'limlar bo'yicha taqsimlash
- Klinika filiallarini kengaytirishda tuzilma ma'lumotlaridan foydalanish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model Department {
  id           Int          @id @default(autoincrement())
  name         String       @db.VarChar(100)
  description  String?      @db.Text
  status       RecordStatus @default(ACTIVE)
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?        @map("registered_by")
  modified_by  Int?         @map("modified_by")

  // Relations
  register_user User?       @relation("fk_department_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_department_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  rooms        Room[]       @relation("fk_room_department")
  services     Service[]    @relation("fk_service_department")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("departments")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Room va Service jadvallari bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Bo'lim nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Terapiya", "Xirurgiya", "Stomatologiya" (Reference: `Klinika.md` 3.4) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi, bo'lim haqida qo'shimcha ma'lumot. Xizmatlar, mutaxassisliklar haqida yozish mumkin |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi bo'lim yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |

### 2.3 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv bo'limlar) |
| `@@index([name])` | name | Bo'lim nomi bo'yicha qidiruvni tezlashtirish (search/dropdown uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan bo'limlarni ajratish) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_department_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_department_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_room_department` | Room | 1:N | SetNull | Cascade | Bo'lim o'chirilganda xonalarning department_id NULL ga o'zgaradi. Xona ma'lumoti saqlanib qoladi |
| `fk_service_department` | Service | 1:N | SetNull | Cascade | Bo'lim o'chirilganda xizmatlarning department_id NULL ga o'zgaradi. Xizmat ma'lumoti saqlanib qoladi |

### 2.5 Cascade Rules Tushunchasi

```
Bo'lim o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Department.status = 'INACTIVE'              │
│ 2. Department.deleted_at = NOW()               │
│ 3. Room.department_id = NULL (SetNull)         │
│ 4. Service.department_id = NULL (SetNull)      │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi. (Reference: Klinika.md 8.1)
```

---

## 3. ENUM TUZILISHI (Reference: `klinika_prisma.txt`)

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - bo'lim ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - bo'lim vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - bo'lim tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | Bo'lim to'liq ishlaydi | Yangi bo'lim yaratilganda default. Dropdownlarda ko'rinadi |
| `INACTIVE` | Bo'lim vaqtincha o'chirilgan | Noto'g'ri ma'lumot kiritilganda, vaqtincha bloklash |
| `ARCHIVED` | Bo'lim arxivlangan | Bo'lim endi ishlatilmaydi, lekin tarix uchun saqlanadi |

### 3.2 Status O'zgarish Qoidalari

```
ACTIVE → INACTIVE  ✅ Ruxsat etiladi (Admin tomonidan)
ACTIVE → ARCHIVED  ✅ Ruxsat etiladi (Bo'lim bekor qilinganda)
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
| 1 | POST | `/api/v1/departments` | ✅ JWT | Admin | Yangi bo'lim yaratish |
| 2 | GET | `/api/v1/departments` | ✅ JWT | Barchasi | Bo'lim ro'yxatini olish |
| 3 | GET | `/api/v1/departments/:id` | ✅ JWT | Barchasi | Bitta bo'lim ma'lumotlari |
| 4 | PUT | `/api/v1/departments/:id` | ✅ JWT | Admin | Bo'lim yangilash |
| 5 | DELETE | `/api/v1/departments/:id` | ✅ JWT | Admin | Bo'lim o'chirish (soft) |

---

### 4.2 POST /api/v1/departments

**Tavsif:** Admin tomonidan yangi bo'lim yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateDepartmentDto {
  name: string;       // 3-100 belgi, unikal
  description?: string;   // 0-255 belgi
  status?: string;    // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Terapiya",
  "description": "Ichki kasalliklar bo'limi",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Bo'lim muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Terapiya",
    "description": "Ichki kasalliklar bo'limi",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null
  }
}
```

**Service Layer Implementation:**
```typescript
// department.service.ts
async create(createDepartmentDto: CreateDepartmentDto, userId: number): Promise<Department> {
  // 1. Name unikal ekanligini tekshirish (case-insensitive)
  const existing = await this.prisma.department.findFirst({
    where: {
      name: {
        equals: createDepartmentDto.name,
        mode: 'insensitive'
      },
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('DEPT_001');
  }
  
  // 2. Bo'lim yaratish
  const department = await this.prisma.department.create({
     {
      name: createDepartmentDto.name,
      description: createDepartmentDto.description,
      status: createDepartmentDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return department;
}
```

---

### 4.3 GET /api/v1/departments

**Tavsif:** Barcha bo'limlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 100 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Bo'lim nomi bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/departments?page=1&limit=100&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Terapiya",
      "description": "Ichki kasalliklar bo'limi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "rooms": 5, "services": 10 }
    },
    {
      "id": 2,
      "name": "Xirurgiya",
      "description": "Xirurgik operatsiyalar bo'limi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "rooms": 3, "services": 8 }
    },
    {
      "id": 3,
      "name": "Stomatologiya",
      "description": "Tish davolash bo'limi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "rooms": 4, "services": 12 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 12,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetDepartmentsQuery): Promise<PaginatedResult<Department>> {
  const where: any = { deleted_at: null };
  
  // Status filter
  if (query.status) {
    where.status = query.status;
  }
  
  // Search filter (case-insensitive)
  if (query.search) {
    where.name = {
      contains: query.search,
      mode: 'insensitive'
    };
  }
  
  // Pagination
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);
  
  // Sorting
  const orderBy = {
    [query.sortBy || 'name']: query.sortOrder || 'asc'
  };
  
  const [data, total] = await Promise.all([
    this.prisma.department.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { 
            rooms: true,
            services: true
          }
        }
      }
    }),
    this.prisma.department.count({ where })
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

### 4.4 GET /api/v1/departments/:id

**Tavsif:** Bitta bo'lim ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Bo'lim ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Terapiya",
    "description": "Ichki kasalliklar bo'limi",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null,
    "_count": { "rooms": 5, "services": 10 }
  }
}
```

**Service Layer Implementation:**
```typescript
async findOne(id: number): Promise<Department> {
  const department = await this.prisma.department.findUnique({
    where: { id },
    include: {
      _count: {
        select: { 
          rooms: { where: { deleted_at: null } },
          services: { where: { deleted_at: null } }
        }
      }
    }
  });
  
  if (!department || department.deleted_at) {
    throw new NotFoundException('DEPT_003');
  }
  
  return department;
}
```

---

### 4.5 PUT /api/v1/departments/:id

**Tavsif:** Bo'lim ma'lumotlarini yangilash

**Request Body:**
```json
{
  "name": "Terapiya (Updated)",
  "description": "Ichki kasalliklar bo'limi - kengaytirilgan",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bo'lim muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Terapiya (Updated)",
    "description": "Ichki kasalliklar bo'limi - kengaytirilgan",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": 1
  }
}
```

**Service Layer Implementation:**
```typescript
async update(id: number, updateDepartmentDto: UpdateDepartmentDto, userId: number): Promise<Department> {
  // 1. Bo'lim mavjudligini tekshirish
  const department = await this.prisma.department.findUnique({
    where: { id }
  });
  
  if (!department || department.deleted_at) {
    throw new NotFoundException('DEPT_003');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateDepartmentDto.name && updateDepartmentDto.name !== department.name) {
    const existing = await this.prisma.department.findFirst({
      where: {
        name: {
          equals: updateDepartmentDto.name,
          mode: 'insensitive'
        },
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('DEPT_001');
    }
  }
  
  // 3. Bo'lim yangilash
  const updated = await this.prisma.department.update({
    where: { id },
     {
      ...updateDepartmentDto,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

---

### 4.6 DELETE /api/v1/departments/:id

**Tavsif:** Bo'limni soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Bo'lim muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "Terapiya",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, userId: number): Promise<Department> {
  // 1. Bo'lim mavjudligini tekshirish
  const department = await this.prisma.department.findUnique({
    where: { id }
  });
  
  if (!department || department.deleted_at) {
    throw new NotFoundException('DEPT_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const roomCount = await this.prisma.room.count({
    where: { department_id: id, deleted_at: null }
  });
  
  const serviceCount = await this.prisma.service.count({
    where: { department_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (roomCount > 0 || serviceCount > 0) {
    this.logger.warn(
      `Department ${id} has ${roomCount} rooms and ${serviceCount} services. 
       Their department_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.department.update({
    where: { id },
     {
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
// create-department.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Bo\'lim nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Bo\'lim nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Bo\'lim nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

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
| `name` | Required | DEPT_010 | Bo'lim nomi majburiy |
| `name` | MinLength 3 | DEPT_002 | Bo'lim nomi kamida 3 belgi |
| `name` | MaxLength 100 | DEPT_002 | Bo'lim nomi 100 belgidan oshmasin |
| `name` | Pattern | DEPT_002 | Noto'g'ri belgilar |
| `name` | Unique | DEPT_001 | Bo'lim nomi allaqachon mavjud |
| `description` | MaxLength 255 | DEPT_011 | Tavsif 255 belgidan oshmasin |
| `status` | Enum | DEPT_012 | ACTIVE/INACTIVE/ARCHIVED |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `DEPT_001` | 409 Conflict | Bo'lim nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `DEPT_002` | 400 Bad Request | Bo'lim nomi juda qisqa/uzun | Validation failed | 3-100 belgi kiriting |
| `DEPT_003` | 404 Not Found | Bo'lim topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `DEPT_004` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `DEPT_005` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |
| `DEPT_010` | 400 Bad Request | Bo'lim nomi majburiy | Validation failed | Nomi kiriting |
| `DEPT_011` | 400 Bad Request | Tavsif juda uzun | Validation failed | 255 belgidan oshmasin |
| `DEPT_012` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

---

## 7. XAVFSIZLIK TALABLARI (Reference: `Klinika.md` 8)

### 7.1 Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi (Reference: `Klinika.md` 8.1)
- ✅ Token expiry: 24 soat
- ✅ Token validatsiyasi har bir so'rovda

### 7.2 Avtorizatsiya (RBAC) (Reference: `Klinika.md` 6.1)

| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /departments | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /departments | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /departments/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /departments/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /departments/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 Audit (Reference: `klinika_prisma.txt` & `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

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

### 8.1 Standart Bo'limlar (Reference: `Klinika.md` 3.4)

```typescript
// seed/department.seed.ts
export async function seedDepartments(prisma: PrismaClient) {
  const departments = [
    { 
      name: "Terapiya", 
      description: "Ichki kasalliklar bo'limi" 
    },
    { 
      name: "Xirurgiya", 
      description: "Xirurgik operatsiyalar bo'limi" 
    },
    { 
      name: "Stomatologiya", 
      description: "Tish davolash bo'limi" 
    },
    { 
      name: "Ginekologiya", 
      description: "Ayollar kasalliklari bo'limi" 
    },
    { 
      name: "Urologiya", 
      description: "Erkaklar kasalliklari bo'limi" 
    },
    { 
      name: "Kardiologiya", 
      description: "Yurak kasalliklari bo'limi" 
    },
    { 
      name: "Nevrologiya", 
      description: "Asab tizimi kasalliklari bo'limi" 
    },
    { 
      name: "Dermatologiya", 
      description: "Teri kasalliklari bo'limi" 
    },
    { 
      name: "Oftalmologiya", 
      description: "Ko'z kasalliklari bo'limi" 
    },
    { 
      name: "Laboratoriya", 
      description: "Tahlillar bo'limi" 
    },
    { 
      name: "Rentgen", 
      description: "Rentgen tekshiruvi bo'limi" 
    },
    { 
      name: "Fizioterapiya", 
      description: "Fizioterapiya muolajalari bo'limi" 
    }
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: {
        name: department.name,
        description: department.description,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ Departments seeded successfully (12 departments)');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat bo'limlar
npm run seed:departments
```

### 8.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Bo'lim nomlarini o'zgartirishdan oldin backup qilish
- [ ] Mavjud xona va xizmatlarning department_id tekshirish
- [ ] Bo'lim o'zgarishiga ta'sirini baholash

---

## 9. TEST TALABLARI

### 9.1 Unit Test Coverage (Reference: `Klinika.md` 9.1)

| Test Type | Minimum Coverage | Priority |
|-----------|-----------------|----------|
| Service Layer | 90% | 🔴 High |
| Controller Layer | 80% | 🟡 Medium |
| Validation | 95% | 🔴 High |
| Integration | 70% | 🟡 Medium |

### 9.2 Test Cases

```typescript
// department.service.spec.ts
describe('DepartmentService', () => {
  let service: DepartmentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentService, PrismaService],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new department successfully', async () => {
      const dto: CreateDepartmentDto = {
        name: 'Test Department',
        description: 'Test description',
        status: 'ACTIVE',
      };

      prisma.department.findFirst = jest.fn().mockResolvedValue(null);
      prisma.department.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('Test Department');
      expect(prisma.department.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if department name exists', async () => {
      const dto: CreateDepartmentDto = {
        name: 'Terapiya',
      };

      prisma.department.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Terapiya' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated departments', async () => {
      const query: GetDepartmentsQuery = { page: 1, limit: 100 };

      prisma.department.findMany = jest.fn().mockResolvedValue([]);
      prisma.department.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft delete a department', async () => {
      prisma.department.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.room.count = jest.fn().mockResolvedValue(0);
      prisma.service.count = jest.fn().mockResolvedValue(0);
      prisma.department.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_department

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "departments" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_department_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_department_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "departments_status_idx" ON "departments"("status");
CREATE INDEX "departments_name_idx" ON "departments"("name");
CREATE INDEX "departments_deleted_at_idx" ON "departments"("deleted_at");
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_department"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "departments" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi (Reference: `klinika_prisma.txt`)
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (12 ta bo'lim)
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor

---

## 11. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 11.1 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
@@index([status])           // Status filter uchun
@@index([name])             // Name search uchun
@@index([deleted_at])       // Soft delete filter uchun
```

### 11.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Department List | Redis | 1 soat | Department create/update/delete |
| Single Department | Redis | 30 daqiqa | Department update/delete |
| All Active Departments | In-Memory | 1 soat | App restart |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const departments = await prisma.department.findMany({
  select: { 
    id: true, 
    name: true, 
    status: true
  },
  where: { deleted_at: null, status: 'ACTIVE' },
  orderBy: { name: 'asc' }
});

// ✅ Yaxshi - Count bilan
const departments = await prisma.department.findMany({
  where: { deleted_at: null, status: 'ACTIVE' },
  include: { _count: { select: { rooms: true, services: true } } }
});

// ❌ Yomon - Barcha maydonlar
const departments = await prisma.department.findMany();
```

### 11.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `07-department-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| LocRegion RFC | `RFC-003-location-region.md` | ✅ Tasdiqlandi |
| LocDistrict RFC | `RFC-004-location-district.md` | ✅ Tasdiqlandi |
| Source RFC | `RFC-005-source-management.md` | ✅ Tasdiqlandi |
| ClientGroup RFC | `RFC-006-client-group-management.md` | ✅ Tasdiqlandi |
| Auth RFC | `RFC-008-auth-management.md` | ✅ Tasdiqlandi |
| Room RFC | `RFC-009-room-management.md` | ⏳ Keyingi |
| Service RFC | `RFC-010-service-management.md` | ⏳ Keyingi |
| Client RFC | `RFC-011-client-management.md` | ⏳ Kelajakda |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Bo'lim nomi unikal bo'lishi (case-insensitive)
- [ ] Bo'lim nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin bo'lim yaratish/o'zgartirish/o'chirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Barcha rollar bo'lim ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi (12 ta bo'lim)
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull)

### 13.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq

---

## 14. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Bo'lim nomi takrorlanishi | O'rta | Yuqori | Unique constraint + case-insensitive check |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Department o'zgarishi (kam) | Past | O'rta | ARCHIVED status + migration script |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Department hierarchy (parent-child) | 🟢 Low | Phase 4 |
| Department statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| Department change history | 🟢 Low | Phase 4 |
| Department-specific pricing | 🟢 Low | Phase 4 |
| Multi-branch department support | 🟢 Low | Phase 4 |

---

## 16. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |

---

**RFC Versiyasi:** 1.0
**Status:** Draft
**Oxirgi Yangilanish:** 2024-01-15
**Reference Documents:** `klinika_prisma.txt`, `Klinika.md` (Sections 3.4, 5.2, 6.1, 7, 8, 9.1)