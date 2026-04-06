# 📋 RFC-016: Chiqim Kategoriyalari Boshqaruvi (OtherPaidGroup Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-016 |
| **Nomi** | OtherPaidGroup Management |
| **Phase** | 2B - Finance |
| **Model** | `OtherPaidGroup` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🟡 Medium (Finance - Support) |
| **Bog'liq RFC** | RFC-002 (User), RFC-017 (OtherPaid) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.5, 4.2, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikaning boshqa kirim/chiqimlarini (OtherPaid) kategoriyalash uchun guruhlar boshqaruvini taqdim etadi. Chiqim turlarini tizimli ravishda guruhlash, moliyaviy hisobotlarda kategoriyalar kesimida statistika olish va xarajatlarni nazorat qilish uchun asos yaratish (Reference: `Klinika.md` 3.5, 4.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ OtherPaidGroup yaratish (Create) | ❌ Online to'lov integratsiyasi |
| ✅ OtherPaidGroup ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ OtherPaidGroup yangilash (Update) | ❌ Multi-currency support |
| ✅ OtherPaidGroup o'chirish (Soft Delete) | ❌ Budget planning (kelajakda) |
| ✅ Kategoriya bo'yicha filterlash | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.5, 7.1)
- Chiqimlarni kategoriyalash va tizimli boshqarish
- Moliyaviy hisobotlarda kategoriyalar kesimida statistika
- Xarajat turlarini nazorat qilish
- Budget planning uchun asos yaratish
- Buxgalteriya hisobotlarini yengillashtirish
- Xarajat optimallashtirish imkoniyati

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model OtherPaidGroup {
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
  register_user User?       @relation("fk_other_paid_group_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_other_paid_group_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  other_paid   OtherPaid[]  @relation("fk_other_paid_group")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("other_paid_groups")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. OtherPaid jadvali bilan bog'lanish uchun |
| `name` | String | ✅ | - | VARCHAR(100) | **Guruh nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Maoshlar", "Kommunal to'lovlar", "Ijara" (Reference: `Klinika.md` 3.5) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi, guruh haqida qo'shimcha ma'lumot |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi guruh yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade. Audit uchun |

### 2.3 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv guruhlar) |
| `@@index([name])` | name | Guruh nomi bo'yicha qidiruvni tezlashtirish (search/dropdown uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_other_paid_group_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_other_paid_group_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_other_paid_group` | OtherPaid | 1:N | SetNull | Cascade | Guruh o'chirilganda otherPaid.group_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |

### 2.5 Cascade Rules Tushunchasi

```
OtherPaidGroup o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. OtherPaidGroup.status = 'INACTIVE'          │
│ 2. OtherPaidGroup.deleted_at = NOW()           │
│ 3. OtherPaid.group_id = NULL (SetNull)         │
│ 4. Moliyaviy tarix saqlanib qoladi             │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Moliyaviy 
tarix saqlanib qoladi, faqat status o'zgaradi.
(Reference: Klinika.md 8.1)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/other-paid-groups` | ✅ JWT | Admin, Accountant | Yangi guruh yaratish |
| 2 | GET | `/api/v1/other-paid-groups` | ✅ JWT | Admin, Accountant | Guruhlar ro'yxatini olish |
| 3 | GET | `/api/v1/other-paid-groups/:id` | ✅ JWT | Admin, Accountant | Bitta guruh ma'lumotlari |
| 4 | PUT | `/api/v1/other-paid-groups/:id` | ✅ JWT | Admin, Accountant | Guruh yangilash |
| 5 | DELETE | `/api/v1/other-paid-groups/:id` | ✅ JWT | Admin | Guruh o'chirish (soft) |
| 6 | GET | `/api/v1/other-paid-groups/active` | ✅ JWT | Admin, Accountant | Faol guruhlar (dropdown uchun) |

---

### 3.2 POST /api/v1/other-paid-groups

**Tavsif:** Yangi OtherPaidGroup yaratish (Admin, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateOtherPaidGroupDto {
  name: string;         // 3-100 belgi, unikal
  description?: string; // 0-255 belgi
  status?: string;      // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Maoshlar",
  "description": "Xodimlarga to'lanadigan maoshlar",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "To'lov guruhi muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Maoshlar",
    "description": "Xodimlarga to'lanadigan maoshlar",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "_count": { "other_paid": 0 }
  }
}
```

**Service Layer Implementation:**
```typescript
// other-paid-group.service.ts
async create(createOtherPaidGroupDto: CreateOtherPaidGroupDto, userId: number): Promise<OtherPaidGroup> {
  // 1. Name unikal ekanligini tekshirish
  const existing = await this.prisma.otherPaidGroup.findFirst({
    where: {
      name: createOtherPaidGroupDto.name,
      deleted_at: null
    }
  });

  if (existing) {
    throw new ConflictException('OPG_001');
  }

  // 2. Guruh yaratish
  const group = await this.prisma.otherPaidGroup.create({
     {
      name: createOtherPaidGroupDto.name,
      description: createOtherPaidGroupDto.description,
      status: createOtherPaidGroupDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      _count: {
        select: { other_paid: true }
      }
    }
  });

  return group;
}
```

---

### 3.3 GET /api/v1/other-paid-groups

**Tavsif:** OtherPaidGroup ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Guruh nomi bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/other-paid-groups?page=1&limit=20&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Maoshlar",
      "description": "Xodimlarga to'lanadigan maoshlar",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "other_paid": 12 }
    },
    {
      "id": 2,
      "name": "Kommunal to'lovlar",
      "description": "Elektr, suv, gaz to'lovlari",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "other_paid": 5 }
    },
    {
      "id": 3,
      "name": "Ijara",
      "description": "Bino ijarasi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "other_paid": 1 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetOtherPaidGroupsQuery): Promise<PaginatedResult<OtherPaidGroup>> {
  const where: any = { deleted_at: null };

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  // Search filter
  if (query.search) {
    where.name = {
      contains: query.search,
      mode: 'insensitive'
    };
  }

  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);

  // Sorting
  const orderBy = {
    [query.sortBy || 'name']: query.sortOrder || 'asc'
  };

  const [data, total] = await Promise.all([
    this.prisma.otherPaidGroup.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { other_paid: { where: { deleted_at: null } } }
        }
      }
    }),
    this.prisma.otherPaidGroup.count({ where })
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

### 3.4 GET /api/v1/other-paid-groups/active

**Tavsif:** Faol guruhlar ro'yxatini olish (dropdown uchun)

**Query Params:**
```
GET /api/v1/other-paid-groups/active?limit=50
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Maoshlar"
    },
    {
      "id": 2,
      "name": "Kommunal to'lovlar"
    },
    {
      "id": 3,
      "name": "Ijara"
    },
    {
      "id": 4,
      "name": "Soliqlar"
    },
    {
      "id": 5,
      "name": "Boshqa"
    }
  ]
}
```

**Service Layer Implementation:**
```typescript
async findActive(): Promise<OtherPaidGroup[]> {
  return this.prisma.otherPaidGroup.findMany({
    where: {
      status: 'ACTIVE',
      deleted_at: null
    },
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    },
    take: 50
  });
}
```

---

### 3.5 PUT /api/v1/other-paid-groups/:id

**Tavsif:** OtherPaidGroup yangilash (Admin, Accountant)

**Request Body:**
```json
{
  "name": "Maoshlar (Updated)",
  "description": "Yangilangan tavsif",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "To'lov guruhi muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Maoshlar (Updated)",
    "description": "Yangilangan tavsif",
    "status": "ACTIVE",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async update(id: number, updateOtherPaidGroupDto: UpdateOtherPaidGroupDto, userId: number): Promise<OtherPaidGroup> {
  // 1. Guruh mavjudligini tekshirish
  const group = await this.prisma.otherPaidGroup.findUnique({
    where: { id }
  });

  if (!group || group.deleted_at) {
    throw new NotFoundException('OPG_002');
  }

  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateOtherPaidGroupDto.name && updateOtherPaidGroupDto.name !== group.name) {
    const existing = await this.prisma.otherPaidGroup.findFirst({
      where: {
        name: updateOtherPaidGroupDto.name,
        id: { not: id },
        deleted_at: null
      }
    });

    if (existing) {
      throw new ConflictException('OPG_001');
    }
  }

  // 3. Guruh yangilash
  const updated = await this.prisma.otherPaidGroup.update({
    where: { id },
     {
      ...updateOtherPaidGroupDto,
      updated_at: new Date(),
      modified_by: userId
    },
    include: {
      _count: {
        select: { other_paid: true }
      }
    }
  });

  return updated;
}
```

---

### 3.6 DELETE /api/v1/other-paid-groups/:id

**Tavsif:** OtherPaidGroup o'chirish (soft delete) (Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "To'lov guruhi muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "Maoshlar",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, userId: number): Promise<OtherPaidGroup> {
  // 1. Guruh mavjudligini tekshirish
  const group = await this.prisma.otherPaidGroup.findUnique({
    where: { id }
  });

  if (!group || group.deleted_at) {
    throw new NotFoundException('OPG_002');
  }

  // 2. Bog'liq OtherPaid yozuvlarini tekshirish
  const otherPaidCount = await this.prisma.otherPaid.count({
    where: {
      group_id: id,
      deleted_at: null
    }
  });

  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (otherPaidCount > 0) {
    this.logger.warn(
      `OtherPaidGroup ${id} has ${otherPaidCount} other paid records. 
       Their group_id will be set to NULL.`
    );
  }

  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.otherPaidGroup.update({
    where: { id },
     {
      status: 'INACTIVE',
      deleted_at: new Date(),
      modified_by: userId,
      updated_at: new Date()
    }
  });
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-other-paid-group.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches
} from 'class-validator';

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export class CreateOtherPaidGroupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Guruh nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Guruh nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Guruh nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}

// update-other-paid-group.dto.ts
export class UpdateOtherPaidGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | OPG_003 | Guruh nomi majburiy |
| `name` | MinLength 3 | OPG_003 | Guruh nomi kamida 3 belgi |
| `name` | MaxLength 100 | OPG_003 | Guruh nomi 100 belgidan oshmasin |
| `name` | Pattern | OPG_003 | Noto'g'ri belgilar |
| `name` | Unique | OPG_001 | Guruh nomi allaqachon mavjud |
| `description` | MaxLength 255 | OPG_004 | Tavsif 255 belgidan oshmasin |
| `status` | Enum | OPG_005 | ACTIVE/INACTIVE/ARCHIVED |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `OPG_001` | 409 Conflict | Guruh nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `OPG_002` | 404 Not Found | To'lov guruhi topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `OPG_003` | 400 Bad Request | Guruh nomi noto'g'ri | Validation failed | 3-100 belgi, to'g'ri format |
| `OPG_004` | 400 Bad Request | Tavsif juda uzun | Validation failed | Max 255 belgi |
| `OPG_005` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |
| `OPG_006` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |

### 5.2 Exception Filter

```typescript
// other-paid-group-exception.filter.ts
@Catch()
export class OtherPaidGroupExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'OPG_001';
    if (exception instanceof NotFoundException) return 'OPG_002';
    if (exception instanceof ForbiddenException) return 'OPG_006';
    if (exception instanceof BadRequestException) return 'OPG_003';
    return 'OPG_002';
  }
}
```

---

## 6. XAVFSIZLIK TALABLARI (Reference: `Klinika.md` 8)

### 6.1 Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi (Reference: `Klinika.md` 8.1)
- ✅ Token expiry: 24 soat
- ✅ Token validatsiyasi har bir so'rovda

### 6.2 Avtorizatsiya (RBAC) (Reference: `Klinika.md` 6.1)

| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /other-paid-groups | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /other-paid-groups | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /other-paid-groups/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| PUT /other-paid-groups/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| DELETE /other-paid-groups/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /other-paid-groups/active | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Moliyaviy Xavfsizlik (Reference: `Klinika.md` 8.1, 9.2)
- ✅ Guruh nomi unikal bo'lishi kerak
- ✅ Moliyaviy operatsiyalar audit qilinadi
- ✅ Faqat Admin/Accountant guruh boshqarish huquqiga ega
- ✅ Faqat Admin guruh o'chirish huquqiga ega

---

## 7. SEED DATA

### 7.1 Standart OtherPaidGroup (Reference: `Klinika.md` 3.5)

```typescript
// seed/other-paid-group.seed.ts
export async function seedOtherPaidGroups(prisma: PrismaClient) {
  // Standart chiqim kategoriyalari
  const groups = [
    { 
      name: 'Maoshlar', 
      description: 'Xodimlarga to\'lanadigan maoshlar va bonuslar' 
    },
    { 
      name: 'Kommunal to\'lovlar', 
      description: 'Elektr, suv, gaz, internet to\'lovlari' 
    },
    { 
      name: 'Ijara', 
      description: 'Bino va jihozlar ijarasi' 
    },
    { 
      name: 'Soliqlar', 
      description: 'Davlat soliq to\'lovlari va majburiy to\'lovlar' 
    },
    { 
      name: 'Ofis xarajatlari', 
      description: 'Kanselyariya, ofis jihozlari' 
    },
    { 
      name: 'Tibbiy jihozlar', 
      description: 'Tibbiy asbob-uskunalar va sarf materiallari' 
    },
    { 
      name: 'Marketing', 
      description: 'Reklama va marketing xarajatlari' 
    },
    { 
      name: 'Ta\'mirlash', 
      description: 'Bino va jihozlarni ta\'mirlash' 
    },
    { 
      name: 'Transport', 
      description: 'Transport xarajatlari va yoqilg\'i' 
    },
    { 
      name: 'Boshqa', 
      description: 'Boshqa xarajatlar' 
    }
  ];

  for (const group of groups) {
    await prisma.otherPaidGroup.create({  group });
  }

  console.log(`✅ OtherPaidGroups seeded successfully (${groups.length} groups)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat OtherPaidGroup
npm run seed:other-paid-groups
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Standart kategoriyalar mavjudligi tekshiriladi
- [ ] Moliyaviy ma'lumotlar konfidensialligi ta'minlanadi
- [ ] Backup qilish rejasi tayyor
- [ ] Moliyaviy hisob-kitoblar tekshiriladi

---

## 8. TEST TALABLARI

### 8.1 Unit Test Coverage (Reference: `Klinika.md` 9.1)

| Test Type | Minimum Coverage | Priority |
|-----------|-----------------|----------|
| Service Layer | 90% | 🔴 High |
| Controller Layer | 80% | 🟡 Medium |
| Validation | 95% | 🔴 High |
| Integration | 70% | 🟡 Medium |

### 8.2 Test Cases

```typescript
// other-paid-group.service.spec.ts
describe('OtherPaidGroupService', () => {
  let service: OtherPaidGroupService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtherPaidGroupService, PrismaService],
    }).compile();

    service = module.get<OtherPaidGroupService>(OtherPaidGroupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new otherPaidGroup successfully', async () => {
      const dto: CreateOtherPaidGroupDto = {
        name: 'Test Guruh',
        description: 'Test description',
        status: 'ACTIVE',
      };

      prisma.otherPaidGroup.findFirst = jest.fn().mockResolvedValue(null);
      prisma.otherPaidGroup.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('Test Guruh');
      expect(prisma.otherPaidGroup.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if group name exists', async () => {
      const dto: CreateOtherPaidGroupDto = {
        name: 'Maoshlar',
        description: 'Test',
      };

      prisma.otherPaidGroup.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Maoshlar' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated otherPaidGroups', async () => {
      const query: GetOtherPaidGroupsQuery = { page: 1, limit: 20 };

      prisma.otherPaidGroup.findMany = jest.fn().mockResolvedValue([]);
      prisma.otherPaidGroup.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft delete a otherPaidGroup', async () => {
      prisma.otherPaidGroup.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.otherPaid.count = jest.fn().mockResolvedValue(0);
      prisma.otherPaidGroup.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });

    it('should log warning if group has otherPaid records', async () => {
      prisma.otherPaidGroup.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.otherPaid.count = jest.fn().mockResolvedValue(5);
      prisma.otherPaidGroup.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const loggerSpy = jest.spyOn(service['logger'], 'warn');

      await service.remove(1, 1);

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('5 other paid records'));
    });
  });

  describe('findActive', () => {
    it('should return only active groups', async () => {
      prisma.otherPaidGroup.findMany = jest.fn().mockResolvedValue([
        { id: 1, name: 'Maoshlar' },
        { id: 2, name: 'Kommunal' }
      ]);

      const result = await service.findActive();

      expect(result.length).toBe(2);
      expect(prisma.otherPaidGroup.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ACTIVE',
          deleted_at: null
        },
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        },
        take: 50
      });
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_other_paid_group

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create OtherPaidGroup Table
CREATE TABLE "other_paid_groups" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_other_paid_group_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_other_paid_group_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "other_paid_groups_status_idx" ON "other_paid_groups"("status");
CREATE INDEX "other_paid_groups_name_idx" ON "other_paid_groups"("name");
CREATE INDEX "other_paid_groups_deleted_at_idx" ON "other_paid_groups"("deleted_at");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_other_paid_group"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "other_paid_groups" CASCADE;
```

### 9.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi (Reference: `klinika_prisma.txt`)
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (10 ta standart kategoriya)
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor
- [ ] Performance test o'tkazildi (Reference: `Klinika.md` 9.1)

---

## 10. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 10.1 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
@@index([status])           // Status filter uchun
@@index([name])             // Name search uchun (dropdown uchun muhim)
@@index([deleted_at])       // Soft delete filter uchun
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Active Groups | Redis | 10 daqiqa | Group create/update/delete |
| All Groups | Redis | 5 daqiqa | Group create/update/delete |
| Single Group | Redis | 2 daqiqa | Group update/delete |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const groups = await prisma.otherPaidGroup.findMany({
  select: { 
    id: true, 
    name: true
  },
  where: { 
    deleted_at: null, 
    status: 'ACTIVE'
  },
  orderBy: { name: 'asc' },
  take: 50
});

// ✅ Yaxshi - Count bilan
const groups = await prisma.otherPaidGroup.findMany({
  where: { deleted_at: null, status: 'ACTIVE' },
  include: { _count: { select: { other_paid: true } } }
});

// ❌ Yomon - Barcha maydonlar
const groups = await prisma.otherPaidGroup.findMany();
```

### 10.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `16-other-paid-group-management.md` | ⏳ Keyingi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| ClientPaid RFC | `RFC-015-client-paid-management.md` | ✅ Tasdiqlandi |
| OtherPaid RFC | `RFC-017-other-paid-management.md` | ⏳ Keyingi |
| ServiceUser RFC | `RFC-018-service-user-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Guruh nomi 3-100 belgi orasida bo'lishi
- [ ] Guruh nomi unikal bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin/Accountant guruh yaratish/o'zgartirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Faqat Admin guruh o'chirish huquqiga ega
- [ ] Barcha moliyaviy rollar guruh ro'yxatini ko'ra oladi
- [ ] Faol guruhlar endpoint ishlaydi (dropdown uchun)
- [ ] Pagination va filterlash ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull)
- [ ] Seed data 10 ta standart kategoriya bilan yuklanadi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq
- [ ] Concurrent users 50+ qo'llab-quvvatlanadi
- [ ] Data retention 5 yil

---

## 13. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Guruh nomi takrorlanishi | O'rta | Yuqori | Unique constraint + validation |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Data privacy concerns | Past | Yuqori | Data encryption + access control (Reference: `Klinika.md` 8.1) |
| Group deletion abuse | O'rta | Yuqori | Role-based access control (Admin only) |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Budget planning per category | 🟡 Medium | Phase 3 |
| Expense statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| Group change history | 🟢 Low | Phase 4 |
| Category approval workflow | 🟢 Low | Phase 4 |
| Multi-branch category support | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |
| **Finance Audit** | Chief Accountant | __________ | _________ |
