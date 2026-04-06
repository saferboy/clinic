# 📋 RFC-009: Mijoz Boshqaruvi (Client Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-009 |
| **Nomi** | Client Management |
| **Phase** | 2A - Core Entities |
| **Model** | `Client` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Core Business) |
| **Bog'liq RFC** | RFC-002 (User), RFC-003 (LocRegion), RFC-004 (LocDistrict), RFC-005 (Source), RFC-006 (ClientGroup) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.2, 5.1, 5.2, 6.1, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikaga kelgan mijozlarni (bemorlarni) ro'yxatga olish, ularning ma'lumotlarini saqlash va boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Mijozlar bazasini shakllantirish, ularning moliyaviy holatini (balance, debt) kuzatish va kelajakdagi visitlar uchun asos yaratish (Reference: `Klinika.md` 3.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Mijoz yaratish (Create) | ❌ Mijoz tibbiy tarixi (kelajakda) |
| ✅ Mijoz ro'yxatini olish (Read) | ❌ Mijoz dokumentlari (kelajakda) |
| ✅ Mijoz yangilash (Update) | ❌ Frontend implementatsiya |
| ✅ Mijoz o'chirish - Soft Delete | ❌ Third-party integratsiya |
| ✅ Mijoz qidirish va filterlash | ❌ Mijoz segmentatsiyasi (kelajakda) |
| ✅ Mijoz balance boshqaruvi | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.2)
- Mijozlar bazasini shakllantirish va boshqarish (CRM)
- Mijozlarni hududiy joylashuvi bo'yicha klassifikatsiya qilish
- Mijoz manbailarini tahlil qilish (marketing analitika)
- Mijozlarni guruhlar bo'yicha segmentatsiya qilish (VIP, Korporativ, Oddiy)
- Mijoz moliyaviy holatini kuzatish (balance, debt)
- Visit va Payment jarayonlari uchun asos yaratish
- Hisobotlarda mijoz kesimida statistika olish (Reference: `Klinika.md` 7.1)

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model Client {
  id           Int           @id @default(autoincrement())
  full_name    String        @db.VarChar(100)
  phone        String        @db.VarChar(20)
  group_id     Int?          @map("group_id")
  gender       ClientGender
  date_of_birth Date?        @map("date_of_birth")
  region_id    Int?          @map("region_id")
  district_id  Int?          @map("district_id")
  address      String?       @db.VarChar(255)
  balance      Decimal       @default(0) @db.Decimal(15, 2)
  description  String?       @db.Text
  source_id    Int?          @map("source_id")
  status       RecordStatus  @default(ACTIVE)
  created_at   Timestamptz   @default(now())
  updated_at   Timestamptz   @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?         @map("registered_by")
  modified_by  Int?          @map("modified_by")

  // Relations
  group        ClientGroup?  @relation("fk_client_group", fields: [group_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  district     LocDistrict?  @relation("fk_client_district", fields: [district_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  region       LocRegion?    @relation("fk_client_region", fields: [region_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  source       Source?       @relation("fk_client_source", fields: [source_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?        @relation("fk_client_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?         @relation("fk_client_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  // Business relations
  payments     Payment[]     @relation("fk_payment_client")
  visits       Visit[]       @relation("fk_visit_client")
  client_paid  ClientPaid[]  @relation("fk_client_paid_client")

  @@index([group_id])
  @@index([region_id])
  @@index([district_id])
  @@index([source_id])
  @@index([status])
  @@index([phone])
  @@index([created_at])
  @@index([deleted_at])
  @@index([status, deleted_at])
  @@index([phone, status])
  @@map("clients")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Visit, Payment, ClientPaid jadvallari bilan bog'lanish uchun ishlatiladi |
| `full_name` | String | ✅ | - | VARCHAR(100) | **F.I.O**. Mijozning to'liq ismi, 3-100 belgi. Lotin va Kirill harflari ruxsat etiladi (Reference: `Klinika.md` 3.2, 9.2) |
| `phone` | String | ✅ | - | VARCHAR(20) | **Telefon raqam**. +998 formatida (masalan: +998901234567). Qidiruv uchun asosiy maydon, unikal emas (Reference: `Klinika.md` 9.2) |
| `group_id` | Int | ❌ | null | INTEGER | **Foreign Key**. ClientGroup jadvaliga bog'lanish. Mijoz guruhi (VIP, Oddiy, Korporativ). SetNull cascade |
| `gender` | Enum | ✅ | - | ClientGender | **Jinsi**. MALE (erkak), FEMALE (ayol), OTHER (boshqa). Tibbiy ma'lumotlar uchun muhim |
| `date_of_birth` | Date | ❌ | null | DATE | **Tug'ilgan sana**. Mijoz yoshini hisoblash uchun. Kelajakda tibbiy tarix uchun ishlatiladi |
| `region_id` | Int | ❌ | null | INTEGER | **Foreign Key**. LocRegion jadvaliga bog'lanish. Mijoz viloyati. SetNull cascade |
| `district_id` | Int | ❌ | null | INTEGER | **Foreign Key**. LocDistrict jadvaliga bog'lanish. Mijoz tumani. SetNull cascade |
| `address` | String | ❌ | null | VARCHAR(255) | **Manzil**. Mijozning yashash manzili, 0-255 belgi. Yetkazib berish xizmatlari uchun |
| `balance` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Hisob balansi**. Mijozning klinikadagi moliyaviy holati. Musbat = oldindan to'lov, Manfiy = qarz (Reference: `Klinika.md` 3.2, 9.2) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha ma'lumot**. Mijoz haqida qo'shimcha ma'lumot (kasalliklar, allergiya, maxsus e'tibor va h.k.) |
| `source_id` | Int | ❌ | null | INTEGER | **Foreign Key**. Source jadvaliga bog'lanish. Mijoz qayerdan keldi? (Instagram, Telegram, Tavsiya). Marketing analitika uchun |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi mijoz yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun |

### 2.3 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([group_id])` | group_id | Guruh bo'yicha filter qilishni tezlashtirish |
| `@@index([region_id])` | region_id | Viloyat bo'yicha filter qilishni tezlashtirish |
| `@@index([district_id])` | district_id | Tuman bo'yicha filter qilishni tezlashtirish |
| `@@index([source_id])` | source_id | Manba bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish |
| `@@index([phone])` | phone | Telefon raqam bo'yicha qidiruvni tezlashtirish (eng ko'p ishlatiladi) |
| `@@index([created_at])` | created_at | Yaratilgan vaqt bo'yicha sort/filter |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([status, deleted_at])` | status, deleted_at | Qo'shma index - aktiv va o'chirilmagan mijozlar |
| `@@index([phone, status])` | phone, status | Qo'shma index - telefon va status bo'yicha qidiruv (eng tez) |

### 2.4 Enum Tuzilishi (Reference: `klinika_prisma.txt`)

#### ClientGender Enum
```prisma
enum ClientGender {
  MALE    // ✅ Erkak
  FEMALE  // ✅ Ayol
  OTHER   // ✅ Boshqa
}
```

#### RecordStatus Enum
```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - mijoz ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - mijoz vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - mijoz tarix uchun saqlangan
}
```

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_client_group` | ClientGroup | N:1 | SetNull | Cascade | Guruh o'chirilganda mijozning group_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |
| `fk_client_district` | LocDistrict | N:1 | SetNull | Cascade | Tuman o'chirilganda mijozning district_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |
| `fk_client_region` | LocRegion | N:1 | SetNull | Cascade | Viloyat o'chirilganda mijozning region_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |
| `fk_client_source` | Source | N:1 | SetNull | Cascade | Manba o'chirilganda mijozning source_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanib qoladi |
| `fk_client_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_client_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_payment_client` | Payment | 1:N | SetNull | Cascade | Mijoz o'chirilganda to'lovlar saqlanib qoladi (moliyaviy tarix) |
| `fk_visit_client` | Visit | 1:N | SetNull | Cascade | Mijoz o'chirilganda visitlar saqlanib qoladi (tibbiy tarix) |
| `fk_client_paid_client` | ClientPaid | 1:N | SetNull | Cascade | Mijoz o'chirilganda oldindan to'lovlar saqlanib qoladi |

### 2.6 Cascade Rules Tushunchasi

```
Mijoz o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Client.status = 'INACTIVE'                  │
│ 2. Client.deleted_at = NOW()                   │
│ 3. Payment.client_id = NULL (SetNull)          │
│ 4. Visit.client_id = NULL (SetNull)            │
│ 5. ClientPaid.client_id = NULL (SetNull)       │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha moliyaviy 
va tibbiy ma'lumotlar saqlanib qoladi, faqat status o'zgaradi.
(Reference: Klinika.md 8.1 - Ma'lumotlar Xavfsizligi)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/clients` | ✅ JWT | Admin, Doctor, Receptionist | Yangi mijoz yaratish |
| 2 | GET | `/api/v1/clients` | ✅ JWT | Barchasi | Mijozlar ro'yxatini olish |
| 3 | GET | `/api/v1/clients/search` | ✅ JWT | Barchasi | Mijoz qidirish (phone/name) |
| 4 | GET | `/api/v1/clients/:id` | ✅ JWT | Barchasi | Bitta mijoz ma'lumotlari |
| 5 | PUT | `/api/v1/clients/:id` | ✅ JWT | Admin, Doctor, Receptionist | Mijoz yangilash |
| 6 | DELETE | `/api/v1/clients/:id` | ✅ JWT | Admin | Mijoz o'chirish (soft) |
| 7 | POST | `/api/v1/clients/:id/balance` | ✅ JWT | Admin, Accountant | Mijoz balance yangilash |
| 8 | GET | `/api/v1/clients/:id/visits` | ✅ JWT | Barchasi | Mijoz visitlari |
| 9 | GET | `/api/v1/clients/:id/payments` | ✅ JWT | Barchasi | Mijoz to'lovlari |

---

### 3.2 POST /api/v1/clients

**Tavsif:** Yangi mijoz yaratish (Admin, Doctor, Receptionist)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateClientDto {
  full_name: string;      // 3-100 belgi
  phone: string;          // +998 format
  group_id?: number;      // Mavjud ClientGroup ID
  gender: ClientGender;   // MALE/FEMALE/OTHER
  date_of_birth?: Date;   // Valid date
  region_id?: number;     // Mavjud LocRegion ID
  district_id?: number;   // Mavjud LocDistrict ID
  address?: string;       // 0-255 belgi
  source_id?: number;     // Mavjud Source ID
  description?: string;   // Text
  status?: string;        // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "full_name": "John Doe",
  "phone": "+998901234567",
  "group_id": 1,
  "gender": "MALE",
  "date_of_birth": "1990-01-01",
  "region_id": 1,
  "district_id": 1,
  "address": "Toshkent shahar, Chilonzor tumani",
  "source_id": 1,
  "description": "Doimiy mijoz",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Mijoz muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone": "+998901234567",
    "group": { "id": 1, "name": "Oddiy" },
    "gender": "MALE",
    "date_of_birth": "1990-01-01",
    "region": { "id": 1, "name": "Toshkent viloyati" },
    "district": { "id": 1, "name": "Chilonzor tumani" },
    "address": "Toshkent shahar, Chilonzor tumani",
    "balance": 0,
    "source": { "id": 1, "name": "Instagram" },
    "description": "Doimiy mijoz",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// client.service.ts
async create(createClientDto: CreateClientDto, userId: number): Promise<Client> {
  // 1. Phone formatini tekshirish va normalizatsiya (Reference: Klinika.md 9.2)
  const normalizedPhone = this.normalizePhone(createClientDto.phone);
  
  // 2. Mavjud mijozni telefon raqam bo'yicha tekshirish
  const existingClient = await this.prisma.client.findFirst({
    where: {
      phone: normalizedPhone,
      deleted_at: null
    }
  });
  
  if (existingClient) {
    throw new ConflictException('CLI_001');
  }
  
  // 3. Reference ma'lumotlarni tekshirish (agar kiritilgan bo'lsa)
  if (createClientDto.group_id) {
    const group = await this.prisma.clientGroup.findUnique({
      where: { id: createClientDto.group_id }
    });
    if (!group || group.deleted_at) {
      throw new NotFoundException('CLI_002');
    }
  }
  
  if (createClientDto.region_id) {
    const region = await this.prisma.locRegion.findUnique({
      where: { id: createClientDto.region_id }
    });
    if (!region || region.deleted_at) {
      throw new NotFoundException('CLI_003');
    }
  }
  
  if (createClientDto.district_id) {
    const district = await this.prisma.locDistrict.findUnique({
      where: { id: createClientDto.district_id }
    });
    if (!district || district.deleted_at) {
      throw new NotFoundException('CLI_004');
    }
  }
  
  if (createClientDto.source_id) {
    const source = await this.prisma.source.findUnique({
      where: { id: createClientDto.source_id }
    });
    if (!source || source.deleted_at) {
      throw new NotFoundException('CLI_005');
    }
  }
  
  // 4. Mijoz yaratish
  const client = await this.prisma.client.create({
     {
      full_name: createClientDto.full_name,
      phone: normalizedPhone,
      group_id: createClientDto.group_id,
      gender: createClientDto.gender,
      date_of_birth: createClientDto.date_of_birth,
      region_id: createClientDto.region_id,
      district_id: createClientDto.district_id,
      address: createClientDto.address,
      balance: 0,  // Default 0
      source_id: createClientDto.source_id,
      description: createClientDto.description,
      status: createClientDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      group: { select: { id: true, name: true } },
      region: { select: { id: true, name: true } },
      district: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } }
    }
  });
  
  return client;
}

// Phone normalizatsiya helper (Reference: Klinika.md 9.2)
private normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('998')) {
    return '+' + digits;
  }
  
  if (digits.length === 9) {
    return '+998' + digits;
  }
  
  throw new BadRequestException('CLI_006');
}
```

---

### 3.3 GET /api/v1/clients

**Tavsif:** Mijozlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 10 | Sahifadagi elementlar soni (max 100) |
| `phone` | string | - | Telefon raqam bo'yicha filter |
| `full_name` | string | - | Ism bo'yicha qidiruv |
| `group_id` | number | - | Guruh bo'yicha filter |
| `region_id` | number | - | Viloyat bo'yicha filter |
| `district_id` | number | - | Tuman bo'yicha filter |
| `source_id` | number | - | Manba bo'yicha filter |
| `status` | string | - | Status bo'yicha filter |
| `gender` | string | - | Jinsi bo'yicha filter |
| `sortBy` | string | created_at | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/clients?page=1&limit=10&phone=+99890&status=ACTIVE&sortBy=created_at&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+998901234567",
      "group": { "id": 1, "name": "Oddiy" },
      "gender": "MALE",
      "balance": 0,
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visits": 5, "payments": 3 }
    },
    {
      "id": 2,
      "full_name": "Jane Smith",
      "phone": "+998909876543",
      "group": { "id": 2, "name": "VIP" },
      "gender": "FEMALE",
      "balance": 100000,
      "status": "ACTIVE",
      "created_at": "2024-01-15T11:00:00.000Z",
      "_count": { "visits": 10, "payments": 8 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 500,
    "totalPages": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Service Layer Implementation:**
```typescript
async findAll(query: GetClientsQuery): Promise<PaginatedResult<Client>> {
  const where: any = { deleted_at: null };
  
  // Phone filter (exact match after normalization)
  if (query.phone) {
    where.phone = this.normalizePhone(query.phone);
  }
  
  // Full name search (case-insensitive)
  if (query.full_name) {
    where.full_name = {
      contains: query.full_name,
      mode: 'insensitive'
    };
  }
  
  // Group filter
  if (query.group_id) {
    where.group_id = query.group_id;
  }
  
  // Region filter
  if (query.region_id) {
    where.region_id = query.region_id;
  }
  
  // District filter
  if (query.district_id) {
    where.district_id = query.district_id;
  }
  
  // Source filter
  if (query.source_id) {
    where.source_id = query.source_id;
  }
  
  // Status filter
  if (query.status) {
    where.status = query.status;
  }
  
  // Gender filter
  if (query.gender) {
    where.gender = query.gender;
  }
  
  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);
  
  // Sorting
  const orderBy = {
    [query.sortBy || 'created_at']: query.sortOrder || 'desc'
  };
  
  const [data, total] = await Promise.all([
    this.prisma.client.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        group: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
        source: { select: { id: true, name: true } },
        _count: {
          select: { 
            visits: { where: { deleted_at: null } },
            payments: { where: { deleted_at: null } }
          }
        }
      }
    }),
    this.prisma.client.count({ where })
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

### 3.4 GET /api/v1/clients/search

**Tavsif:** Mijozlarni qidirish (telefon yoki ism bo'yicha)

**Query Parameters:**
| Param | Tip | Majburiy | Tavsif |
|-------|-----|----------|--------|
| `phone` | string | ❌ | Telefon raqam (qisman qidiruv) |
| `full_name` | string | ❌ | Ism (qisman qidiruv) |
| `limit` | number | ❌ | Natijalar soni (default: 10, max: 50) |

**Request Example:**
```http
GET /api/v1/clients/search?phone=+99890&full_name=John&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+998901234567",
      "balance": 0,
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "full_name": "John Smith",
      "phone": "+998909876543",
      "balance": 50000,
      "status": "ACTIVE"
    }
  ]
}
```

**Service Layer Implementation:**
```typescript
async search(query: SearchClientsQuery): Promise<Client[]> {
  const where: any = { deleted_at: null };
  
  // Phone search (partial match)
  if (query.phone) {
    const normalizedPhone = this.normalizePhone(query.phone);
    where.phone = {
      contains: normalizedPhone.replace('+', '')
    };
  }
  
  // Full name search (case-insensitive)
  if (query.full_name) {
    where.full_name = {
      contains: query.full_name,
      mode: 'insensitive'
    };
  }
  
  // Limit results (max 50 for performance)
  const take = Math.min(query.limit || 10, 50);
  
  return this.prisma.client.findMany({
    where,
    take,
    select: {
      id: true,
      full_name: true,
      phone: true,
      balance: true,
      status: true,
      group: { select: { id: true, name: true } }
    },
    orderBy: { created_at: 'desc' }
  });
}
```

---

### 3.5 GET /api/v1/clients/:id

**Tavsif:** Bitta mijoz ma'lumotlarini olish

**Path Parameters:**
| Param | Tip | Tavsif |
|-------|-----|--------|
| `id` | number | Mijoz ID |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone": "+998901234567",
    "group": { "id": 1, "name": "Oddiy" },
    "gender": "MALE",
    "date_of_birth": "1990-01-01",
    "region": { "id": 1, "name": "Toshkent viloyati" },
    "district": { "id": 1, "name": "Chilonzor tumani" },
    "address": "Toshkent shahar, Chilonzor tumani",
    "balance": 0,
    "source": { "id": 1, "name": "Instagram" },
    "description": "Doimiy mijoz",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "visits": [],
    "payments": [],
    "_count": { "visits": 5, "payments": 3 }
  }
}
```

**Service Layer Implementation:**
```typescript
async findOne(id: number): Promise<Client> {
  const client = await this.prisma.client.findUnique({
    where: { id },
    include: {
      group: { select: { id: true, name: true } },
      region: { select: { id: true, name: true } },
      district: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      visits: {
        where: { deleted_at: null },
        take: 10,
        orderBy: { visit_date: 'desc' },
        include: {
          doctor: { select: { id: true, full_name: true } }
        }
      },
      payments: {
        where: { deleted_at: null },
        take: 10,
        orderBy: { payment_date: 'desc' }
      },
      _count: {
        select: { 
          visits: { where: { deleted_at: null } },
          payments: { where: { deleted_at: null } }
        }
      }
    }
  });
  
  if (!client || client.deleted_at) {
    throw new NotFoundException('CLI_007');
  }
  
  return client;
}
```

---

### 3.6 PUT /api/v1/clients/:id

**Tavsif:** Mijoz ma'lumotlarini yangilash

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone": "+998901234567",
  "address": "Yangi manzil",
  "group_id": 2
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mijoz muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "full_name": "John Doe Updated",
    "phone": "+998901234567",
    "group": { "id": 2, "name": "VIP" },
    "status": "ACTIVE",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async update(id: number, updateClientDto: UpdateClientDto, userId: number): Promise<Client> {
  // 1. Mijoz mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id }
  });
  
  if (!client || client.deleted_at) {
    throw new NotFoundException('CLI_007');
  }
  
  // 2. Phone unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateClientDto.phone && updateClientDto.phone !== client.phone) {
    const normalizedPhone = this.normalizePhone(updateClientDto.phone);
    
    const existingClient = await this.prisma.client.findFirst({
      where: {
        phone: normalizedPhone,
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existingClient) {
      throw new ConflictException('CLI_001');
    }
    
    updateClientDto.phone = normalizedPhone;
  }
  
  // 3. Reference ma'lumotlarni tekshirish (agar o'zgarayotgan bo'lsa)
  if (updateClientDto.group_id) {
    const group = await this.prisma.clientGroup.findUnique({
      where: { id: updateClientDto.group_id }
    });
    if (!group || group.deleted_at) {
      throw new NotFoundException('CLI_002');
    }
  }
  
  if (updateClientDto.region_id) {
    const region = await this.prisma.locRegion.findUnique({
      where: { id: updateClientDto.region_id }
    });
    if (!region || region.deleted_at) {
      throw new NotFoundException('CLI_003');
    }
  }
  
  if (updateClientDto.district_id) {
    const district = await this.prisma.locDistrict.findUnique({
      where: { id: updateClientDto.district_id }
    });
    if (!district || district.deleted_at) {
      throw new NotFoundException('CLI_004');
    }
  }
  
  if (updateClientDto.source_id) {
    const source = await this.prisma.source.findUnique({
      where: { id: updateClientDto.source_id }
    });
    if (!source || source.deleted_at) {
      throw new NotFoundException('CLI_005');
    }
  }
  
  // 4. Mijoz yangilash
  const updated = await this.prisma.client.update({
    where: { id },
     {
      ...updateClientDto,
      updated_at: new Date(),
      modified_by: userId
    },
    include: {
      group: { select: { id: true, name: true } },
      region: { select: { id: true, name: true } },
      district: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } }
    }
  });
  
  return updated;
}
```

---

### 3.7 DELETE /api/v1/clients/:id

**Tavsif:** Mijozni soft delete qilish (faqat Admin)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mijoz muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async remove(id: number, userId: number): Promise<Client> {
  // 1. Mijoz mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id }
  });
  
  if (!client || client.deleted_at) {
    throw new NotFoundException('CLI_007');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish (Reference: Klinika.md 8.1)
  const visitCount = await this.prisma.visit.count({
    where: { client_id: id, deleted_at: null }
  });
  
  const paymentCount = await this.prisma.payment.count({
    where: { client_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (visitCount > 0 || paymentCount > 0) {
    this.logger.warn(
      `Client ${id} has ${visitCount} visits and ${paymentCount} payments. 
       These records will remain but client will be inactive.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.client.update({
    where: { id },
     {
      status: 'INACTIVE',
      deleted_at: new Date()
    }
  });
}
```

---

### 3.8 POST /api/v1/clients/:id/balance

**Tavsif:** Mijoz balance ini yangilash (Admin, Accountant)

**Request Body:**
```json
{
  "amount": 50000,
  "operation": "CREDIT",  // CREDIT yoki DEBIT
  "description": "Oldindan to'lov"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Balance muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "balance": 50000,
    "updated_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async updateBalance(id: number, updateBalanceDto: UpdateBalanceDto, userId: number): Promise<Client> {
  // 1. Mijoz mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id }
  });
  
  if (!client || client.deleted_at) {
    throw new NotFoundException('CLI_007');
  }
  
  // 2. Balance hisoblash
  const newBalance = updateBalanceDto.operation === 'CREDIT'
    ? client.balance + updateBalanceDto.amount
    : client.balance - updateBalanceDto.amount;
  
  // 3. Balance yangilash
  const updated = await this.prisma.client.update({
    where: { id },
     {
      balance: newBalance,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-client.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  IsDateString,
  Matches,
  Min,
  IsDecimal
} from 'class-validator';

export enum ClientGenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export class CreateClientDto {
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
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Telefon +998901234567 formatda bo\'lishi kerak'
  })
  phone: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  group_id?: number;

  @IsEnum(ClientGenderEnum)
  @IsNotEmpty()
  gender: ClientGenderEnum;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  region_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  district_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  source_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
  status?: string;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `full_name` | Required | CLI_009 | Ism majburiy |
| `full_name` | MinLength 3 | CLI_009 | Ism kamida 3 belgi |
| `full_name` | MaxLength 100 | CLI_009 | Ism 100 belgidan oshmasin |
| `full_name` | Pattern | CLI_009 | Noto'g'ri belgilar |
| `phone` | Required | CLI_010 | Telefon majburiy |
| `phone` | Pattern | CLI_006 | +998901234567 format |
| `phone` | Unique | CLI_001 | Telefon raqam allaqachon mavjud |
| `gender` | Required | CLI_010 | Jinsi tanlanmagan |
| `gender` | Enum | CLI_010 | MALE/FEMALE/OTHER |
| `date_of_birth` | IsDateString | CLI_011 | Noto'g'ri sana formati |
| `date_of_birth` | Max today | CLI_011 | Kelajak sana bo'lmasligi kerak |
| `group_id` | IsInt | CLI_002 | Group ID raqam bo'lishi kerak |
| `group_id` | Must Exist | CLI_002 | Mijoz guruhi topilmadi |
| `region_id` | IsInt | CLI_003 | Region ID raqam bo'lishi kerak |
| `region_id` | Must Exist | CLI_003 | Viloyat topilmadi |
| `district_id` | IsInt | CLI_004 | District ID raqam bo'lishi kerak |
| `district_id` | Must Exist | CLI_004 | Tuman topilmadi |
| `source_id` | IsInt | CLI_005 | Source ID raqam bo'lishi kerak |
| `source_id` | Must Exist | CLI_005 | Manba topilmadi |
| `address` | MaxLength 255 | CLI_012 | Manzil 255 belgidan oshmasin |
| `balance` | Decimal(15,2) | CLI_013 | Noto'g'ri format |
| `status` | Enum | CLI_014 | ACTIVE/INACTIVE/ARCHIVED |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `CLI_001` | 409 Conflict | Telefon raqam allaqachon mavjud | Phone unique constraint | Boshqa raqam kiriting |
| `CLI_002` | 404 Not Found | Mijoz guruhi topilmadi | Group ID not exists | Group ID ni tekshiring |
| `CLI_003` | 404 Not Found | Viloyat topilmadi | Region ID not exists | Region ID ni tekshiring |
| `CLI_004` | 404 Not Found | Tuman topilmadi | District ID not exists | District ID ni tekshiring |
| `CLI_005` | 404 Not Found | Manba topilmadi | Source ID not exists | Source ID ni tekshiring |
| `CLI_006` | 400 Bad Request | Telefon formati noto'g'ri | Phone validation failed | +998901234567 format |
| `CLI_007` | 404 Not Found | Mijoz topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `CLI_008` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `CLI_009` | 400 Bad Request | Ism juda qisqa | Validation failed | Min 3 belgi |
| `CLI_010` | 400 Bad Request | Jinsi tanlanmagan | Validation failed | MALE/FEMALE/OTHER |
| `CLI_011` | 400 Bad Request | Sana noto'g'ri | Validation failed | YYYY-MM-DD format |
| `CLI_012` | 400 Bad Request | Manzil juda uzun | Validation failed | 255 belgidan oshmasin |
| `CLI_013` | 400 Bad Request | Balance noto'g'ri format | Validation failed | Decimal(15,2) format |
| `CLI_014` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |

### 5.2 Exception Filter

```typescript
// client-exception.filter.ts
@Catch()
export class ClientExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'CLI_001';
    if (exception instanceof NotFoundException) return 'CLI_007';
    if (exception instanceof ForbiddenException) return 'CLI_008';
    if (exception instanceof BadRequestException) return 'CLI_009';
    return 'CLI_007';
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
| POST /clients | ✅ | ✅ | ❌ | ✅ | ❌ |
| GET /clients | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /clients/search | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /clients/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /clients/:id | ✅ | ✅ | ❌ | ✅ | ❌ |
| DELETE /clients/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /clients/:id/balance | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /clients/:id/visits | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /clients/:id/payments | ✅ | ✅ | ✅ | ✅ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Ma'lumotlar Xavfsizligi (Reference: `Klinika.md` 8.1)
- ✅ Phone number format validatsiya (+998 format)
- ✅ Personal data encryption (kelajakda)
- ✅ Access log (kim qachon ko'rdi)
- ✅ Soft delete (ma'lumotlarni fizik o'chirmaslik)
- ✅ HTTPS (barcha so'rovlar shifrlangan)

### 6.5 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |

---

## 7. SEED DATA

### 7.1 Test Mijozlar

```typescript
// seed/client.seed.ts
export async function seedClients(prisma: PrismaClient) {
  // Test mijozlar yaratish
  const clients = [
    {
      full_name: 'John Doe',
      phone: '+998901111111',
      group_id: 1,  // Oddiy
      gender: 'MALE' as const,
      date_of_birth: new Date('1990-01-01'),
      region_id: 1,  // Toshkent viloyati
      district_id: 1,  // Chilonzor tumani
      address: 'Toshkent shahar',
      source_id: 1,  // Instagram
      balance: 0,
      status: 'ACTIVE' as const
    },
    {
      full_name: 'Jane Smith',
      phone: '+998902222222',
      group_id: 2,  // VIP
      gender: 'FEMALE' as const,
      date_of_birth: new Date('1985-05-15'),
      region_id: 1,
      district_id: 1,
      address: 'Toshkent shahar',
      source_id: 2,  // Telegram
      balance: 100000,  // Oldindan to'lov
      status: 'ACTIVE' as const
    },
    {
      full_name: 'Bob Johnson',
      phone: '+998903333333',
      group_id: 1,
      gender: 'MALE' as const,
      region_id: 2,  // Samarqand
      source_id: 3,  // Google
      balance: -50000,  // Qarz
      status: 'ACTIVE' as const
    }
  ];

  for (const client of clients) {
    await prisma.client.create({ data: client });
  }

  console.log('✅ Clients seeded successfully (3 test clients)');
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat mijozlar
npm run seed:clients
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test mijozlar o'chiriladi
- [ ] Mijoz ma'lumotlari konfidensialligi ta'minlanadi
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
// client.service.spec.ts
describe('ClientService', () => {
  let service: ClientService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientService, PrismaService],
    }).compile();

    service = module.get<ClientService>(ClientService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new client successfully', async () => {
      const dto: CreateClientDto = {
        full_name: 'John Doe',
        phone: '+998901234567',
        gender: 'MALE',
        group_id: 1,
      };

      prisma.client.findFirst = jest.fn().mockResolvedValue(null);
      prisma.clientGroup.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.client.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.full_name).toBe('John Doe');
      expect(prisma.client.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if phone exists', async () => {
      const dto: CreateClientDto = {
        full_name: 'John Doe',
        phone: '+998901234567',
        gender: 'MALE',
      };

      prisma.client.findFirst = jest.fn().mockResolvedValue({ id: 1, phone: '+998901234567' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      const query: GetClientsQuery = { page: 1, limit: 10 };

      prisma.client.findMany = jest.fn().mockResolvedValue([]);
      prisma.client.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('remove', () => {
    it('should soft delete a client', async () => {
      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.count = jest.fn().mockResolvedValue(0);
      prisma.payment.count = jest.fn().mockResolvedValue(0);
      prisma.client.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.status).toBe('INACTIVE');
    });
  });
});
```

### 8.3 E2E Test

```typescript
// client.e2e-spec.ts
describe('Client (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    await app.init();
    
    authToken = await getAdminToken();
  });

  it('/api/v1/clients (POST) - Create client', () => {
    return request(app.getHttpServer())
      .post('/api/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        full_name: 'John Doe',
        phone: '+998901234567',
        gender: 'MALE',
      })
      .expect(201);
  });

  it('/api/v1/clients (GET) - Get all clients', () => {
    return request(app.getHttpServer())
      .get('/api/v1/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/clients/search (GET) - Search clients', () => {
    return request(app.getHttpServer())
      .get('/api/v1/clients/search?phone=+99890')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/api/v1/clients/:id (DELETE) - Soft delete client', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/clients/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_client

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Enum
CREATE TYPE "ClientGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- Create Table
CREATE TABLE "clients" (
  "id" SERIAL PRIMARY KEY,
  "full_name" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "group_id" INTEGER,
  "gender" "ClientGender" NOT NULL,
  "date_of_birth" DATE,
  "region_id" INTEGER,
  "district_id" INTEGER,
  "address" VARCHAR(255),
  "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "description" TEXT,
  "source_id" INTEGER,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_client_group" 
    FOREIGN KEY ("group_id") 
    REFERENCES "client_groups"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_region" 
    FOREIGN KEY ("region_id") 
    REFERENCES "loc_regions"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_district" 
    FOREIGN KEY ("district_id") 
    REFERENCES "loc_districts"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_source" 
    FOREIGN KEY ("source_id") 
    REFERENCES "sources"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "clients_group_id_idx" ON "clients"("group_id");
CREATE INDEX "clients_region_id_idx" ON "clients"("region_id");
CREATE INDEX "clients_district_id_idx" ON "clients"("district_id");
CREATE INDEX "clients_source_id_idx" ON "clients"("source_id");
CREATE INDEX "clients_status_idx" ON "clients"("status");
CREATE INDEX "clients_phone_idx" ON "clients"("phone");
CREATE INDEX "clients_created_at_idx" ON "clients"("created_at");
CREATE INDEX "clients_deleted_at_idx" ON "clients"("deleted_at");
CREATE INDEX "clients_status_deleted_at_idx" ON "clients"("status", "deleted_at");
CREATE INDEX "clients_phone_status_idx" ON "clients"("phone", "status");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_client"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TYPE IF EXISTS "ClientGender" CASCADE;
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
@@index([group_id])           // Guruh filter uchun
@@index([region_id])           // Viloyat filter uchun
@@index([district_id])         // Tuman filter uchun
@@index([source_id])           // Manba filter uchun
@@index([status])              // Status filter uchun
@@index([phone])               // Phone search uchun (eng muhim)
@@index([created_at])          // Sort uchun
@@index([deleted_at])          // Soft delete filter uchun
@@index([status, deleted_at])  // Qo'shma index - aktiv va o'chirilmagan
@@index([phone, status])       // Qo'shma index - telefon va status (eng tez)
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Client List | Redis | 5 daqiqa | Client create/update/delete |
| Single Client | Redis | 2 daqiqa | Client update/delete |
| Client Search | Redis | 1 daqiqa | Client create/update |
| Client Visits | Redis | 5 daqiqa | Visit create/update |
| Client Payments | Redis | 5 daqiqa | Payment create/update |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const clients = await prisma.client.findMany({
  select: { 
    id: true, 
    full_name: true, 
    phone: true, 
    balance: true,
    status: true,
    group: { select: { name: true } }
  },
  where: { deleted_at: null, status: 'ACTIVE' },
  take: 10
});

// ✅ Yaxshi - Qo'shma index ishlatish
const clients = await prisma.client.findMany({
  where: { 
    phone: { contains: '+99890' },
    status: 'ACTIVE',
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const clients = await prisma.client.findMany();
```

### 10.4 Pagination Best Practices

```typescript
// ✅ Yaxshi - Limit bilan
const clients = await prisma.client.findMany({
  skip: (page - 1) * limit,
  take: Math.min(limit, 100),  // Max 100
});

// ❌ Yomon - Limitsiz
const clients = await prisma.client.findMany();
```

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `09-client-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| LocRegion RFC | `RFC-003-location-region.md` | ✅ Tasdiqlandi |
| LocDistrict RFC | `RFC-004-location-district.md` | ✅ Tasdiqlandi |
| Source RFC | `RFC-005-source-management.md` | ✅ Tasdiqlandi |
| ClientGroup RFC | `RFC-006-client-group-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-012-visit-management.md` | ⏳ Keyingi |
| Payment RFC | `RFC-013-payment-management.md` | ⏳ Phase 2B |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Telefon raqam +998 formatida bo'lishi (Reference: `Klinika.md` 9.2)
- [ ] Telefon raqam bo'yicha dublikat tekshiruvi
- [ ] Full name 3-100 belgi orasida bo'lishi
- [ ] Gender MALE/FEMALE/OTHER qiymat qabul qilishi
- [ ] Balance Decimal(15,2) formatda bo'lishi (Reference: `Klinika.md` 9.2)
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin mijoz o'chirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Doctor va Receptionist mijoz yaratish/o'zgartirish huquqiga ega
- [ ] Barcha rollar mijoz ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull)
- [ ] Balance avtomatik hisoblanadi (Payment/ClientPaid o'zgarganda)

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
| Telefon raqam takrorlanishi | O'rta | Yuqori | Unique constraint + normalizatsiya |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing |
| Personal data leak | Past | Yuqori | Encryption + access control |
| Balance inconsistency | O'rta | Yuqori | Transaction + automatic calculation |
| Search performance | Past | O'rta | Index + pagination limit |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Medical history | 🟡 Medium | Phase 3 |
| Client documents | 🟢 Low | Phase 3 |
| Client notes | 🟢 Low | Phase 3 |
| Client segmentation | 🟡 Medium | Phase 3 |
| Bulk import/export | 🟢 Low | Phase 3 |
| Client change history | 🟢 Low | Phase 4 |
| SMS/Email notifications | 🟢 Low | Phase 4 |
| Client portal | 🟢 Low | Phase 4 |
