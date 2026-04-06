# 📋 RFC-012: Tavsiya Tizimi Boshqaruvi (Referral Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-012 |
| **Nomi** | Referral Management |
| **Phase** | 2A - Core Entities |
| **Model** | `Referral`, `VisitReferral` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟢 Low (Core Entities - Marketing) |
| **Bog'liq RFC** | RFC-002 (User), RFC-013 (Visit), RFC-014 (VisitReferral) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 4.4, 5.2, 6.1, 7.1, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikaga mijozlarni kim tavsiya qilganligini kuzatish va boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Tavsiya tizimi orqali marketing samaradorligini o'lchash, tavsiya qilgan shaxslarni rag'batlantirish va mijoz manbailarini tahlil qilish uchun reference ma'lumotlar bazasini yaratish (Reference: `Klinika.md` 4.4).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Tavsiya yaratish (Create) | ❌ Tavsiya bonuslari (kelajakda) |
| ✅ Tavsiya ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Tavsiya yangilash (Update) | ❌ Third-party integratsiya |
| ✅ Tavsiya o'chirish - Soft Delete | ❌ Tavsiya darajalari (kelajakda) |
| ✅ Visitga tavsiya biriktirish | |
| ✅ Tavsiya statistikasi | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 4.4, 7.1)
- Mijoz manbailarini tahlil qilish (marketing analitika)
- Tavsiya tizimi samaradorligini o'lchash
- Tavsiya qilgan shaxslarni aniqlash va rag'batlantirish
- Hisobotlarda tavsiya kesimida statistika olish
- Mijoz jalb qilish kanallarini optimallashtirish
- Marketing byudjetini samarali taqsimlash

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

#### Referral Model
```prisma
model Referral {
  id           Int          @id @default(autoincrement())
  full_name    String       @db.VarChar(100)
  phone        String?      @db.VarChar(20)
  description  String?      @db.Text
  status       RecordStatus @default(ACTIVE)
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?        @map("registered_by")
  modified_by  Int?         @map("modified_by")

  // Relations
  register_user User?       @relation("fk_referral_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_referral_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  visit_referrals VisitReferral[] @relation("fk_visit_referral_referral")

  @@index([status])
  @@index([phone])
  @@index([deleted_at])
  @@map("referrals")
}
```

#### VisitReferral Model
```prisma
model VisitReferral {
  id           Int         @id @default(autoincrement())
  visit_id     Int?        @map("visit_id")
  referral_id  Int?        @map("referral_id")
  created_at   Timestamptz @default(now())
  updated_at   Timestamptz @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?       @map("registered_by")
  modified_by  Int?        @map("modified_by")

  // Relations
  referral     Referral?   @relation("fk_visit_referral_referral", fields: [referral_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  visit        Visit?      @relation("fk_visit_referral_visit", fields: [visit_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  register_user User?      @relation("fk_visit_referral_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?       @relation("fk_visit_referral_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([visit_id])
  @@index([referral_id])
  @@index([deleted_at])
  @@index([registered_by])
  @@index([modified_by])
  @@unique([visit_id, referral_id])
  @@map("visit_referrals")
}
```

### 2.2 Model Maydonlari Tafsiloti

#### Referral Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. VisitReferral jadvali bilan bog'lanish uchun |
| `full_name` | String | ✅ | - | VARCHAR(100) | **Tavsiya qiluvchi F.I.O**. 3-100 belgi. Tavsiya qilgan shaxsning to'liq ismi |
| `phone` | String | ❌ | null | VARCHAR(20) | **Telefon raqam**. +998 formatida. Aloqa uchun, qidiruv uchun ishlatiladi (Reference: `Klinika.md` 9.2) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. Tavsiya qiluvchi haqida qo'shimcha ma'lumot |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv) |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun |

#### VisitReferral Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi |
| `visit_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish. Qaysi visit tavsiya orqali kelganligini ko'rsatadi |
| `referral_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Referral jadvaliga bog'lanish. Kim tavsiya qilganligini ko'rsatadi |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). Audit uchun |

### 2.3 Indexlar (Reference: `klinika_prisma.txt`)

#### Referral Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish |
| `@@index([phone])` | phone | Telefon raqam bo'yicha qidiruvni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |

#### VisitReferral Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([referral_id])` | referral_id | Referral bo'yicha filter qilishni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([registered_by])` | registered_by | Audit uchun |
| `@@index([modified_by])` | modified_by | Audit uchun |
| `@@unique([visit_id, referral_id])` | visit_id, referral_id | Bir visitga bir tavsiya (duplicate oldini olish) |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_referral_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_referral_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_visit_referral_referral` | Referral | N:1 | Cascade | Cascade | Referral o'chirilganda VisitReferral yozuvlari o'chiriladi |
| `fk_visit_referral_visit` | Visit | N:1 | Cascade | Cascade | Visit o'chirilganda VisitReferral yozuvlari o'chiriladi |
| `fk_visit_referral_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi |
| `fk_visit_referral_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi |

### 2.5 Cascade Rules Tushunchasi

```
Referral o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Referral.status = 'INACTIVE'                │
│ 2. Referral.deleted_at = NOW()                 │
│ 3. VisitReferral yozuvlari Cascade delete      │
│ 4. Visit tarixi saqlanib qoladi                │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi. (Reference: Klinika.md 8.1)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/referrals` | ✅ JWT | Admin, Receptionist | Yangi tavsiya yaratish |
| 2 | GET | `/api/v1/referrals` | ✅ JWT | Barchasi | Tavsiyalar ro'yxatini olish |
| 3 | GET | `/api/v1/referrals/:id` | ✅ JWT | Barchasi | Bitta tavsiya ma'lumotlari |
| 4 | PUT | `/api/v1/referrals/:id` | ✅ JWT | Admin, Receptionist | Tavsiya yangilash |
| 5 | DELETE | `/api/v1/referrals/:id` | ✅ JWT | Admin | Tavsiya o'chirish (soft) |
| 6 | POST | `/api/v1/visits/:visitId/referrals` | ✅ JWT | Admin, Receptionist | Visitga tavsiya biriktirish |
| 7 | GET | `/api/v1/referrals/statistics` | ✅ JWT | Admin, Accountant | Tavsiya statistikasi |

---

### 3.2 POST /api/v1/referrals

**Tavsif:** Yangi tavsiya yaratish (Admin, Receptionist)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateReferralDto {
  full_name: string;    // 3-100 belgi
  phone?: string;       // +998 format
  description?: string; // 0-255 belgi
  status?: string;      // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "full_name": "Dr. John Smith",
  "phone": "+998901234567",
  "description": "Doimiy tavsiya qiluvchi",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tavsiya muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "full_name": "Dr. John Smith",
    "phone": "+998901234567",
    "description": "Doimiy tavsiya qiluvchi",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// referral.service.ts
async create(createReferralDto: CreateReferralDto, userId: number): Promise<Referral> {
  // 1. Phone unikal ekanligini tekshirish (agar kiritilgan bo'lsa)
  if (createReferralDto.phone) {
    const existing = await this.prisma.referral.findFirst({
      where: {
        phone: createReferralDto.phone,
        deleted_at: null
      }
    });

    if (existing) {
      throw new ConflictException('REF_001');
    }
  }

  // 2. Tavsiya yaratish
  const referral = await this.prisma.referral.create({
     {
      full_name: createReferralDto.full_name,
      phone: createReferralDto.phone,
      description: createReferralDto.description,
      status: createReferralDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });

  return referral;
}
```

---

### 3.3 GET /api/v1/referrals

**Tavsif:** Tavsiyalar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `phone` | string | - | Telefon raqam bo'yicha filter |
| `full_name` | string | - | Ism bo'yicha qidiruv |
| `status` | string | - | Status bo'yicha filter |
| `sortBy` | string | created_at | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/referrals?page=1&limit=20&phone=+99890&status=ACTIVE&sortBy=created_at&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Dr. John Smith",
      "phone": "+998901234567",
      "description": "Doimiy tavsiya qiluvchi",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visit_referrals": 15 }
    },
    {
      "id": 2,
      "full_name": "Jane Doe",
      "phone": "+998909876543",
      "description": null,
      "status": "ACTIVE",
      "created_at": "2024-01-15T11:00:00.000Z",
      "_count": { "visit_referrals": 8 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetReferralsQuery): Promise<PaginatedResult<Referral>> {
  const where: any = { deleted_at: null };

  // Phone filter
  if (query.phone) {
    where.phone = {
      contains: query.phone.replace(/\D/g, ''),
      mode: 'insensitive'
    };
  }

  // Full name search
  if (query.full_name) {
    where.full_name = {
      contains: query.full_name,
      mode: 'insensitive'
    };
  }

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);

  // Sorting
  const orderBy = {
    [query.sortBy || 'created_at']: query.sortOrder || 'desc'
  };

  const [data, total] = await Promise.all([
    this.prisma.referral.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { visit_referrals: { where: { deleted_at: null } } }
        }
      }
    }),
    this.prisma.referral.count({ where })
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

### 3.4 POST /api/v1/visits/:visitId/referrals

**Tavsif:** Visitga tavsiya biriktirish (Admin, Receptionist)

**Request Body:**
```json
{
  "referral_id": 1
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tavsiya visitga muvaffaqiyatli biriktirildi",
  "data": {
    "id": 1,
    "visit_id": 1,
    "referral_id": 1,
    "referral": {
      "id": 1,
      "full_name": "Dr. John Smith",
      "phone": "+998901234567"
    },
    "created_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async linkToVisit(visitId: number, createVisitReferralDto: CreateVisitReferralDto, userId: number): Promise<VisitReferral> {
  // 1. Visit mavjudligini tekshirish
  const visit = await this.prisma.visit.findUnique({
    where: { id: visitId }
  });

  if (!visit || visit.deleted_at) {
    throw new NotFoundException('REF_002');
  }

  // 2. Referral mavjudligini tekshirish
  const referral = await this.prisma.referral.findUnique({
    where: { id: createVisitReferralDto.referral_id }
  });

  if (!referral || referral.deleted_at) {
    throw new NotFoundException('REF_003');
  }

  // 3. Duplicate tekshiruvi (bir visitga bir tavsiya)
  const existing = await this.prisma.visitReferral.findFirst({
    where: {
      visit_id: visitId,
      deleted_at: null
    }
  });

  if (existing) {
    throw new ConflictException('REF_004');
  }

  // 4. VisitReferral yaratish
  const visitReferral = await this.prisma.visitReferral.create({
     {
      visit_id: visitId,
      referral_id: createVisitReferralDto.referral_id,
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      referral: { select: { id: true, full_name: true, phone: true } }
    }
  });

  return visitReferral;
}
```

---

### 3.5 GET /api/v1/referrals/statistics

**Tavsif:** Tavsiya statistikasini olish (Admin, Accountant)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "referral_id": 1,
      "full_name": "Dr. John Smith",
      "phone": "+998901234567",
      "visit_count": 15
    },
    {
      "referral_id": 2,
      "full_name": "Jane Doe",
      "phone": "+998909876543",
      "visit_count": 8
    },
    {
      "referral_id": 3,
      "full_name": "Bob Johnson",
      "phone": null,
      "visit_count": 5
    }
  ]
}
```

**Service Layer Implementation:**
```typescript
async getStatistics(): Promise<ReferralStatistics[]> {
  const statistics = await this.prisma.visitReferral.groupBy({
    by: ['referral_id'],
    _count: {
      visit_id: true
    },
    where: {
      deleted_at: null
    }
  });

  // Referral ma'lumotlarini qo'shish
  const result = await Promise.all(
    statistics.map(async (stat) => {
      const referral = await this.prisma.referral.findUnique({
        where: { id: stat.referral_id },
        select: {
          id: true,
          full_name: true,
          phone: true
        }
      });

      return {
        referral_id: stat.referral_id,
        full_name: referral?.full_name || 'Noma\'lum',
        phone: referral?.phone || null,
        visit_count: stat._count.visit_id
      };
    })
  );

  // Sort by visit count (descending)
  return result.sort((a, b) => b.visit_count - a.visit_count);
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-referral.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches
} from 'class-validator';

export class CreateReferralDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Tavsiya nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Tavsiya nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Tavsiya nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  full_name: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Telefon +998901234567 formatda bo\'lishi kerak'
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}

// create-visit-referral.dto.ts
export class CreateVisitReferralDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  referral_id: number;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `full_name` | Required | REF_006 | Tavsiya nomi majburiy |
| `full_name` | MinLength 3 | REF_006 | Tavsiya nomi kamida 3 belgi |
| `full_name` | MaxLength 100 | REF_006 | Tavsiya nomi 100 belgidan oshmasin |
| `full_name` | Pattern | REF_006 | Noto'g'ri belgilar |
| `phone` | Pattern | REF_007 | +998901234567 format |
| `phone` | Unique | REF_001 | Telefon raqam allaqachon mavjud |
| `referral_id` | IsInt | REF_008 | Referral ID raqam bo'lishi kerak |
| `referral_id` | Must Exist | REF_003 | Tavsiya topilmadi |
| `visit_id` | Must Exist | REF_002 | Visit topilmadi |
| `visit_id + referral_id` | Unique | REF_004 | Visitga allaqachon tavsiya biriktirilgan |
| `status` | Enum | REF_009 | ACTIVE/INACTIVE/ARCHIVED |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `REF_001` | 409 Conflict | Telefon raqam allaqachon mavjud | Phone unique constraint | Boshqa raqam kiriting |
| `REF_002` | 404 Not Found | Visit topilmadi | Visit ID not exists | Visit ID ni tekshiring |
| `REF_003` | 404 Not Found | Tavsiya topilmadi | Referral ID not exists | ID ni tekshiring |
| `REF_004` | 409 Conflict | Visitga allaqachon tavsiya biriktirilgan | Duplicate visit_referral | Avval biriktirilgan tavsiyani o'chiring |
| `REF_005` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `REF_006` | 400 Bad Request | Tavsiya nomi noto'g'ri | Validation failed | 3-100 belgi, to'g'ri format |
| `REF_007` | 400 Bad Request | Telefon formati noto'g'ri | Validation failed | +998901234567 format |
| `REF_008` | 400 Bad Request | Referral ID noto'g'ri | Validation failed | Raqam kiriting |
| `REF_009` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

### 5.2 Exception Filter

```typescript
// referral-exception.filter.ts
@Catch()
export class ReferralExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'REF_001';
    if (exception instanceof NotFoundException) return 'REF_003';
    if (exception instanceof ForbiddenException) return 'REF_005';
    if (exception instanceof BadRequestException) return 'REF_006';
    return 'REF_003';
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
| POST /referrals | ✅ | ❌ | ❌ | ✅ | ❌ |
| GET /referrals | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /referrals/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /referrals/:id | ✅ | ❌ | ❌ | ✅ | ❌ |
| DELETE /referrals/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /visits/:id/referrals | ✅ | ❌ | ❌ | ✅ | ❌ |
| GET /referrals/statistics | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Ma'lumotlar Xavfsizligi (Reference: `Klinika.md` 8.1)
- ✅ Telefon raqam format validatsiya (+998 format)
- ✅ Personal data encryption (kelajakda)
- ✅ Access log (kim qachon ko'rdi)
- ✅ Soft delete (ma'lumotlarni fizik o'chirmaslik)
- ✅ HTTPS (barcha so'rovlar shifrlangan)

---

## 7. SEED DATA

### 7.1 Test Tavsiyalar

```typescript
// seed/referral.seed.ts
export async function seedReferrals(prisma: PrismaClient) {
  // Test tavsiyalar yaratish
  const referrals = [
    {
      full_name: 'Dr. John Smith',
      phone: '+998901111111',
      description: 'Doimiy tavsiya qiluvchi shifokor',
      status: 'ACTIVE'
    },
    {
      full_name: 'Jane Doe',
      phone: '+998902222222',
      description: 'Sobiq mijoz, doim tavsiya qiladi',
      status: 'ACTIVE'
    },
    {
      full_name: 'Bob Johnson',
      phone: null,
      description: 'Telefon raqami yo\'q',
      status: 'ACTIVE'
    }
  ];

  for (const referral of referrals) {
    await prisma.referral.create({ data: referral });
  }

  console.log(`✅ Referrals seeded successfully (${referrals.length} referrals)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat tavsiyalar
npm run seed:referrals
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test tavsiyalar o'chiriladi
- [ ] Tavsiya ma'lumotlari konfidensialligi ta'minlanadi
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
// referral.service.spec.ts
describe('ReferralService', () => {
  let service: ReferralService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReferralService, PrismaService],
    }).compile();

    service = module.get<ReferralService>(ReferralService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new referral successfully', async () => {
      const dto: CreateReferralDto = {
        full_name: 'Dr. John Smith',
        phone: '+998901234567',
        description: 'Test description',
      };

      prisma.referral.findFirst = jest.fn().mockResolvedValue(null);
      prisma.referral.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.full_name).toBe('Dr. John Smith');
      expect(prisma.referral.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if phone exists', async () => {
      const dto: CreateReferralDto = {
        full_name: 'Dr. John Smith',
        phone: '+998901234567',
      };

      prisma.referral.findFirst = jest.fn().mockResolvedValue({ id: 1, phone: '+998901234567' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('linkToVisit', () => {
    it('should link referral to visit successfully', async () => {
      const dto: CreateVisitReferralDto = { referral_id: 1 };

      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.referral.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visitReferral.findFirst = jest.fn().mockResolvedValue(null);
      prisma.visitReferral.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.linkToVisit(1, dto, 1);

      expect(result.referral_id).toBe(1);
    });

    it('should throw ConflictException if visit already has referral', async () => {
      const dto: CreateVisitReferralDto = { referral_id: 1 };

      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.referral.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visitReferral.findFirst = jest.fn().mockResolvedValue({ id: 1 });

      await expect(service.linkToVisit(1, dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('getStatistics', () => {
    it('should return referral statistics', async () => {
      prisma.visitReferral.groupBy = jest.fn().mockResolvedValue([
        { referral_id: 1, _count: { visit_id: 15 } }
      ]);
      prisma.referral.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        full_name: 'Dr. John Smith',
        phone: '+998901234567'
      });

      const result = await service.getStatistics();

      expect(result[0].visit_count).toBe(15);
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_referral

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Referral Table
CREATE TABLE "referrals" (
  "id" SERIAL PRIMARY KEY,
  "full_name" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20),
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_referral_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_referral_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create VisitReferral Table
CREATE TABLE "visit_referrals" (
  "id" SERIAL PRIMARY KEY,
  "visit_id" INTEGER,
  "referral_id" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_visit_referral_referral" 
    FOREIGN KEY ("referral_id") 
    REFERENCES "referrals"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_referral_visit" 
    FOREIGN KEY ("visit_id") 
    REFERENCES "visits"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_referral_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_referral_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "referrals_status_idx" ON "referrals"("status");
CREATE INDEX "referrals_phone_idx" ON "referrals"("phone");
CREATE INDEX "referrals_deleted_at_idx" ON "referrals"("deleted_at");
CREATE INDEX "visit_referrals_visit_id_idx" ON "visit_referrals"("visit_id");
CREATE INDEX "visit_referrals_referral_id_idx" ON "visit_referrals"("referral_id");
CREATE INDEX "visit_referrals_deleted_at_idx" ON "visit_referrals"("deleted_at");
CREATE UNIQUE INDEX "visit_referrals_visit_id_referral_id_idx" ON "visit_referrals"("visit_id", "referral_id");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_referral"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "visit_referrals" CASCADE;
DROP TABLE IF EXISTS "referrals" CASCADE;
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
// Referral
@@index([status])           // Status filter uchun
@@index([phone])            // Phone search uchun
@@index([deleted_at])       // Soft delete filter uchun

// VisitReferral
@@index([visit_id])         // Visit filter uchun
@@index([referral_id])      // Referral filter uchun
@@index([deleted_at])       // Soft delete filter uchun
@@unique([visit_id, referral_id])  // Duplicate oldini olish
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Referral List | Redis | 5 daqiqa | Referral create/update/delete |
| Single Referral | Redis | 2 daqiqa | Referral update/delete |
| Referral Statistics | Redis | 10 daqiqa | VisitReferral create/delete |
| Visit Referrals | Redis | 5 daqiqa | VisitReferral create/update |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const referrals = await prisma.referral.findMany({
  select: { 
    id: true, 
    full_name: true, 
    phone: true,
    status: true
  },
  where: { deleted_at: null, status: 'ACTIVE' },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const visitReferrals = await prisma.visitReferral.findMany({
  where: { 
    visit_id: 1,
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const referrals = await prisma.referral.findMany();
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
| Flow Document | `12-referral-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ⏳ Keyingi |
| VisitReferral RFC | `RFC-014-visit-referral-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Tavsiya nomi 3-100 belgi orasida bo'lishi
- [ ] Telefon raqam +998 formatida bo'lishi (Reference: `Klinika.md` 9.2)
- [ ] Telefon raqam unikal bo'lishi (agar kiritilgan bo'lsa)
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin va Receptionist tavsiya yaratish/o'zgartirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Barcha rollar tavsiya ro'yxatini ko'ra oladi
- [ ] Visitga tavsiya biriktirish ishlaydi
- [ ] Bir visitga faqat bitta tavsiya biriktirilishi
- [ ] Tavsiya statistikasi ishlaydi (Reference: `Klinika.md` 7.1)
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (Cascade delete for VisitReferral)

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
| Telefon raqam takrorlanishi | O'rta | Yuqori | Unique constraint + validation |
| Duplicate visit_referral | O'rta | O'rta | Unique constraint (visit_id, referral_id) |
| Cascade delete muammolari | O'rta | O'rta | Cascade delete + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Privacy concerns | Past | Yuqori | Data encryption + access control |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Referral bonus/reward system | 🟡 Medium | Phase 3 |
| Referral tiers/levels | 🟢 Low | Phase 4 |
| Referral analytics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| Referral change history | 🟢 Low | Phase 4 |
| SMS/Email notifications | 🟢 Low | Phase 4 |
| Referral portal for patients | 🟢 Low | Phase 4 |

---