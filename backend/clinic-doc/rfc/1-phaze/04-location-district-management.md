# 📋 RFC-004: Tumanlar Boshqaruvi (LocDistrict Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-004 |
| **Nomi** | LocDistrict Management |
| **Phase** | 1 - Foundation |
| **Model** | `LocDistrict` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Foundation - Klassifikator) |
| **Bog'liq RFC** | RFC-001 (UserRole), RFC-002 (User), RFC-003 (LocRegion) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC O'zbekiston Respublikasi tumanlarini (LocDistrict) tizimda saqlash, viloyatlar bilan bog'lash va mijozlarni hududiy joylashuvi bo'yicha aniq klassifikatsiya qilish uchun to'liq texnik specifikatsiyani taqdim etadi.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Tuman yaratish (Create) | ❌ Mahalla boshqaruvi (kelajakda) |
| ✅ Tuman ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Tuman yangilash (Update) | ❌ Third-party integratsiya |
| ✅ Tuman o'chirish - Soft Delete | ❌ Import/Export (kelajakda) |
| ✅ Tuman validatsiyasi | |
| ✅ Viloyat bilan bog'lash | |

### 1.3 Biznes Qiymati
- Mijozlarni aniq hududiy joylashuvi bo'yicha klassifikatsiya qilish
- Hisobotlarda tuman kesimida statistika olish
- Mijoz manbailarini tahlil qilish (tuman bo'yicha)
- Klinika filiallarini kengaytirishda hudud ma'lumotlaridan foydalanish
- Yetkazib berish xizmatlari uchun manzil ma'lumotlari

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema

```prisma
model LocDistrict {
  id           Int          @id @default(autoincrement())
  name         String       @db.VarChar(100)
  region_id    Int?         @map("region_id")
  status       RecordStatus @default(ACTIVE)
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?        @map("registered_by")
  modified_by  Int?         @map("modified_by")

  // Relations
  region       LocRegion?   @relation("fk_loc_district_region", fields: [region_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?       @relation("fk_loc_district_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_loc_district_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  clients      Client[]     @relation("fk_client_district")

  @@index([region_id])
  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@index([region_id, status])
  @@map("loc_districts")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Client jadvali bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Tuman nomi**. 3-100 belgi, region ichida unikal bo'lishi shart. Misol: "Bo'ka tumani", "O'rtachirchiq tumani". Lotin va Kirill harflari ruxsat etiladi |
| `region_id` | Int | ❌ | null | INTEGER | **Foreign Key**. LocRegion jadvaliga bog'lanish. SetNull cascade - viloyat o'chirilganda null bo'ladi. Viloyat bilan bog'lash uchun (ixtiyoriy - poytaxt tumanlari uchun null bo'lishi mumkin) |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (vaqtincha to'xtatilgan), ARCHIVED (arxivlangan). Yangi tuman yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |

### 2.3 Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([region_id])` | region_id | Viloyat bo'yicha filter qilishni tezlashtirish (viloyat tumanlarini olish uchun eng muhim) |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv tumanlar) |
| `@@index([name])` | name | Tuman nomi bo'yicha qidiruvni tezlashtirish (search/dropdown uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan tumanlarni ajratish) |
| `@@index([region_id, status])` | region_id, status | **Qo'shma index** - viloyat va status bo'yicha filter (eng ko'p ishlatiladigan query kombinatsiyasi) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_loc_district_region` | LocRegion | N:1 | SetNull | Cascade | Viloyat o'chirilganda tumaning region_id NULL ga o'zgaradi. Tuman ma'lumoti saqlanib qoladi |
| `fk_loc_district_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_loc_district_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_client_district` | Client | 1:N | SetNull | Cascade | Tuman o'chirilganda mijozlarning district_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |

### 2.5 Cascade Rules Tushunchasi

```
Tuman o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. LocDistrict.status = 'INACTIVE'             │
│ 2. LocDistrict.deleted_at = NOW()              │
│ 3. Client.district_id = NULL (SetNull)         │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi.
```

---

## 3. ENUM TUZILISHI

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - tuman ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - tuman vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - tuman tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | Tuman to'liq ishlaydi | Yangi tuman yaratilganda default. Dropdownlarda ko'rinadi |
| `INACTIVE` | Tuman vaqtincha o'chirilgan | Noto'g'ri ma'lumot kiritilganda, vaqtincha bloklash |
| `ARCHIVED` | Tuman arxivlangan | Hududiy o'zgarishlar bo'lganda (kam uchraydi) |

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
| 1 | POST | `/api/v1/locations/districts` | ✅ JWT | Admin | Yangi tuman yaratish |
| 2 | GET | `/api/v1/locations/districts` | ✅ JWT | Barchasi | Tuman ro'yxatini olish |
| 3 | GET | `/api/v1/locations/regions/:regionId/districts` | ✅ JWT | Barchasi | Viloyat tumanlarini olish |
| 4 | GET | `/api/v1/locations/districts/:id` | ✅ JWT | Barchasi | Bitta tuman ma'lumotlari |
| 5 | PUT | `/api/v1/locations/districts/:id` | ✅ JWT | Admin | Tuman yangilash |
| 6 | DELETE | `/api/v1/locations/districts/:id` | ✅ JWT | Admin | Tuman o'chirish (soft) |

---

### 4.2 POST /api/v1/locations/districts

**Tavsif:** Admin tomonidan yangi tuman yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateDistrictDto {
  name: string;       // 3-100 belgi, unikal (region ichida)
  region_id?: number; // Mavjud LocRegion ID
  status?: string;    // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Bo'ka tumani",
  "region_id": 1,
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tuman muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Bo'ka tumani",
    "region_id": 1,
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
async createDistrict(createDistrictDto: CreateDistrictDto, userId: number): Promise<LocDistrict> {
  // 1. Region mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createDistrictDto.region_id) {
    const region = await this.prisma.locRegion.findUnique({
      where: { id: createDistrictDto.region_id }
    });
    
    if (!region || region.deleted_at) {
      throw new NotFoundException('LOC_006');
    }
  }
  
  // 2. Name unikal ekanligini tekshirish (region ichida, case-insensitive)
  const existing = await this.prisma.locDistrict.findFirst({
    where: {
      name: {
        equals: createDistrictDto.name,
        mode: 'insensitive'
      },
      region_id: createDistrictDto.region_id || null,
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('LOC_004');
  }
  
  // 3. Tuman yaratish
  const district = await this.prisma.locDistrict.create({
     {
      name: createDistrictDto.name,
      region_id: createDistrictDto.region_id,
      status: createDistrictDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return district;
}
```

---

### 4.3 GET /api/v1/locations/districts

**Tavsif:** Barcha tumanlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 100 | Sahifadagi elementlar soni (max 100) |
| `region_id` | number | - | Viloyat bo'yicha filter |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Tuman nomi bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/locations/districts?page=1&limit=100&region_id=1&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bo'ka tumani",
      "region": {
        "id": 1,
        "name": "Toshkent viloyati"
      },
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 150 }
    },
    {
      "id": 2,
      "name": "O'rtachirchiq tumani",
      "region": {
        "id": 1,
        "name": "Toshkent viloyati"
      },
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 120 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 170,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetDistrictsQuery): Promise<PaginatedResult<LocDistrict>> {
  const where: any = { deleted_at: null };
  
  // Region filter
  if (query.region_id) {
    where.region_id = query.region_id;
  }
  
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
    this.prisma.locDistrict.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        region: {
          select: { id: true, name: true }
        },
        _count: {
          select: { clients: true }
        }
      }
    }),
    this.prisma.locDistrict.count({ where })
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

### 4.4 GET /api/v1/locations/regions/:regionId/districts

**Tavsif:** Bir viloyatga tegishli barcha tumanlarni olish (dropdown uchun optimallashtirilgan)

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `regionId` | number | Viloyat ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Bo'ka tumani",
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "name": "O'rtachirchiq tumani",
      "status": "ACTIVE"
    }
  ]
}
```

**Service Layer Implementation:**
```typescript
async findByRegion(regionId: number): Promise<LocDistrict[]> {
  return this.prisma.locDistrict.findMany({
    where: {
      region_id: regionId,
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      name: true,
      status: true
    },
    orderBy: { name: 'asc' }
  });
}
```

---

### 4.5 GET /api/v1/locations/districts/:id

**Tavsif:** Bitta tuman ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Tuman ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Bo'ka tumani",
    "region": {
      "id": 1,
      "name": "Toshkent viloyati"
    },
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null,
    "_count": { "clients": 150 }
  }
}
```

**Service Layer Implementation:**
```typescript
async findOne(id: number): Promise<LocDistrict> {
  const district = await this.prisma.locDistrict.findUnique({
    where: { id },
    include: {
      region: {
        select: { id: true, name: true }
      },
      _count: {
        select: { clients: { where: { deleted_at: null } } }
      }
    }
  });
  
  if (!district || district.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  return district;
}
```

---

### 4.6 PUT /api/v1/locations/districts/:id

**Tavsif:** Tuman ma'lumotlarini yangilash

**Request Body:**
```json
{
  "name": "Bo'ka tumani (Updated)",
  "region_id": 1,
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tuman muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Bo'ka tumani (Updated)",
    "region_id": 1,
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
async updateDistrict(id: number, updateDistrictDto: UpdateDistrictDto, userId: number): Promise<LocDistrict> {
  // 1. Tuman mavjudligini tekshirish
  const district = await this.prisma.locDistrict.findUnique({
    where: { id }
  });
  
  if (!district || district.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  // 2. Region mavjudligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateDistrictDto.region_id && updateDistrictDto.region_id !== district.region_id) {
    const region = await this.prisma.locRegion.findUnique({
      where: { id: updateDistrictDto.region_id }
    });
    
    if (!region || region.deleted_at) {
      throw new NotFoundException('LOC_006');
    }
  }
  
  // 3. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateDistrictDto.name && updateDistrictDto.name !== district.name) {
    const existing = await this.prisma.locDistrict.findFirst({
      where: {
        name: {
          equals: updateDistrictDto.name,
          mode: 'insensitive'
        },
        region_id: updateDistrictDto.region_id || district.region_id,
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('LOC_004');
    }
  }
  
  // 4. Tuman yangilash
  const updated = await this.prisma.locDistrict.update({
    where: { id },
     {
      ...updateDistrictDto,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

---

### 4.7 DELETE /api/v1/locations/districts/:id

**Tavsif:** Tumanni soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tuman muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "Bo'ka tumani",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async removeDistrict(id: number, userId: number): Promise<LocDistrict> {
  // 1. Tuman mavjudligini tekshirish
  const district = await this.prisma.locDistrict.findUnique({
    where: { id }
  });
  
  if (!district || district.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const clientCount = await this.prisma.client.count({
    where: { district_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (clientCount > 0) {
    this.logger.warn(
      `District ${id} has ${clientCount} clients. 
       Their district_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.locDistrict.update({
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
// create-district.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  Matches,
  Min
} from 'class-validator';

export class CreateDistrictDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Tuman nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Tuman nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Tuman nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Region ID musbat son bo\'lishi kerak' })
  region_id?: number;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}
```

### 5.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | LOC_010 | Tuman nomi majburiy |
| `name` | MinLength 3 | LOC_005 | Tuman nomi kamida 3 belgi |
| `name` | MaxLength 100 | LOC_005 | Tuman nomi 100 belgidan oshmasin |
| `name` | Pattern | LOC_005 | Noto'g'ri belgilar |
| `name` | Unique (region ichida) | LOC_004 | Tuman nomi allaqachon mavjud |
| `region_id` | IsInt | LOC_011 | Region ID raqam bo'lishi kerak |
| `region_id` | Min 1 | LOC_011 | Region ID musbat son bo'lishi kerak |
| `region_id` | Must Exist | LOC_006 | Viloyat topilmadi |
| `status` | Enum | LOC_012 | ACTIVE/INACTIVE/ARCHIVED |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `LOC_003` | 404 Not Found | Tuman topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `LOC_004` | 409 Conflict | Tuman nomi allaqachon mavjud | Name unique constraint (region ichida) | Boshqa nom tanlang |
| `LOC_005` | 400 Bad Request | Tuman nomi juda qisqa/uzun | Validation failed | 3-100 belgi kiriting |
| `LOC_006` | 404 Not Found | Viloyat topilmadi | Region ID not exists | Region ID ni tekshiring |
| `LOC_007` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `LOC_008` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |
| `LOC_010` | 400 Bad Request | Tuman nomi majburiy | Validation failed | Nomi kiriting |
| `LOC_011` | 400 Bad Request | Region ID noto'g'ri | Validation failed | Musbat raqam kiriting |
| `LOC_012` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

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
    if (exception instanceof ConflictException) return 'LOC_004';
    if (exception instanceof BadRequestException) return 'LOC_005';
    if (exception instanceof NotFoundException) return 'LOC_003';
    if (exception instanceof ForbiddenException) return 'LOC_007';
    return 'LOC_008';
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
| POST /locations/districts | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /locations/districts | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /locations/regions/:id/districts | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /locations/districts/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /locations/districts/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /locations/districts/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

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

### 8.1 O'zbekiston Tumanlari

```typescript
// seed/location-district.seed.ts
export async function seedLocDistricts(prisma: PrismaClient) {
  // Toshkent viloyati tumanlari (15 ta)
  const toshkentDistricts = [
    { name: "Bo'ka tumani", region_id: 1 },
    { name: "O'rtachirchiq tumani", region_id: 1 },
    { name: "Qibray tumani", region_id: 1 },
    { name: "Oqqo'rg'on tumani", region_id: 1 },
    { name: "Ohangaron tumani", region_id: 1 },
    { name: "Piskent tumani", region_id: 1 },
    { name: "Qo'yliq tumani", region_id: 1 },
    { name: "Zangiota tumani", region_id: 1 },
    { name: "Bekobod tumani", region_id: 1 },
    { name: "Bo'stonliq tumani", region_id: 1 },
    { name: "Chinoz tumani", region_id: 1 },
    { name: "Yangiyo'l tumani", region_id: 1 },
    { name: "Parkent tumani", region_id: 1 },
    { name: "Yuqorichirchiq tumani", region_id: 1 },
    { name: "Olmazor tumani", region_id: 1 }
  ];

  // Samarqand viloyati tumanlari (13 ta)
  const samarqandDistricts = [
    { name: "Bulung'ur tumani", region_id: 2 },
    { name: "Ishtixon tumani", region_id: 2 },
    { name: "Kattaqo'rg'on tumani", region_id: 2 },
    { name: "Qo'shrabot tumani", region_id: 2 },
    { name: "Narpay tumani", region_id: 2 },
    { name: "Nurobod tumani", region_id: 2 },
    { name: "Oqdaryo tumani", region_id: 2 },
    { name: "Paxtachi tumani", region_id: 2 },
    { name: "Pastdarg'om tumani", region_id: 2 },
    { name: "Payariq tumani", region_id: 2 },
    { name: "Samarqand tumani", region_id: 2 },
    { name: "Toyloq tumani", region_id: 2 },
    { name: "Urgut tumani", region_id: 2 }
  ];

  // Buxoro viloyati tumanlari (11 ta)
  const buxoroDistricts = [
    { name: "Olot tumani", region_id: 3 },
    { name: "Vobkent tumani", region_id: 3 },
    { name: "G'ijduvon tumani", region_id: 3 },
    { name: "Jondor tumani", region_id: 3 },
    { name: "Kogon tumani", region_id: 3 },
    { name: "Qorako'l tumani", region_id: 3 },
    { name: "Qorovulbozor tumani", region_id: 3 },
    { name: "Romitan tumani", region_id: 3 },
    { name: "Shofirkon tumani", region_id: 3 },
    { name: "Buxoro tumani", region_id: 3 },
    { name: "Peshku tumani", region_id: 3 }
  ];

  const allDistricts = [
    ...toshkentDistricts,
    ...samarqandDistricts,
    ...buxoroDistricts
    // ... boshqa viloyatlar tumanlari (jami ~170 ta)
  ];

  for (const district of allDistricts) {
    await prisma.locDistrict.upsert({
      where: { 
        name_region_id: { 
          name: district.name, 
          region_id: district.region_id 
        } 
      },
      update: {},
      create: {
        name: district.name,
        region_id: district.region_id,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ LocDistricts seeded successfully (~170 districts)');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat tumanlar
npm run seed:districts
```

### 8.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Tuman nomlarini o'zgartirishdan oldin backup qilish
- [ ] Mavjud mijozlarning district_id tekshirish
- [ ] Viloyatlar bilan bog'lanishni tekshirish (region_id)

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
describe('LocationService - Districts', () => {
  let service: LocationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService, PrismaService],
    }).compile();

    service = module.get<LocationService>(LocationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createDistrict', () => {
    it('should create a new district successfully', async () => {
      const dto: CreateDistrictDto = {
        name: 'Test Tumani',
        region_id: 1,
        status: 'ACTIVE',
      };

      prisma.locRegion.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.locDistrict.findFirst = jest.fn().mockResolvedValue(null);
      prisma.locDistrict.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.createDistrict(dto, 1);

      expect(result.name).toBe('Test Tumani');
      expect(prisma.locDistrict.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if district name exists in region', async () => {
      const dto: CreateDistrictDto = {
        name: 'Bo''ka tumani',
        region_id: 1,
      };

      prisma.locRegion.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.locDistrict.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Bo''ka tumani' });

      await expect(service.createDistrict(dto, 1)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if region not found', async () => {
      const dto: CreateDistrictDto = {
        name: 'Test Tumani',
        region_id: 999,
      };

      prisma.locRegion.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.createDistrict(dto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated districts', async () => {
      const query: GetDistrictsQuery = { page: 1, limit: 100 };

      prisma.locDistrict.findMany = jest.fn().mockResolvedValue([]);
      prisma.locDistrict.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should filter by region_id', async () => {
      const query: GetDistrictsQuery = { page: 1, limit: 100, region_id: 1 };

      await service.findAll(query);

      expect(prisma.locDistrict.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            region_id: 1,
            deleted_at: null
          })
        })
      );
    });
  });

  describe('removeDistrict', () => {
    it('should soft delete a district', async () => {
      prisma.locDistrict.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.client.count = jest.fn().mockResolvedValue(0);
      prisma.locDistrict.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.removeDistrict(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

### 9.3 E2E Test

```typescript
// location.e2e-spec.ts
describe('Location - Districts (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    
    authToken = await getAdminToken();
  });

  it('/api/v1/locations/districts (POST) - Create district', () => {
    return request(app.getHttpServer())
      .post('/api/v1/locations/districts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Tumani',
        region_id: 1,
        status: 'ACTIVE',
      })
      .expect(201);
  });

  it('/api/v1/locations/districts (GET) - Get all districts', () => {
    return request(app.getHttpServer())
      .get('/api/v1/locations/districts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/locations/regions/1/districts (GET) - Get districts by region', () => {
    return request(app.getHttpServer())
      .get('/api/v1/locations/regions/1/districts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/locations/districts/:id (DELETE) - Soft delete district', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/locations/districts/1')
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
npx prisma migrate dev --name create_loc_district

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "loc_districts" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "region_id" INTEGER,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_loc_district_region" 
    FOREIGN KEY ("region_id") 
    REFERENCES "loc_regions"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_loc_district_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_loc_district_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "loc_districts_region_id_idx" ON "loc_districts"("region_id");
CREATE INDEX "loc_districts_status_idx" ON "loc_districts"("status");
CREATE INDEX "loc_districts_name_idx" ON "loc_districts"("name");
CREATE INDEX "loc_districts_deleted_at_idx" ON "loc_districts"("deleted_at");
CREATE INDEX "loc_districts_region_id_status_idx" ON "loc_districts"("region_id", "status");

-- Composite Unique Constraint (name + region_id)
CREATE UNIQUE INDEX "loc_districts_name_region_id_idx" 
  ON "loc_districts"("name", "region_id") 
  WHERE deleted_at IS NULL;
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_loc_district"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "loc_districts" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (~170 ta tuman)
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor
- [ ] Viloyatlar bilan bog'lanish tekshirildi

---

## 11. PERFORMANCE OPTIMALLASHTIRISH

### 11.1 Database Indexlar

```prisma
@@index([region_id])           // Viloyat filter uchun (eng muhim)
@@index([status])              // Status filter uchun
@@index([name])                // Name search uchun
@@index([deleted_at])          // Soft delete filter uchun
@@index([region_id, status])   // Qo'shma index (eng ko'p ishlatiladigan query)
```

### 11.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| District List (by region) | Redis | 1 soat | District create/update/delete |
| Single District | Redis | 30 daqiqa | District update/delete |
| All Active Districts | In-Memory | 1 soat | App restart |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const districts = await prisma.locDistrict.findMany({
  select: { 
    id: true, 
    name: true, 
    status: true
  },
  where: { 
    deleted_at: null, 
    status: 'ACTIVE',
    region_id: 1 
  },
  orderBy: { name: 'asc' }
});

// ✅ Yaxshi - Qo'shma index ishlatish
const districts = await prisma.locDistrict.findMany({
  where: { 
    region_id: 1,
    status: 'ACTIVE',
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const districts = await prisma.locDistrict.findMany();
```

### 11.4 Frontend uchun Optimizatsiya

```typescript
// Dropdown uchun faqat aktiv tumanlar (viloyat bo'yicha)
GET /api/v1/locations/regions/:regionId/districts?status=ACTIVE

// Response cache qilish (1 soat)
Cache-Control: public, max-age=3600
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `04-location-district.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| LocRegion RFC | `RFC-003-location-region.md` | ✅ Tasdiqlandi |
| Source RFC | `RFC-005-source-management.md` | ⏳ Keyingi |
| Client RFC | `RFC-006-client-management.md` | ⏳ Kelajakda |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Tuman nomi region ichida unikal bo'lishi (case-insensitive)
- [ ] Tuman nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin tuman yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar tuman ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Viloyat bo'yicha filter ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi (~170 ta tuman)
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
| Tuman nomi takrorlanishi | O'rta | Yuqori | Unique constraint (region ichida) + case-insensitive check |
| Region o'chirilganda muammolar | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| District o'zgarishi (kam) | Past | O'rta | ARCHIVED status + migration script |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Mahalla darajasi (LocMahalla) | 🟢 Low | Phase 4 |
| GPS coordinates | 🟢 Low | Phase 4 |
| District statistics dashboard | 🟡 Medium | Phase 3 |
| Bulk import/export | 🟢 Low | Phase 3 |
| District change history | 🟢 Low | Phase 4 |
| Postal code integration | 🟢 Low | Phase 4 |

---

## 16. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
