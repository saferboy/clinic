# 📋 RFC-011: Xizmatlar Boshqaruvi (Service Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-011 |
| **Nomi** | Service Management |
| **Phase** | 2A - Core Entities |
| **Model** | `Service` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Core Entities) |
| **Bog'liq RFC** | RFC-002 (User), RFC-007 (Department), RFC-012 (ServiceUser), RFC-013 (VisitService) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.4, 5.2, 6.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinika tomonidan ko'rsatiladigan xizmatlarni boshqarish, narxlar va davomiyligini belgilash, bo'limlarga biriktirish uchun to'liq texnik specifikatsiyani taqdim etadi. Har bir xizmat uchun shifokor stavkalarini (ServiceUser) belgilash va Visit jarayonida xizmatlarni qo'shish uchun asos yaratish (Reference: `Klinika.md` 3.4).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Xizmat yaratish (Create) | ❌ Xizmat paketlari (kelajakda) |
| ✅ Xizmat ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Xizmat yangilash (Update) | ❌ Third-party integratsiya |
| ✅ Xizmat o'chirish - Soft Delete | ❌ Xizmat taqqoslash (kelajakda) |
| ✅ Narx boshqaruvi | |
| ✅ Davomiylik boshqaruvi | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 3.4)
- Klinika xizmatlarini markazlashtirilgan boshqarish
- Narxlar va davomiyligini belgilash
- Bo'limlar kesimida xizmatlarni kategoriyalash
- Shifokor stavkalarini belgilash (ServiceUser)
- Visit jarayonida xizmatlarni qo'shish uchun asos
- Hisobotlarda xizmat kesimida statistika olish (Reference: `Klinika.md` 7.1)
- Moliyaviy hisob-kitoblar uchun narx bazasi

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model Service {
  id            Int          @id @default(autoincrement())
  department_id Int?         @map("department_id")
  name          String       @db.VarChar(100)
  price         Decimal      @default(0) @db.Decimal(15, 2)
  duration_min  Int?         @default(30) @map("duration_min")
  description   String?      @db.Text
  status        RecordStatus @default(ACTIVE)
  created_at    Timestamptz  @default(now())
  updated_at    Timestamptz  @updatedAt
  deleted_at    Timestamptz?
  registered_by Int?         @map("registered_by")
  modified_by   Int?         @map("modified_by")

  // Relations
  department    Department?  @relation("fk_service_department", fields: [department_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?        @relation("fk_service_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?        @relation("fk_service_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  service_users  ServiceUser[]  @relation("fk_service_user_service")
  visit_services VisitService[] @relation("fk_visit_service_service")

  @@index([department_id])
  @@index([status])
  @@index([deleted_at])
  @@index([department_id, status])
  @@map("services")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. VisitService va ServiceUser jadvallari bilan bog'lanish uchun ishlatiladi |
| `department_id` | Int | ❌ | null | INTEGER | **Foreign Key**. Department jadvaliga bog'lanish. SetNull cascade - bo'lim o'chirilganda null bo'ladi. Xizmat qaysi bo'limga tegishli ekanligini ko'rsatadi (Reference: `Klinika.md` 3.4) |
| `name` | String | ✅ | - | VARCHAR(100) | **Xizmat nomi**. 3-100 belgi. Misol: "Terapevt ko'rigi", "UZI tekshiruvi". Lotin va Kirill harflari ruxsat etiladi |
| `price` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Bazaviy narx**. So'mda ifodalanadi. 2 kasr belgigacha. Moliyaviy hisob-kitoblar uchun muhim (Reference: `Klinika.md` 9.2) |
| `duration_min` | Int | ❌ | 30 | INTEGER | **Davomiyligi (daqiqada)**. Xizmat qancha vaqt olishini belgilaydi. Jadval rejalashtirish uchun ishlatiladi (Reference: `Klinika.md` 3.4) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. Xizmat haqida batafsil ma'lumot. Ko'rsatmalar, tayyorgarlik va h.k. |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi xizmat yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun |

### 2.3 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([department_id])` | department_id | Bo'lim bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv xizmatlar) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([department_id, status])` | department_id, status | Qo'shma index - bo'lim va status bo'yicha filter (eng ko'p ishlatiladi) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_service_department` | Department | N:1 | SetNull | Cascade | Bo'lim o'chirilganda xizmatning department_id NULL ga o'zgaradi. Xizmat ma'lumoti saqlanib qoladi |
| `fk_service_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_service_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_service_user_service` | ServiceUser | 1:N | Cascade | Cascade | Xizmat o'chirilganda ServiceUser yozuvlari o'chiriladi (stavka ma'lumotlari) |
| `fk_visit_service_service` | VisitService | 1:N | Cascade | Cascade | Xizmat o'chirilganda VisitService yozuvlari o'chiriladi (visit tarixi saqlanadi) |

### 2.5 Cascade Rules Tushunchasi

```
Xizmat o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Service.status = 'INACTIVE'                 │
│ 2. Service.deleted_at = NOW()                  │
│ 3. ServiceUser yozuvlari Cascade delete        │
│ 4. VisitService yozuvlari Cascade delete       │
│ 5. Visit tarixi saqlanib qoladi                │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi. (Reference: Klinika.md 8.1)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/services` | ✅ JWT | Admin | Yangi xizmat yaratish |
| 2 | GET | `/api/v1/services` | ✅ JWT | Barchasi | Xizmatlar ro'yxatini olish |
| 3 | GET | `/api/v1/departments/:departmentId/services` | ✅ JWT | Barchasi | Bo'lim xizmatlarini olish |
| 4 | GET | `/api/v1/services/:id` | ✅ JWT | Barchasi | Bitta xizmat ma'lumotlari |
| 5 | PUT | `/api/v1/services/:id` | ✅ JWT | Admin | Xizmat yangilash |
| 6 | PUT | `/api/v1/services/:id/price` | ✅ JWT | Admin, Accountant | Xizmat narxini yangilash |
| 7 | DELETE | `/api/v1/services/:id` | ✅ JWT | Admin | Xizmat o'chirish (soft) |

---

### 3.2 POST /api/v1/services

**Tavsif:** Admin tomonidan yangi xizmat yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateServiceDto {
  name: string;         // 3-100 belgi
  price: number;        // Decimal(15,2), musbat son
  department_id?: number; // Mavjud Department ID
  duration_min?: number;  // Daqiqada, default 30
  description?: string;   // 0-1000 belgi
  status?: string;        // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Terapevt ko'rigi",
  "price": 100000,
  "department_id": 1,
  "duration_min": 30,
  "description": "Bosh terapevt ko'rigi va maslahati",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Xizmat muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Terapevt ko'rigi",
    "price": 100000,
    "department": { "id": 1, "name": "Terapiya" },
    "duration_min": 30,
    "description": "Bosh terapevt ko'rigi va maslahati",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// service.service.ts
async create(createServiceDto: CreateServiceDto, userId: number): Promise<Service> {
  // 1. Department mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createServiceDto.department_id) {
    const department = await this.prisma.department.findUnique({
      where: { id: createServiceDto.department_id }
    });
    if (!department || department.deleted_at) {
      throw new NotFoundException('SRV_001');
    }
  }

  // 2. Name unikal ekanligini tekshirish (bo'lim ichida)
  const existing = await this.prisma.service.findFirst({
    where: {
      name: createServiceDto.name,
      department_id: createServiceDto.department_id || null,
      deleted_at: null
    }
  });

  if (existing) {
    throw new ConflictException('SRV_002');
  }

  // 3. Price validatsiya (musbat son)
  if (createServiceDto.price < 0) {
    throw new BadRequestException('SRV_003');
  }

  // 4. Duration validatsiya
  if (createServiceDto.duration_min && (createServiceDto.duration_min < 5 || createServiceDto.duration_min > 480)) {
    throw new BadRequestException('SRV_004');
  }

  // 5. Xizmat yaratish
  const service = await this.prisma.service.create({
     {
      name: createServiceDto.name,
      price: createServiceDto.price,
      department_id: createServiceDto.department_id,
      duration_min: createServiceDto.duration_min || 30,
      description: createServiceDto.description,
      status: createServiceDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      department: { select: { id: true, name: true } }
    }
  });

  return service;
}
```

---

### 3.3 GET /api/v1/services

**Tavsif:** Xizmatlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `department_id` | number | - | Bo'lim bo'yicha filter |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Nomi bo'yicha qidiruv |
| `min_price` | number | - | Min narx filter |
| `max_price` | number | - | Max narx filter |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/services?page=1&limit=20&department_id=1&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Terapevt ko'rigi",
      "price": 100000,
      "department": { "id": 1, "name": "Terapiya" },
      "duration_min": 30,
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visit_services": 50, "service_users": 3 }
    },
    {
      "id": 2,
      "name": "UZI tekshiruvi",
      "price": 150000,
      "department": { "id": 4, "name": "Diagnostika" },
      "duration_min": 20,
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visit_services": 30, "service_users": 2 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetServicesQuery): Promise<PaginatedResult<Service>> {
  const where: any = { deleted_at: null };

  // Department filter
  if (query.department_id) {
    where.department_id = query.department_id;
  }

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

  // Price filter
  if (query.min_price !== undefined) {
    where.price = { ...where.price, gte: query.min_price };
  }
  if (query.max_price !== undefined) {
    where.price = { ...where.price, lte: query.max_price };
  }

  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);

  // Sorting
  const orderBy = {
    [query.sortBy || 'name']: query.sortOrder || 'asc'
  };

  const [data, total] = await Promise.all([
    this.prisma.service.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        department: { select: { id: true, name: true } },
        _count: {
          select: { 
            visit_services: { where: { deleted_at: null } },
            service_users: { where: { deleted_at: null } }
          }
        }
      }
    }),
    this.prisma.service.count({ where })
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

### 3.4 PUT /api/v1/services/:id/price

**Tavsif:** Xizmat narxini yangilash (Admin, Accountant)

**Request Body:**
```json
{
  "price": 120000,
  "reason": "Narxlar indeksatsiyasi"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Xizmat narxi muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Terapevt ko'rigi",
    "price": 120000,
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async updatePrice(id: number, updateServicePriceDto: UpdateServicePriceDto, userId: number): Promise<Service> {
  // 1. Xizmat mavjudligini tekshirish
  const service = await this.prisma.service.findUnique({
    where: { id }
  });

  if (!service || service.deleted_at) {
    throw new NotFoundException('SRV_005');
  }

  // 2. Price validatsiya (musbat son)
  if (updateServicePriceDto.price < 0) {
    throw new BadRequestException('SRV_003');
  }

  // 3. Narx o'zgarishini log qilish
  if (service.price !== updateServicePriceDto.price) {
    this.logger.log(
      `Service price changed: ${service.name} from ${service.price} to ${updateServicePriceDto.price}. Reason: ${updateServicePriceDto.reason || 'N/A'}`
    );
  }

  // 4. Narx yangilash
  const updated = await this.prisma.service.update({
    where: { id },
     {
      price: updateServicePriceDto.price,
      updated_at: new Date(),
      modified_by: userId
    },
    include: {
      department: { select: { id: true, name: true } }
    }
  });

  return updated;
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-service.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  IsDecimal,
  Min,
  Max,
  Matches
} from 'class-validator';

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Xizmat nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Xizmat nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Xizmat nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0, { message: 'Narx manfiy bo\'lishi mumkin emas' })
  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @IsInt()
  @Min(5, { message: 'Davomiylik kamida 5 daqiqa bo\'lishi kerak' })
  @Max(480, { message: 'Davomiylik 480 daqiqadan oshmasligi kerak' })
  duration_min?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | SRV_007 | Xizmat nomi majburiy |
| `name` | MinLength 3 | SRV_007 | Xizmat nomi kamida 3 belgi |
| `name` | MaxLength 100 | SRV_008 | Xizmat nomi 100 belgidan oshmasin |
| `name` | Pattern | SRV_007 | Noto'g'ri belgilar |
| `name` | Unique (department ichida) | SRV_002 | Xizmat nomi allaqachon mavjud |
| `price` | Required | SRV_009 | Narx majburiy |
| `price` | IsDecimal | SRV_009 | Narx Decimal(15,2) formatda |
| `price` | Min 0 | SRV_003 | Narx manfiy bo'lishi mumkin emas |
| `department_id` | IsInt | SRV_001 | Department ID raqam bo'lishi kerak |
| `department_id` | Must Exist | SRV_001 | Bo'lim topilmadi |
| `duration_min` | IsInt | SRV_010 | Davomiylik raqam bo'lishi kerak |
| `duration_min` | Min 5 | SRV_004 | Davomiylik kamida 5 daqiqa |
| `duration_min` | Max 480 | SRV_004 | Davomiylik 480 daqiqadan oshmasin |
| `description` | MaxLength 1000 | SRV_011 | Tavsif 1000 belgidan oshmasin |
| `status` | Enum | SRV_012 | ACTIVE/INACTIVE/ARCHIVED |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `SRV_001` | 404 Not Found | Bo'lim topilmadi | Department ID not exists | Department ID ni tekshiring |
| `SRV_002` | 409 Conflict | Xizmat nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `SRV_003` | 400 Bad Request | Narx manfiy bo'lishi mumkin emas | Price < 0 | Musbat son kiriting |
| `SRV_004` | 400 Bad Request | Davomiylik noto'g'ri | Duration < 5 yoki > 480 | 5-480 daqiqa orasida |
| `SRV_005` | 404 Not Found | Xizmat topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `SRV_006` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `SRV_007` | 400 Bad Request | Xizmat nomi noto'g'ri | Validation failed | 3-100 belgi, to'g'ri format |
| `SRV_008` | 400 Bad Request | Xizmat nomi juda uzun | Validation failed | Max 100 belgi |
| `SRV_009` | 400 Bad Request | Narx noto'g'ri format | Validation failed | Decimal(15,2) format |
| `SRV_010` | 400 Bad Request | Davomiylik noto'g'ri format | Validation failed | Raqam kiriting |
| `SRV_011` | 400 Bad Request | Tavsif juda uzun | Validation failed | Max 1000 belgi |
| `SRV_012` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

### 5.2 Exception Filter

```typescript
// service-exception.filter.ts
@Catch()
export class ServiceExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'SRV_002';
    if (exception instanceof NotFoundException) return 'SRV_005';
    if (exception instanceof ForbiddenException) return 'SRV_006';
    if (exception instanceof BadRequestException) return 'SRV_007';
    return 'SRV_005';
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
| POST /services | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /services | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /services/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /services/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| PUT /services/:id/price | ✅ | ❌ | ❌ | ❌ | ✅ |
| DELETE /services/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Narx Xavfsizligi (Reference: `Klinika.md` 8.1, 9.2)
- ✅ Narx Decimal(15,2) formatda saqlanadi
- ✅ Manfiy narx ruxsat etilmaydi
- ✅ Narx o'zgarishi log qilinadi
- ✅ Faqat Admin va Accountant narx o'zgartirish huquqiga ega

---

## 7. SEED DATA

### 7.1 Standart Xizmatlar

```typescript
// seed/service.seed.ts
export async function seedServices(prisma: PrismaClient) {
  // Terapiya bo'limi xizmatlari
  const therapyServices = [
    { name: 'Terapevt ko''rigi', price: 100000, duration_min: 30, department_id: 1 },
    { name: 'Kardiolog ko''rigi', price: 180000, duration_min: 45, department_id: 1 },
    { name: 'Nevrolog ko''rigi', price: 180000, duration_min: 45, department_id: 1 }
  ];

  // Diagnostika bo'limi xizmatlari
  const diagnosticServices = [
    { name: 'UZI tekshiruvi', price: 150000, duration_min: 30, department_id: 4 },
    { name: 'Rentgen', price: 80000, duration_min: 20, department_id: 4 },
    { name: 'EKG', price: 60000, duration_min: 15, department_id: 4 },
    { name: 'Qon tahlili', price: 50000, duration_min: 15, department_id: 4 }
  ];

  // Stomatologiya bo'limi xizmatlari
  const dentalServices = [
    { name: 'Stomatolog ko''rigi', price: 120000, duration_min: 30, department_id: 3 },
    { name: 'Tish tozalash', price: 200000, duration_min: 60, department_id: 3 },
    { name: 'Tish plomba', price: 300000, duration_min: 90, department_id: 3 }
  ];

  const allServices = [...therapyServices, ...diagnosticServices, ...dentalServices];

  for (const service of allServices) {
    await prisma.service.create({
       {
        ...service,
        description: 'Standart xizmat',
        status: 'ACTIVE'
      }
    });
  }

  console.log(`✅ Services seeded successfully (${allServices.length} services)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat xizmatlar
npm run seed:services
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Xizmat narxlari tekshiriladi
- [ ] Department ID lar mavjudligi tasdiqlanadi
- [ ] Narx o'zgarishlari log qilinadi
- [ ] Backup qilish rejasi tayyor

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
// service.service.spec.ts
describe('ServiceService', () => {
  let service: ServiceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceService, PrismaService],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new service successfully', async () => {
      const dto: CreateServiceDto = {
        name: 'Test Xizmat',
        price: 100000,
        duration_min: 30,
        department_id: 1,
      };

      prisma.department.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.service.findFirst = jest.fn().mockResolvedValue(null);
      prisma.service.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('Test Xizmat');
      expect(prisma.service.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if service name exists', async () => {
      const dto: CreateServiceDto = {
        name: 'Terapevt ko''rigi',
        price: 100000,
        department_id: 1,
      };

      prisma.department.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.service.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Terapevt ko''rigi' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if price is negative', async () => {
      const dto: CreateServiceDto = {
        name: 'Test Xizmat',
        price: -100,
        department_id: 1,
      };

      prisma.department.findUnique = jest.fn().mockResolvedValue({ id: 1 });

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePrice', () => {
    it('should update service price successfully', async () => {
      const dto: UpdateServicePriceDto = {
        price: 120000,
        reason: 'Narxlar indeksatsiyasi'
      };

      prisma.service.findUnique = jest.fn().mockResolvedValue({ id: 1, price: 100000, deleted_at: null });
      prisma.service.update = jest.fn().mockResolvedValue({ id: 1, price: 120000 });

      const result = await service.updatePrice(1, dto, 1);

      expect(result.price).toBe(120000);
    });
  });

  describe('remove', () => {
    it('should soft delete a service', async () => {
      prisma.service.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visitService.count = jest.fn().mockResolvedValue(0);
      prisma.serviceUser.count = jest.fn().mockResolvedValue(0);
      prisma.service.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_service

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "services" (
  "id" SERIAL PRIMARY KEY,
  "department_id" INTEGER,
  "name" VARCHAR(100) NOT NULL,
  "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "duration_min" INTEGER DEFAULT 30,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_service_department" 
    FOREIGN KEY ("department_id") 
    REFERENCES "departments"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_service_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_service_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "services_department_id_idx" ON "services"("department_id");
CREATE INDEX "services_status_idx" ON "services"("status");
CREATE INDEX "services_deleted_at_idx" ON "services"("deleted_at");
CREATE INDEX "services_department_id_status_idx" ON "services"("department_id", "status");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_service"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "services" CASCADE;
```

### 9.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi (Reference: `klinika_prisma.txt`)
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor
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
@@index([department_id])           // Bo'lim filter uchun
@@index([status])                  // Status filter uchun
@@index([deleted_at])              // Soft delete filter uchun
@@index([department_id, status])   // Qo'shma index - bo'lim va status (eng muhim)
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Service List | Redis | 5 daqiqa | Service create/update/delete |
| Single Service | Redis | 2 daqiqa | Service update/delete |
| Services by Department | Redis | 5 daqiqa | Service create/update |
| Service Price | Redis | 1 daqiqa | Price update |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const services = await prisma.service.findMany({
  select: { 
    id: true, 
    name: true, 
    price: true,
    duration_min: true,
    status: true
  },
  where: { 
    deleted_at: null, 
    status: 'ACTIVE' 
  },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const services = await prisma.service.findMany({
  where: { 
    department_id: 1,
    status: 'ACTIVE',
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const services = await prisma.service.findMany();
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
| Flow Document | `11-service-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Department RFC | `RFC-007-department-management.md` | ✅ Tasdiqlandi |
| ServiceUser RFC | `RFC-012-service-user-management.md` | ⏳ Keyingi |
| VisitService RFC | `RFC-013-visit-service-management.md` | ⏳ Keyingi |
| Visit RFC | `RFC-014-visit-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Xizmat nomi 3-100 belgi orasida bo'lishi
- [ ] Narx Decimal(15,2) formatda bo'lishi (Reference: `Klinika.md` 9.2)
- [ ] Narx manfiy bo'lmasligi
- [ ] Davomiylik 5-480 daqiqa orasida bo'lishi
- [ ] Xizmat nomi bo'lim ichida unikal bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin xizmat yaratish/o'zgartirish/o'chirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Accountant narx o'zgartirish huquqiga ega
- [ ] Barcha rollar xizmat ro'yxatini ko'ra oladi
- [ ] Bo'lim bo'yicha filterlash ishlaydi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull/Cascade)
- [ ] Narx o'zgarishi log qilinadi

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
| Xizmat nomi takrorlanishi | O'rta | Yuqori | Unique constraint + department ichida tekshirish |
| Narx xatolari | O'rta | Yuqori | Decimal validation + negative check |
| Cascade delete muammolari | O'rta | O'rta | Cascade delete + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Price inconsistency | O'rta | Yuqori | Price change logging + audit trail |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Service packages/bundles | 🟡 Medium | Phase 3 |
| Service price history | 🟡 Medium | Phase 3 |
| Service statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| Service change history | 🟢 Low | Phase 4 |
| Service comparison | 🟢 Low | Phase 4 |
| Multi-branch service support | 🟢 Low | Phase 4 |
| Service duration auto-calculation | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |

---
