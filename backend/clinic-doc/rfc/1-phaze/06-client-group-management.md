# 📋 RFC-006: Mijoz Guruhlari Boshqaruvi (ClientGroup Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-006 |
| **Nomi** | ClientGroup Management |
| **Phase** | 1 - Foundation |
| **Model** | `ClientGroup` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Foundation - Klassifikator) |
| **Bog'liq RFC** | RFC-001 (UserRole), RFC-002 (User), RFC-008 (Client) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC mijozlarni guruhlarga ajratish va kategoriyalash uchun to'liq texnik specifikatsiyani taqdim etadi. Turli mijoz segmentlari uchun maxsus shartlar, chegirmalar va xizmat ko'rsatish darajalarini belgilash. Mijozlarni segmentatsiya qilish va marketing strategiyasini rejalashtirish uchun reference ma'lumotlar bazasini yaratish.

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Guruh yaratish (Create) | ❌ Chegirma boshqaruvi (kelajakda) |
| ✅ Guruh ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Guruh yangilash (Update) | ❌ Third-party integratsiya |
| ✅ Guruh o'chirish - Soft Delete | ❌ Import/Export (kelajakda) |
| ✅ Guruh validatsiyasi | |

### 1.3 Biznes Qiymati
- Mijozlarni segmentatsiya qilish (VIP, Korporativ, Oddiy)
- Har bir guruh uchun maxsus shartlar belgilash
- Chegirma va imtiyozlarni boshqarish
- Mijozlarni guruh bo'yicha statistika qilish
- Marketing kampaniyalarini guruhga yo'naltirish
- Hisobotlarda guruh kesimida ma'lumot olish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema

```prisma
model ClientGroup {
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
  register_user User?       @relation("fk_client_group_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_client_group_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  clients      Client[]     @relation("fk_client_group")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("client_groups")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Client jadvali bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Guruh nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Oddiy", "VIP", "Korporativ". Lotin va Kirill harflari ruxsat etiladi |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi, guruh haqida qo'shimcha ma'lumot. Chegirmalar, imtiyozlar haqida yozish mumkin |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (vaqtincha to'xtatilgan), ARCHIVED (arxivlangan). Yangi guruh yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |

### 2.3 Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv guruhlar) |
| `@@index([name])` | name | Guruh nomi bo'yicha qidiruvni tezlashtirish (search/dropdown uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan guruhlarni ajratish) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_client_group_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_client_group_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_client_group` | Client | 1:N | SetNull | Cascade | Guruh o'chirilganda mijozlarning group_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |

### 2.5 Cascade Rules Tushunchasi

```
Guruh o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. ClientGroup.status = 'INACTIVE'             │
│ 2. ClientGroup.deleted_at = NOW()              │
│ 3. Client.group_id = NULL (SetNull)            │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi.
```

---

## 3. ENUM TUZILISHI

### 3.1 RecordStatus Enum

```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - guruh ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - guruh vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - guruh tarix uchun saqlangan
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ACTIVE` | Guruh to'liq ishlaydi | Yangi guruh yaratilganda default. Dropdownlarda ko'rinadi |
| `INACTIVE` | Guruh vaqtincha o'chirilgan | Noto'g'ri ma'lumot kiritilganda, vaqtincha bloklash |
| `ARCHIVED` | Guruh arxivlangan | Guruh endi ishlatilmaydi, lekin tarix uchun saqlanadi |

### 3.2 Status O'zgarish Qoidalari

```
ACTIVE → INACTIVE  ✅ Ruxsat etiladi (Admin tomonidan)
ACTIVE → ARCHIVED  ✅ Ruxsat etiladi (Guruh bekor qilinganda)
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
| 1 | POST | `/api/v1/client-groups` | ✅ JWT | Admin | Yangi guruh yaratish |
| 2 | GET | `/api/v1/client-groups` | ✅ JWT | Barchasi | Guruh ro'yxatini olish |
| 3 | GET | `/api/v1/client-groups/:id` | ✅ JWT | Barchasi | Bitta guruh ma'lumotlari |
| 4 | PUT | `/api/v1/client-groups/:id` | ✅ JWT | Admin | Guruh yangilash |
| 5 | DELETE | `/api/v1/client-groups/:id` | ✅ JWT | Admin | Guruh o'chirish (soft) |

---

### 4.2 POST /api/v1/client-groups

**Tavsif:** Admin tomonidan yangi mijoz guruhi yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateClientGroupDto {
  name: string;       // 3-100 belgi, unikal
  description?: string;   // 0-255 belgi
  status?: string;    // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "VIP",
  "description": "Muhim mijozlar - 10% chegirma",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Guruh muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "VIP",
    "description": "Muhim mijozlar - 10% chegirma",
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
// client-group.service.ts
async create(createClientGroupDto: CreateClientGroupDto, userId: number): Promise<ClientGroup> {
  // 1. Name unikal ekanligini tekshirish (case-insensitive)
  const existing = await this.prisma.clientGroup.findFirst({
    where: {
      name: {
        equals: createClientGroupDto.name,
        mode: 'insensitive'
      },
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('GRP_001');
  }
  
  // 2. Guruh yaratish
  const group = await this.prisma.clientGroup.create({
     {
      name: createClientGroupDto.name,
      description: createClientGroupDto.description,
      status: createClientGroupDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return group;
}
```

---

### 4.3 GET /api/v1/client-groups

**Tavsif:** Barcha mijoz guruhlari ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 100 | Sahifadagi elementlar soni (max 100) |
| `status` | string | - | Status bo'yicha filter (ACTIVE/INACTIVE/ARCHIVED) |
| `search` | string | - | Guruh nomi bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/client-groups?page=1&limit=100&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Oddiy",
      "description": "Oddiy mijozlar - standart narxlar",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 500 }
    },
    {
      "id": 2,
      "name": "VIP",
      "description": "Muhim mijozlar - 10% chegirma",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 50 }
    },
    {
      "id": 3,
      "name": "Korporativ",
      "description": "Korporativ shartnoma asosida xizmat ko'rsatish",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 30 }
    },
    {
      "id": 4,
      "name": "Sug'urta",
      "description": "Sug'urta kompaniyalari mijozlari",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 100 }
    },
    {
      "id": 5,
      "name": "Imtiyozli",
      "description": "Imtiyozli mijozlar - 20% chegirma",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 20 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetClientGroupsQuery): Promise<PaginatedResult<ClientGroup>> {
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
    this.prisma.clientGroup.findMany({
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
    this.prisma.clientGroup.count({ where })
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

### 4.4 GET /api/v1/client-groups/:id

**Tavsif:** Bitta mijoz guruhi ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Guruh ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "VIP",
    "description": "Muhim mijozlar - 10% chegirma",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null,
    "_count": { "clients": 50 }
  }
}
```

**Service Layer Implementation:**
```typescript
async findOne(id: number): Promise<ClientGroup> {
  const group = await this.prisma.clientGroup.findUnique({
    where: { id },
    include: {
      _count: {
        select: { clients: { where: { deleted_at: null } } }
      }
    }
  });
  
  if (!group || group.deleted_at) {
    throw new NotFoundException('GRP_003');
  }
  
  return group;
}
```

---

### 4.5 PUT /api/v1/client-groups/:id

**Tavsif:** Mijoz guruhi ma'lumotlarini yangilash

**Request Body:**
```json
{
  "name": "VIP (Updated)",
  "description": "Muhim mijozlar - 15% chegirma",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Guruh muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "VIP (Updated)",
    "description": "Muhim mijozlar - 15% chegirma",
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
async update(id: number, updateClientGroupDto: UpdateClientGroupDto, userId: number): Promise<ClientGroup> {
  // 1. Guruh mavjudligini tekshirish
  const group = await this.prisma.clientGroup.findUnique({
    where: { id }
  });
  
  if (!group || group.deleted_at) {
    throw new NotFoundException('GRP_003');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateClientGroupDto.name && updateClientGroupDto.name !== group.name) {
    const existing = await this.prisma.clientGroup.findFirst({
      where: {
        name: {
          equals: updateClientGroupDto.name,
          mode: 'insensitive'
        },
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('GRP_001');
    }
  }
  
  // 3. Guruh yangilash
  const updated = await this.prisma.clientGroup.update({
    where: { id },
     {
      ...updateClientGroupDto,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

---

### 4.6 DELETE /api/v1/client-groups/:id

**Tavsif:** Mijoz guruhini soft delete qilish

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Guruh muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "VIP",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, userId: number): Promise<ClientGroup> {
  // 1. Guruh mavjudligini tekshirish
  const group = await this.prisma.clientGroup.findUnique({
    where: { id }
  });
  
  if (!group || group.deleted_at) {
    throw new NotFoundException('GRP_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const clientCount = await this.prisma.client.count({
    where: { group_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (clientCount > 0) {
    this.logger.warn(
      `Group ${id} has ${clientCount} clients. 
       Their group_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.clientGroup.update({
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
// create-client-group.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateClientGroupDto {
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
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}
```

### 5.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | GRP_010 | Guruh nomi majburiy |
| `name` | MinLength 3 | GRP_002 | Guruh nomi kamida 3 belgi |
| `name` | MaxLength 100 | GRP_002 | Guruh nomi 100 belgidan oshmasin |
| `name` | Pattern | GRP_002 | Noto'g'ri belgilar |
| `name` | Unique | GRP_001 | Guruh nomi allaqachon mavjud |
| `description` | MaxLength 255 | GRP_011 | Tavsif 255 belgidan oshmasin |
| `status` | Enum | GRP_012 | ACTIVE/INACTIVE/ARCHIVED |

---

## 6. XATOLIKLAR VA HANDLING

### 6.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `GRP_001` | 409 Conflict | Guruh nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `GRP_002` | 400 Bad Request | Guruh nomi juda qisqa/uzun | Validation failed | 3-100 belgi kiriting |
| `GRP_003` | 404 Not Found | Guruh topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `GRP_004` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `GRP_005` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |
| `GRP_010` | 400 Bad Request | Guruh nomi majburiy | Validation failed | Nomi kiriting |
| `GRP_011` | 400 Bad Request | Tavsif juda uzun | Validation failed | 255 belgidan oshmasin |
| `GRP_012` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

### 6.2 Exception Filter

```typescript
// client-group-exception.filter.ts
@Catch()
export class ClientGroupExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'GRP_001';
    if (exception instanceof BadRequestException) return 'GRP_002';
    if (exception instanceof NotFoundException) return 'GRP_003';
    if (exception instanceof ForbiddenException) return 'GRP_004';
    return 'GRP_005';
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
| POST /client-groups | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /client-groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /client-groups/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /client-groups/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /client-groups/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

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

### 8.1 Standart Mijoz Guruhlari

```typescript
// seed/client-group.seed.ts
export async function seedClientGroups(prisma: PrismaClient) {
  const groups = [
    { 
      name: "Oddiy", 
      description: "Oddiy mijozlar - standart narxlar" 
    },
    { 
      name: "VIP", 
      description: "Muhim mijozlar - 10% chegirma" 
    },
    { 
      name: "Korporativ", 
      description: "Korporativ shartnoma asosida xizmat ko'rsatish" 
    },
    { 
      name: "Sug'urta", 
      description: "Sug'urta kompaniyalari mijozlari" 
    },
    { 
      name: "Imtiyozli", 
      description: "Imtiyozli mijozlar - 20% chegirma" 
    }
  ];

  for (const group of groups) {
    await prisma.clientGroup.upsert({
      where: { name },
      update: {},
      create: {
        name: group.name,
        description: group.description,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ ClientGroups seeded successfully (5 groups)');
}
```

### 8.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat mijoz guruhlari
npm run seed:client-groups
```

### 8.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Guruh nomlarini o'zgartirishdan oldin backup qilish
- [ ] Mavjud mijozlarning group_id tekshirish
- [ ] Chegirma foizlarini tizimda alohida boshqarish (kelajakda)

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
// client-group.service.spec.ts
describe('ClientGroupService', () => {
  let service: ClientGroupService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientGroupService, PrismaService],
    }).compile();

    service = module.get<ClientGroupService>(ClientGroupService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new client group successfully', async () => {
      const dto: CreateClientGroupDto = {
        name: 'Test Group',
        description: 'Test description',
        status: 'ACTIVE',
      };

      prisma.clientGroup.findFirst = jest.fn().mockResolvedValue(null);
      prisma.clientGroup.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('Test Group');
      expect(prisma.clientGroup.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if group name exists', async () => {
      const dto: CreateClientGroupDto = {
        name: 'VIP',
      };

      prisma.clientGroup.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'VIP' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated client groups', async () => {
      const query: GetClientGroupsQuery = { page: 1, limit: 100 };

      prisma.clientGroup.findMany = jest.fn().mockResolvedValue([]);
      prisma.clientGroup.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft delete a client group', async () => {
      prisma.clientGroup.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.client.count = jest.fn().mockResolvedValue(0);
      prisma.clientGroup.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

### 9.3 E2E Test

```typescript
// client-group.e2e-spec.ts
describe('ClientGroup (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    
    authToken = await getAdminToken();
  });

  it('/api/v1/client-groups (POST) - Create client group', () => {
    return request(app.getHttpServer())
      .post('/api/v1/client-groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Group',
        description: 'Test',
        status: 'ACTIVE',
      })
      .expect(201);
  });

  it('/api/v1/client-groups (GET) - Get all client groups', () => {
    return request(app.getHttpServer())
      .get('/api/v1/client-groups')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/client-groups/:id (DELETE) - Soft delete client group', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/client-groups/1')
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
npx prisma migrate dev --name create_client_group

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 10.2 Migration SQL (PostgreSQL)

```sql
-- Create Table
CREATE TABLE "client_groups" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL UNIQUE,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_client_group_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_group_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "client_groups_status_idx" ON "client_groups"("status");
CREATE INDEX "client_groups_name_idx" ON "client_groups"("name");
CREATE INDEX "client_groups_deleted_at_idx" ON "client_groups"("deleted_at");
```

### 10.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_client_group"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "client_groups" CASCADE;
```

### 10.4 Deployment Checklist

- [ ] Prisma schema tasdiqlandi
- [ ] Migration test qilindi (development)
- [ ] Seed data tayyor (5 ta guruh)
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
| ClientGroup List | Redis | 1 soat | ClientGroup create/update/delete |
| Single ClientGroup | Redis | 30 daqiqa | ClientGroup update/delete |
| All Active ClientGroups | In-Memory | 1 soat | App restart |

### 11.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const groups = await prisma.clientGroup.findMany({
  select: { 
    id: true, 
    name: true, 
    status: true
  },
  where: { deleted_at: null, status: 'ACTIVE' },
  orderBy: { name: 'asc' }
});

// ✅ Yaxshi - Count bilan
const groups = await prisma.clientGroup.findMany({
  where: { deleted_at: null, status: 'ACTIVE' },
  include: { _count: { select: { clients: true } } }
});

// ❌ Yomon - Barcha maydonlar
const groups = await prisma.clientGroup.findMany();
```

### 11.4 Frontend uchun Optimizatsiya

```typescript
// Dropdown uchun faqat aktiv guruhlar
GET /api/v1/client-groups?status=ACTIVE&limit=100&sortBy=name&sortOrder=asc

// Response cache qilish (1 soat)
Cache-Control: public, max-age=3600
```

---

## 12. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `06-client-group-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| UserRole RFC | `RFC-001-user-role-management.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| LocRegion RFC | `RFC-003-location-region.md` | ✅ Tasdiqlandi |
| LocDistrict RFC | `RFC-004-location-district.md` | ✅ Tasdiqlandi |
| Source RFC | `RFC-005-source-management.md` | ✅ Tasdiqlandi |
| Department RFC | `RFC-007-department-management.md` | ⏳ Keyingi |
| Client RFC | `RFC-008-client-management.md` | ⏳ Kelajakda |

---

## 13. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 13.1 Functional Requirements

- [ ] Guruh nomi unikal bo'lishi (case-insensitive)
- [ ] Guruh nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin guruh yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar guruh ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi (5 ta guruh)
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
| Guruh nomi takrorlanishi | O'rta | Yuqori | Unique constraint + case-insensitive check |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Group o'zgarishi (kam) | Past | O'rta | ARCHIVED status + migration script |

---

## 15. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Discount percentage field | 🟡 Medium | Phase 3 |
| Group-specific pricing | 🟡 Medium | Phase 3 |
| Group statistics dashboard | 🟡 Medium | Phase 3 |
| Bulk import/export | 🟢 Low | Phase 3 |
| Group change history | 🟢 Low | Phase 4 |
| Automatic group assignment | 🟢 Low | Phase 4 |

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