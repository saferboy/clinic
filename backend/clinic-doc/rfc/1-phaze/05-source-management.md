# 📋 RFC-005: Mijoz Manbalari Boshqaruvi (Source Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-005 |
| **Nomi** | Source Management |
| **Phase** | 1 - Foundation |
| **Model** | `Source` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Foundation - Klassifikator) |
| **Bog'liq RFC** | RFC-001 (UserRole), RFC-002 (User), RFC-008 (Client) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC mijozlar klinikaga qayerdan kelganligini (manba) hisobga olish va boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Marketing samaradorligini tahlil qilish, mijoz jalb qilish kanallarini aniqlash va hisobotlar tayyorlash uchun reference ma'lumotlar bazasini yaratish.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Manba yaratish (Create) | ❌ Marketing kampaniya boshqaruvi |
| ✅ Manba ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Manba yangilash (Update) | ❌ Third-party integratsiya (Google Analytics) |
| ✅ Manba o'chirish - Soft Delete | ❌ Import/Export (kelajakda) |
| ✅ Manba validatsiyasi | |

### 1.3 Biznes Qiymati
- Mijozlar qayerdan kelayotganini aniqlash (marketing analitika)
- Har bir manba bo'yicha ROI hisoblash
- Eng samarali marketing kanallarini aniqlash
- Mijozlarni manba bo'yicha segmentatsiya qilish
- Hisobotlarda manba kesimida statistika olish
- Klinika rivojlantirish strategiyasini rejalashtirish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model Source {
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
  register_user User?       @relation("fk_source_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_source_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  clients      Client[]     @relation("fk_client_source")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("sources")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Client jadvali bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Manba nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Instagram", "Telegram", "Google", "Tavsiya". Lotin va Kirill harflari ruxsat etiladi |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi, manba haqida qo'shimcha ma'lumot. Ixtiyoriy maydon |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi manba yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |

### 2.3 Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv manbalar) |
| `@@index([name])` | name | Manba nomi bo'yicha qidiruvni tezlashtirish (search/dropdown uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan manbalarni ajratish) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_source_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_source_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_client_source` | Client | 1:N | SetNull | Cascade | Manba o'chirilganda mijozlarning source_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |

### 2.5 Cascade Rules Tushunchasi

```
Manba o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Source.status = 'INACTIVE'                  │
│ 2. Source.deleted_at = NOW()                   │
│ 3. Client.source_id = NULL (SetNull)           │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi.
```

---

## 3. ENUM TUZILISHI (Reference: `klinika_prisma.txt`)

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - manba ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - manba vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - manba tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | Manba to'liq ishlaydi | Yangi manba yaratilganda default. Dropdownlarda ko'rinadi |
| `INACTIVE` | Manba vaqtincha o'chirilgan | Noto'g'ri ma'lumot kiritilganda, vaqtincha bloklash |
| `ARCHIVED` | Manba arxivlangan | Manba endi ishlatilmaydi, lekin tarix uchun saqlanadi |

### 3.2 Status O'zgarish Qoidalari

```
ACTIVE → INACTIVE  ✅ Ruxsat etiladi (Admin tomonidan)
ACTIVE → ARCHIVED  ✅ Ruxsat etiladi (Manba bekor qilinganda)
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
| 1 | POST | `/api/v1/sources` | ✅ JWT | Admin | Yangi manba yaratish |
| 2 | GET | `/api/v1/sources` | ✅ JWT | Barchasi | Manba ro'yxatini olish |
| 3 | GET | `/api/v1/sources/:id` | ✅ JWT | Barchasi | Bitta manba ma'lumotlari |
| 4 | PUT | `/api/v1/sources/:id` | ✅ JWT | Admin | Manba yangilash |
| 5 | DELETE | `/api/v1/sources/:id` | ✅ JWT | Admin | Manba o'chirish (soft) |

---

### 4.2 POST /api/v1/sources

**Tavsif:** Admin tomonidan yangi manba yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateSourceDto {
  name: string;       // 3-100 belgi, unikal
  description?: string;   // 0-255 belgi
  status?: string;    // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Instagram",
  "description": "Ijtimoiy tarmoq",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Manba muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Instagram",
    "description": "Ijtimoiy tarmoq",
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
// source.service.ts
async create(createSourceDto: CreateSourceDto, userId: number): Promise<Source> {
  // 1. Name unikal ekanligini tekshirish (case-insensitive)
  const existing = await this.prisma.source.findFirst({
    where: {
      name: {
        equals: createSourceDto.name,
        mode: 'insensitive'
      },
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('SRC_001');
  }
  
  // 2. Manba yaratish
  const source = await this.prisma.source.create({
     {
      name: createSourceDto.name,
      description: createSourceDto.description,
      status: createSourceDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return source;
}
```

---

### 4.3 GET /api/v1/sources

**Tavsif:** Barcha manbalar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 100 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Manba nomi bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/sources?page=1&limit=100&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Instagram",
      "description": "Ijtimoiy tarmoq",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 150 }
    },
    {
      "id": 2,
      "name": "Telegram",
      "description": "Messenger ilovasi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 120 }
    },
    {
      "id": 3,
      "name": "Google",
      "description": "Qidiruv tizimi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 80 }
    },
    {
      "id": 4,
      "name": "Tavsiya (Referal)",
      "description": "Mijozlar tavsiyasi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 200 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 8,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetSourcesQuery): Promise<PaginatedResult<Source>> {
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
    this.prisma.source.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { clients: true }
        }
      }
    }),
    this.prisma.source.count({ where })
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

### 4.4 GET /api/v1/sources/:id

**Tavsif:** Bitta manba ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Manba ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Instagram",
    "description": "Ijtimoiy tarmoq",
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
async findOne(id: number): Promise<Source> {
  const source = await this.prisma.source.findUnique({
    where: { id },
    include: {
      _count: {
        select: { clients: { where: { deleted_at: null } } }
      }
    }
  });
  
  if (!source || source.deleted_at) {
    throw new NotFoundException('SRC_003');
  }
  
  return source;
}
```

---

### 4.5 PUT /api/v1/sources/:id

**Tavsif:** Manba ma'lumotlarini yangilash

**Request Body:**
```json
{
  "name": "Instagram (Updated)",
  "description": "Ijtimoiy tarmoq - reklama",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Manba muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Instagram (Updated)",
    "description": "Ijtimoiy tarmoq - reklama",
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
async update(id: number, updateSourceDto: UpdateSourceDto, userId: number): Promise<Source> {
  // 1. Manba mavjudligini tekshirish
  const source = await this.prisma.source.findUnique({
    where: { id }
  });
  
  if (!source || source.deleted_at) {
    throw new NotFoundException('SRC_003');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateSourceDto.name && updateSourceDto.name !== source.name) {
    const existing = await this.prisma.source.findFirst({
      where: {
        name: {
          equals: updateSourceDto.name,
          mode: 'insensitive'
        },
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('SRC_001');
    }
  }
  
  // 3. Manba yangilash
  const updated = await this.prisma.source.update({
    where: { id },
     {
      ...updateSourceDto,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

---

### 4.6 DELETE /api/v1/sources/:id

**Tavsif:** Manbani soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Manba muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "Instagram",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, userId: number): Promise<Source> {
  // 1. Manba mavjudligini tekshirish
  const source = await this.prisma.source.findUnique({
    where: { id }
  });
  
  if (!source || source.deleted_at) {
    throw new NotFoundException('SRC_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const clientCount = await this.prisma.client.count({
    where: { source_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (clientCount > 0) {
    this.logger.warn(
      `Source ${id} has ${clientCount} clients. 
       Their source_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.source.update({
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
// create-source.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Manba nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Manba nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Manba nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
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
| `name` | Required | SRC_010 | Manba nomi majburiy |
| `name` | MinLength 3 | SRC_002 | Manba nomi kamida 3 belgi |
| `name` | MaxLength 100 | SRC_002 | Manba nomi 100 belgidan oshmasin |
| `name` | Pattern | SRC_002 | Noto'g'ri belgilar |
| `name` | Unique | SRC_001 | Manba nomi allaqachon mavjud |
| `description` | MaxLength 255 | SRC_011 | Tavsif 255 belgidan oshmasin |
| `status` | Enum | SRC_012 | ACTIVE/INACTIVE/ARCHIVED |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `SRC_001` | 409 Conflict | Manba nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `SRC_002` | 400 Bad Request | Manba nomi juda qisqa/uzun | Validation failed | 3-100 belgi kiriting |
| `SRC_003` | 404 Not Found | Manba topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `SRC_004` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `SRC_005` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |
| `SRC_010` | 400 Bad Request | Manba nomi majburiy | Validation failed | Nomi kiriting |
| `SRC_011` | 400 Bad Request | Tavsif juda uzun | Validation failed | 255 belgidan oshmasin |
| `SRC_012` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

### 6.2 Exception Filter

```typescript
// source-exception.filter.ts
@Catch()
export class SourceExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'SRC_001';
    if (exception instanceof BadRequestException) return 'SRC_002';
    if (exception instanceof NotFoundException) return 'SRC_003';
    if (exception instanceof ForbiddenException) return 'SRC_004';
    return 'SRC_005';
  }
}
```

---

## 7. XAVFSIZLIK TALABLARI (Reference: `Klinika.md`)

### 7.1 Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi
- ✅ Token expiry: 24 soat
- ✅ Token validatsiyasi har bir so'rovda

### 7.2 Avtorizatsiya (RBAC)

| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /sources | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /sources | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /sources/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /sources/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /sources/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 Audit (Reference: `klinika_prisma.txt`)
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

### 8.1 Standart Manbalar (Reference: `Klinika.md`)

```typescript
// seed/source.seed.ts
export async function seedSources(prisma: PrismaClient) {
  const sources = [
    { name: "Instagram", description: "Ijtimoiy tarmoq" },
    { name: "Telegram", description: "Messenger ilovasi" },
    { name: "Google", description: "Qidiruv tizimi" },
    { name: "Tavsiya (Referal)", description: "Mijozlar tavsiyasi" },
    { name: "Reklama", description: "Pullik reklama" },
    { name: "Telefon", description: "Telefon orqali murojaat" },
    { name: "Sayt", description: "Klinika veb-sayti" },
    { name: "Boshqa", description: "Boshqa manbalar" }
  ];

  for (const source of sources) {
    await prisma.source.upsert({
      where: { name },
      update: {},
      create: {
        name: source.name,
        description: source.description,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ Sources seeded successfully (8 sources)');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat manbalar
npm run seed:sources
```

### 8.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Manba nomlarini o'zgartirishdan oldin backup qilish
- [ ] Mavjud mijozlarning source_id tekshirish
- [ ] Marketing hisobotlariga ta'sirini baholash

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
// source.service.spec.ts
describe('SourceService', () => {
  let service: SourceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourceService, PrismaService],
    }).compile();

    service = module.get<SourceService>(SourceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new source successfully', async () => {
      const dto: CreateSourceDto = {
        name: 'Test Source',
        description: 'Test description',
        status: 'ACTIVE',
      };

      prisma.source.findFirst = jest.fn().mockResolvedValue(null);
      prisma.source.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('Test Source');
      expect(prisma.source.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if source name exists', async () => {
      const dto: CreateSourceDto = {
        name: 'Instagram',
      };

      prisma.source.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Instagram' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated sources', async () => {
      const query: GetSourcesQuery = { page: 1, limit: 100 };

      prisma.source.findMany = jest.fn().mockResolvedValue([]);
      prisma.source.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft delete a source', async () => {
      prisma.source.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.client.count = jest.fn().mockResolvedValue(0);
      prisma.source.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

### 9.3 E2E Test

```typescript
// source.e2e-spec.ts
describe('Source (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    
    authToken = await getAdminToken();
  });

  it('/api/v1/sources (POST) - Create source', () => {
    return request(app.getHttpServer())
      .post('/api/v1/sources')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Source',
        description: 'Test',
        status: 'ACTIVE',
      })
      .expect(201);
  });

  it('/api/v1/sources (GET) - Get all sources', () => {
    return request(app.getHttpServer())
      .get('/api/v1/sources')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/sources/:id (DELETE) - Soft delete source', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/sources/1')
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
npx prisma migrate dev --name create_source

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "sources" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_source_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_source_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "sources_status_idx" ON "sources"("status");
CREATE INDEX "sources_name_idx" ON "sources"("name");
CREATE INDEX "sources_deleted_at_idx" ON "sources"("deleted_at");
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_source"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "sources" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (8 ta manba)
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi
- [ ] Backup qilindi (production)
- [ ] Rollback plan tayyor

---

## 11. PERFORMANCE OPTIMALLASHTIRISH

### 11.1 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
@@index([status])           // Status filter uchun
@@index([name])             // Name search uchun
@@index([deleted_at])       // Soft delete filter uchun
```

### 11.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Source List | Redis | 1 soat | Source create/update/delete |
| Single Source | Redis | 30 daqiqa | Source update/delete |
| All Active Sources | In-Memory | 1 soat | App restart |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const sources = await prisma.source.findMany({
  select: { 
    id: true, 
    name: true, 
    status: true
  },
  where: { deleted_at: null, status: 'ACTIVE' },
  orderBy: { name: 'asc' }
});

// ✅ Yaxshi - Count bilan
const sources = await prisma.source.findMany({
  where: { deleted_at: null, status: 'ACTIVE' },
  include: { _count: { select: { clients: true } } }
});

// ❌ Yomon - Barcha maydonlar
const sources = await prisma.source.findMany();
```

### 11.4 Frontend uchun Optimizatsiya

```typescript
// Dropdown uchun faqat aktiv manbalar
GET /api/v1/sources?status=ACTIVE&limit=100&sortBy=name&sortOrder=asc

// Response cache qilish (1 soat)
Cache-Control: public, max-age=3600
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `05-source-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| LocRegion RFC | `RFC-003-location-region.md` | ✅ Tasdiqlandi |
| LocDistrict RFC | `RFC-004-location-district.md` | ✅ Tasdiqlandi |
| ClientGroup RFC | `RFC-006-client-group-management.md` | ✅ Tasdiqlandi |
| Department RFC | `RFC-007-department-management.md` | ⏳ Keyingi |
| Client RFC | `RFC-008-client-management.md` | ⏳ Kelajakda |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Manba nomi unikal bo'lishi (case-insensitive)
- [ ] Manba nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin manba yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar manba ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi (8 ta manba)
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
| Manba nomi takrorlanishi | O'rta | Yuqori | Unique constraint + case-insensitive check |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Source o'zgarishi (kam) | Past | O'rta | ARCHIVED status + migration script |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Marketing campaign tracking | 🟡 Medium | Phase 3 |
| UTM parameters support | 🟢 Low | Phase 4 |
| Source statistics dashboard | 🟡 Medium | Phase 3 |
| Bulk import/export | 🟢 Low | Phase 3 |
| Source change history | 🟢 Low | Phase 4 |
| Google Analytics integration | 🟢 Low | Phase 4 |

---

## 16. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
