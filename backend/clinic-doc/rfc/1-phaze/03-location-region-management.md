# 📋 RFC-003: Viloyatlar Boshqaruvi (LocRegion Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-003 |
| **Nomi** | LocRegion Management |
| **Phase** | 1 - Foundation |
| **Model** | `LocRegion` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Foundation - Klassifikator) |
| **Bog'liq RFC** | RFC-001 (UserRole), RFC-002 (User) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC O'zbekiston Respublikasi viloyatlarini (LocRegion) tizimda saqlash, boshqarish va mijozlarni hududiy joylashuvi bo'yicha klassifikatsiya qilish uchun to'liq texnik specifikatsiyani taqdim etadi.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Viloyat yaratish (Create) | ❌ Tuman boshqaruvi (bu alohida RFC) |
| ✅ Viloyat ro'yxatini olish (Read) | ❌ Mahalla darajasi (kelajakda) |
| ✅ Viloyat yangilash (Update) | ❌ Frontend implementatsiya |
| ✅ Viloyat o'chirish - Soft Delete | ❌ Third-party integratsiya |
| ✅ Viloyat validatsiyasi | |

### 1.3 Biznes Qiymati
- Mijozlarni hududiy joylashuvi bo'yicha klassifikatsiya qilish
- Hisobotlarda hududiy statistika olish
- Mijoz manbailarini tahlil qilish (geografiya bo'yicha)
- Klinika filialarini kengaytirishda hudud ma'lumotlaridan foydalanish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema

```prisma
model LocRegion {
  id           Int          @id @default(autoincrement())
  name         String       @db.VarChar(100)
  status       RecordStatus @default(ACTIVE)
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?        @map("registered_by")
  modified_by  Int?         @map("modified_by")

  // Relations
  register_user User?       @relation("fk_loc_region_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_loc_region_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  clients      Client[]     @relation("fk_client_region")
  districts    LocDistrict[] @relation("fk_loc_district_region")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("loc_regions")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Client va LocDistrict jadvallari bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Viloyat nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Toshkent viloyati", "Samarqand viloyati". Lotin va Kirill harflari ruxsat etiladi |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (vaqtincha to'xtatilgan), ARCHIVED (arxivlangan). Yangi viloyat yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |

### 2.3 Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv viloyatlar) |
| `@@index([name])` | name | Viloyat nomi bo'yicha qidiruvni tezlashtirish (search/dropdown uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan viloyatlarni ajratish) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_loc_region_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_loc_region_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_client_region` | Client | 1:N | SetNull | Cascade | Viloyat o'chirilganda mijozlarning region_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |
| `fk_loc_district_region` | LocDistrict | 1:N | SetNull | Cascade | Viloyat o'chirilganda tumanlarning region_id NULL ga o'zgaradi. Tuman ma'lumoti saqlanib qoladi |

### 2.5 Cascade Rules Tushunchasi

```
Viloyat o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. LocRegion.status = 'INACTIVE'               │
│ 2. LocRegion.deleted_at = NOW()                │
│ 3. Client.region_id = NULL (SetNull)           │
│ 4. LocDistrict.region_id = NULL (SetNull)      │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi.
```

---

## 3. ENUM TUZILISHI

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - viloyat ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - viloyat vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - viloyat tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | Viloyat to'liq ishlaydi | Yangi viloyat yaratilganda default. Dropdownlarda ko'rinadi |
| `INACTIVE` | Viloyat vaqtincha o'chirilgan | Noto'g'ri ma'lumot kiritilganda, vaqtincha bloklash |
| `ARCHIVED` | Viloyat arxivlangan | Hududiy o'zgarishlar bo'lganda (kam uchraydi) |

### 3.2 Status O'zgarish Qoidalari

```
ACTIVE → INACTIVE  ✅ Ruxsat etiladi (Admin tomonidan)
ACTIVE → ARCHIVED  ✅ Ruxsat etiladi (Hududiy o'zgarish)
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
| 1 | POST | `/api/v1/locations/regions` | ✅ JWT | Admin | Yangi viloyat yaratish |
| 2 | GET | `/api/v1/locations/regions` | ✅ JWT | Barchasi | Viloyat ro'yxatini olish |
| 3 | GET | `/api/v1/locations/regions/:id` | ✅ JWT | Barchasi | Bitta viloyat ma'lumotlari |
| 4 | PUT | `/api/v1/locations/regions/:id` | ✅ JWT | Admin | Viloyat yangilash |
| 5 | DELETE | `/api/v1/locations/regions/:id` | ✅ JWT | Admin | Viloyat o'chirish (soft) |

---

### 4.2 POST /api/v1/locations/regions

**Tavsif:** Admin tomonidan yangi viloyat yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateRegionDto {
  name: string;       // 3-100 belgi, unikal
  status?: string;    // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Toshkent viloyati",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Viloyat muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Toshkent viloyati",
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
// location.service.ts
async createRegion(createRegionDto: CreateRegionDto, userId: number): Promise<LocRegion> {
  // 1. Name unikal ekanligini tekshirish (case-insensitive)
  const existing = await this.prisma.locRegion.findFirst({
    where: {
      name: {
        equals: createRegionDto.name,
        mode: 'insensitive'
      },
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('LOC_001');
  }
  
  // 2. Viloyat yaratish
  const region = await this.prisma.locRegion.create({
     {
      name: createRegionDto.name,
      status: createRegionDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return region;
}
```

---

### 4.3 GET /api/v1/locations/regions

**Tavsif:** Barcha viloyatlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 100 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Viloyat nomi bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/locations/regions?page=1&limit=100&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Andijon viloyati",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { 
        "clients": 150, 
        "districts": 14 
      }
    },
    {
      "id": 2,
      "name": "Buxoro viloyati",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { 
        "clients": 120, 
        "districts": 11 
      }
    },
    {
      "id": 3,
      "name": "Toshkent viloyati",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { 
        "clients": 500, 
        "districts": 15 
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 14,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetRegionsQuery): Promise<PaginatedResult<LocRegion>> {
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
    this.prisma.locRegion.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { 
            clients: true,
            districts: true
          }
        }
      }
    }),
    this.prisma.locRegion.count({ where })
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

### 4.4 GET /api/v1/locations/regions/:id

**Tavsif:** Bitta viloyat ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Viloyat ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Toshkent viloyati",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null,
    "districts": [
      { "id": 1, "name": "Bo'ka tumani" },
      { "id": 2, "name": "O'rtachirchiq tumani" }
    ],
    "_count": { 
      "clients": 500, 
      "districts": 15 
    }
  }
}
```

**Service Layer Implementation:**
```typescript
async findOne(id: number): Promise<LocRegion> {
  const region = await this.prisma.locRegion.findUnique({
    where: { id },
    include: {
      districts: {
        where: { deleted_at: null },
        select: { id: true, name: true }
      },
      _count: {
        select: { 
          clients: { where: { deleted_at: null } },
          districts: { where: { deleted_at: null } }
        }
      }
    }
  });
  
  if (!region || region.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  return region;
}
```

---

### 4.5 PUT /api/v1/locations/regions/:id

**Tavsif:** Viloyat ma'lumotlarini yangilash

**Request Body:**
```json
{
  "name": "Toshkent viloyati (Updated)",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Viloyat muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Toshkent viloyati (Updated)",
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
async updateRegion(id: number, updateRegionDto: UpdateRegionDto, userId: number): Promise<LocRegion> {
  // 1. Viloyat mavjudligini tekshirish
  const region = await this.prisma.locRegion.findUnique({
    where: { id }
  });
  
  if (!region || region.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateRegionDto.name && updateRegionDto.name !== region.name) {
    const existing = await this.prisma.locRegion.findFirst({
      where: {
        name: {
          equals: updateRegionDto.name,
          mode: 'insensitive'
        },
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('LOC_001');
    }
  }
  
  // 3. Viloyat yangilash
  const updated = await this.prisma.locRegion.update({
    where: { id },
     {
      ...updateRegionDto,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

---

### 4.6 DELETE /api/v1/locations/regions/:id

**Tavsif:** Viloyatni soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Viloyat muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "Toshkent viloyati",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async removeRegion(id: number, userId: number): Promise<LocRegion> {
  // 1. Viloyat mavjudligini tekshirish
  const region = await this.prisma.locRegion.findUnique({
    where: { id }
  });
  
  if (!region || region.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const clientCount = await this.prisma.client.count({
    where: { region_id: id, deleted_at: null }
  });
  
  const districtCount = await this.prisma.locDistrict.count({
    where: { region_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (clientCount > 0 || districtCount > 0) {
    this.logger.warn(
      `Region ${id} has ${clientCount} clients and ${districtCount} districts. 
       Their region_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.locRegion.update({
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
// create-region.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Viloyat nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Viloyat nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Viloyat nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}
```

### 5.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | LOC_010 | Viloyat nomi majburiy |
| `name` | MinLength 3 | LOC_002 | Viloyat nomi kamida 3 belgi |
| `name` | MaxLength 100 | LOC_002 | Viloyat nomi 100 belgidan oshmasin |
| `name` | Pattern | LOC_002 | Noto'g'ri belgilar |
| `name` | Unique | LOC_001 | Viloyat nomi allaqachon mavjud |
| `status` | Enum | LOC_011 | ACTIVE/INACTIVE/ARCHIVED |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `LOC_001` | 409 Conflict | Viloyat nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `LOC_002` | 400 Bad Request | Viloyat nomi juda qisqa/uzun | Validation failed | 3-100 belgi kiriting |
| `LOC_003` | 404 Not Found | Viloyat topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `LOC_004` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `LOC_005` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |
| `LOC_010` | 400 Bad Request | Viloyat nomi majburiy | Validation failed | Nomi kiriting |
| `LOC_011` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

### 6.2 Exception Filter

```typescript
// location-exception.filter.ts
@Catch()
export class LocationExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'LOC_001';
    if (exception instanceof BadRequestException) return 'LOC_002';
    if (exception instanceof NotFoundException) return 'LOC_003';
    if (exception instanceof ForbiddenException) return 'LOC_004';
    return 'LOC_005';
  }
}
```

---

## 7. XAVFSIZLIK TALABLARI

### 7.1 Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi
- ✅ Token expiry: 24 soat
- ✅ Token validatsiyasi har bir so'rovda

### 7.2 Avtorizatsiya (RBAC)

| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /locations/regions | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /locations/regions | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /locations/regions/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /locations/regions/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /locations/regions/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 Audit
- ✅ `created_at` - Yaratilgan vaqt (avtomatik)
- ✅ `updated_at` - Oxirgi o'zgarish (avtomatik)
- ✅ `deleted_at` - Soft delete vaqti (manual)
- ✅ `registered_by` - Kim yaratdi (User ID)
- ✅ `modified_by` - Kim o'zgartirdi (User ID)

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

### 8.1 O'zbekiston Viloyatlari

```typescript
// seed/location-region.seed.ts
export async function seedLocRegions(prisma: PrismaClient) {
  const regions = [
    "Toshkent shahar",
    "Toshkent viloyati",
    "Samarqand viloyati",
    "Buxoro viloyati",
    "Xorazm viloyati",
    "Farg'ona viloyati",
    "Namangan viloyati",
    "Andijon viloyati",
    "Qashqadaryo viloyati",
    "Surxondaryo viloyati",
    "Jizzax viloyati",
    "Sirdaryo viloyati",
    "Navoiy viloyati",
    "Qoraqalpog'iston Respublikasi"
  ];

  for (const name of regions) {
    await prisma.locRegion.upsert({
      where: { name },
      update: {},
      create: {
        name,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ LocRegions seeded successfully (14 regions + 1 capital)');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat viloyatlar
npm run seed:regions
```

### 8.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Viloyat nomlarini o'zgartirishdan oldin backup qilish
- [ ] Mavjud mijozlarning region_id tekshirish
- [ ] Tumanlarni viloyatlarga bog'lash

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
// location.service.spec.ts
describe('LocationService', () => {
  let service: LocationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService, PrismaService],
    }).compile();

    service = module.get<LocationService>(LocationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createRegion', () => {
    it('should create a new region successfully', async () => {
      const dto: CreateRegionDto = {
        name: 'Test Viloyati',
        status: 'ACTIVE',
      };

      prisma.locRegion.findFirst = jest.fn().mockResolvedValue(null);
      prisma.locRegion.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.createRegion(dto, 1);

      expect(result.name).toBe('Test Viloyati');
      expect(prisma.locRegion.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if region name exists', async () => {
      const dto: CreateRegionDto = {
        name: 'Toshkent viloyati',
      };

      prisma.locRegion.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Toshkent viloyati' });

      await expect(service.createRegion(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated regions', async () => {
      const query: GetRegionsQuery = { page: 1, limit: 100 };

      prisma.locRegion.findMany = jest.fn().mockResolvedValue([]);
      prisma.locRegion.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('removeRegion', () => {
    it('should soft delete a region', async () => {
      prisma.locRegion.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.client.count = jest.fn().mockResolvedValue(0);
      prisma.locDistrict.count = jest.fn().mockResolvedValue(0);
      prisma.locRegion.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.removeRegion(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

### 9.3 E2E Test

```typescript
// location.e2e-spec.ts
describe('Location (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    
    authToken = await getAdminToken();
  });

  it('/api/v1/locations/regions (POST) - Create region', () => {
    return request(app.getHttpServer())
      .post('/api/v1/locations/regions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Viloyati',
        status: 'ACTIVE',
      })
      .expect(201);
  });

  it('/api/v1/locations/regions (GET) - Get all regions', () => {
    return request(app.getHttpServer())
      .get('/api/v1/locations/regions')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/locations/regions/:id (DELETE) - Soft delete region', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/locations/regions/1')
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
npx prisma migrate dev --name create_loc_region

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "loc_regions" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_loc_region_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_loc_region_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "loc_regions_status_idx" ON "loc_regions"("status");
CREATE INDEX "loc_regions_name_idx" ON "loc_regions"("name");
CREATE INDEX "loc_regions_deleted_at_idx" ON "loc_regions"("deleted_at");
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_loc_region"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "loc_regions" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (14 ta viloyat + 1 ta poytaxt)
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi
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
| Region List | Redis | 1 soat | Region create/update/delete |
| Single Region | Redis | 30 daqiqa | Region update/delete |
| All Active Regions | In-Memory | 1 soat | App restart |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const regions = await prisma.locRegion.findMany({
  select: { 
    id: true, 
    name: true, 
    status: true,
    _count: { select: { clients: true, districts: true } }
  },
  where: { deleted_at: null, status: 'ACTIVE' }
});

// ❌ Yomon - Barcha maydonlar
const regions = await prisma.locRegion.findMany();
```

### 11.4 Frontend uchun Optimizatsiya

```typescript
// Dropdown uchun faqat aktiv viloyatlar
GET /api/v1/locations/regions?status=ACTIVE&limit=100&sortBy=name&sortOrder=asc

// Response cache qilish (1 soat)
Cache-Control: public, max-age=3600
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `03-location-region.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| LocDistrict RFC | `RFC-004-location-district.md` | ⏳ Keyingi |
| Client RFC | `RFC-005-client-management.md` | ⏳ Kelajakda |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Viloyat nomi unikal bo'lishi (case-insensitive)
- [ ] Viloyat nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin viloyat yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar viloyat ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi (14 ta viloyat + 1 ta poytaxt)
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi
- [ ] Cascade rules ishlaydi (SetNull)

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
| Viloyat nomi takrorlanishi | O'rta | Yuqori | Unique constraint + case-insensitive check |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Region o'zgarishi (kam) | Past | O'rta | ARCHIVED status + migration script |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Mahalla darajasi (LocMahalla) | 🟢 Low | Phase 4 |
| GPS coordinates | 🟢 Low | Phase 4 |
| Region statistics dashboard | 🟡 Medium | Phase 3 |
| Bulk import/export | 🟢 Low | Phase 3 |
| Region change history | 🟢 Low | Phase 4 |

---