# 📋 RFC-014: To'lovlar Boshqaruvi (Payment Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-014 |
| **Nomi** | Payment Management |
| **Phase** | 2B - Finance |
| **Model** | `Payment`, `ClientPaid`, `OtherPaid`, `OtherPaidGroup` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Finance) |
| **Bog'liq RFC** | RFC-002 (User), RFC-009 (Client), RFC-013 (Visit) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.5, 4.2, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikaga kelib tushadigan to'lovlarni (kirim) va chiqimlarni boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Mijozlardan olingan to'lovlarni, oldindan to'lovlarni, boshqa kirim/chiqimlarni hisobga olish va moliyaviy hisobotlar uchun asos yaratish. Har bir to'lovni Visit, Client va User bilan bog'lash va Client balance ni avtomatik yangilash (Reference: `Klinika.md` 3.5, 4.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Payment yaratish (Create) | ❌ Online to'lov integratsiyasi (kelajakda) |
| ✅ Payment ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Payment yangilash (Update) | ❌ Bank integratsiyasi (kelajakda) |
| ✅ Payment refund (Soft Delete) | ❌ Multi-currency support |
| ✅ ClientPaid yaratish | |
| ✅ OtherPaid yaratish | |
| ✅ OtherPaidGroup boshqaruvi | |
| ✅ Moliyaviy hisobot (Summary) | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.5, 4.2)
- Klinika moliyaviy oqimlarini markazlashtirilgan boshqarish
- Mijoz to'lovlarini Visit bilan bog'lash
- Oldindan to'lovlarni (ClientPaid) hisobga olish
- Chiqimlarni kategoriyalash (OtherPaidGroup)
- Client balance avtomatik hisoblash va yangilash
- Moliyaviy hisobotlar uchun asos yaratish (Reference: `Klinika.md` 7.1)
- Qarzdorlikni nazorat qilish (debt tracking)
- Kirim/chiqim analitikasi

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

#### Payment Model
```prisma
model Payment {
  id           Int         @id @default(autoincrement())
  client_id    Int?        @map("client_id")
  user_id      Int?        @map("user_id")
  visit_id     Int?        @map("visit_id")
  amount       Decimal     @default(0) @db.Decimal(15, 2)
  payment_type PaymentType @default(INCOME) @map("payment_type")
  description  String?     @db.Text
  payment_date Timestamptz @default(now()) @map("payment_date")
  created_at   Timestamptz @default(now())
  updated_at   Timestamptz @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?       @map("registered_by")
  modified_by  Int?        @map("modified_by")

  // Relations
  client       Client?     @relation("fk_payment_client", fields: [client_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  user         User?       @relation("fk_payment_user", fields: [user_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  visit        Visit?      @relation("fk_payment_visit", fields: [visit_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?      @relation("fk_payment_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?       @relation("fk_payment_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([client_id])
  @@index([user_id])
  @@index([visit_id])
  @@index([payment_type])
  @@index([payment_date])
  @@index([deleted_at])
  @@index([client_id, payment_date])
  @@index([payment_type, payment_date])
  @@index([payment_date, deleted_at])
  @@map("payments")
}
```

#### ClientPaid Model
```prisma
model ClientPaid {
  id           Int         @id @default(autoincrement())
  client_id    Int?        @map("client_id")
  visit_id     Int?        @map("visit_id")
  amount       Decimal     @default(0) @db.Decimal(15, 2)
  description  String?     @db.Text
  payment_date Timestamptz @default(now()) @map("payment_date")
  created_at   Timestamptz @default(now())
  updated_at   Timestamptz @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?       @map("registered_by")
  modified_by  Int?        @map("modified_by")

  // Relations
  client       Client?     @relation("fk_client_paid_client", fields: [client_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  visit        Visit?      @relation("fk_client_paid_visit", fields: [visit_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?      @relation("fk_client_paid_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?       @relation("fk_client_paid_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([client_id])
  @@index([visit_id])
  @@index([payment_date])
  @@index([deleted_at])
  @@index([client_id, payment_date])
  @@index([visit_id, payment_date])
  @@map("client_paid")
}
```

#### OtherPaid Model
```prisma
model OtherPaid {
  id           Int          @id @default(autoincrement())
  group_id     Int?         @map("group_id")
  type         PaymentType
  amount       Decimal      @default(0) @db.Decimal(15, 2)
  description  String?      @db.Text
  payment_date Timestamptz  @default(now()) @map("payment_date")
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?        @map("registered_by")
  modified_by  Int?         @map("modified_by")

  // Relations
  group        OtherPaidGroup? @relation("fk_other_paid_group", fields: [group_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?        @relation("fk_other_paid_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?         @relation("fk_other_paid_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([group_id])
  @@index([type])
  @@index([payment_date])
  @@index([deleted_at])
  @@index([type, payment_date])
  @@map("other_paid")
}
```

#### OtherPaidGroup Model
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

#### Payment Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi |
| `client_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Client jadvaliga bog'lanish. Qaysi mijoz to'lov qilganligi (Reference: `Klinika.md` 3.2) |
| `user_id` | Int | ❌ | null | INTEGER | **Foreign Key**. User jadvaliga bog'lanish. Qaysi foydalanuvchi to'lovni qabul qilganligi |
| `visit_id` | Int | ❌ | null | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish. Qaysi visit uchun to'lov qilinganligi |
| `amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **To'lov summasi**. So'mda ifodalanadi. 2 kasr belgigacha. Moliyaviy hisob-kitob uchun muhim (Reference: `Klinika.md` 9.2) |
| `payment_type` | Enum | ✅ | INCOME | PaymentType | **To'lov turi**. INCOME (kirim), OUTCOME (chiqim) (Reference: `Klinika.md` 3.5) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. To'lov haqida qo'shimcha ma'lumot |
| `payment_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **To'lov sanasi**. Qachon to'lov amalga oshirilganligi. Hisobotlar uchun muhim |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade. Audit uchun |

#### ClientPaid Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator |
| `client_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Client jadvaliga bog'lanish. Qaysi mijoz oldindan to'lov qilganligi |
| `visit_id` | Int | ❌ | null | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish. Qaysi visit uchun oldindan to'lov (optional) |
| `amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **To'lov summasi**. So'mda ifodalanadi. 2 kasr belgigacha |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. To'lov haqida qo'shimcha ma'lumot |
| `payment_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **To'lov sanasi**. Qachon to'lov amalga oshirilganligi |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Audit uchun |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish** |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete** |
| `registered_by` | Int | ❌ | null | INTEGER | **Kim yaratdi**. Audit uchun |
| `modified_by` | Int | ❌ | null | INTEGER | **Kim o'zgartirdi**. Audit uchun |

#### OtherPaid Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator |
| `group_id` | Int | ❌ | null | INTEGER | **Foreign Key**. OtherPaidGroup jadvaliga bog'lanish. Chiqim kategoriyasi |
| `type` | Enum | ✅ | - | PaymentType | **To'lov turi**. INCOME (boshqa kirim), OUTCOME (chiqim) |
| `amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Summa**. So'mda ifodalanadi |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. To'lov haqida qo'shimcha ma'lumot |
| `payment_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **To'lov sanasi** |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt** |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish** |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete** |
| `registered_by` | Int | ❌ | null | INTEGER | **Kim yaratdi** |
| `modified_by` | Int | ❌ | null | INTEGER | **Kim o'zgartirdi** |

#### OtherPaidGroup Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator |
| `name` | String | ✅ | - | VARCHAR(100) | **Guruh nomi**. 3-100 belgi. Misol: "Maoshlar", "Kommunal to'lovlar" |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. Guruh haqida qo'shimcha ma'lumot |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv) |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt** |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish** |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete** |
| `registered_by` | Int | ❌ | null | INTEGER | **Kim yaratdi** |
| `modified_by` | Int | ❌ | null | INTEGER | **Kim o'zgartirdi** |

### 2.3 Enum Tuzilishi (Reference: `klinika_prisma.txt`)

#### PaymentType Enum
```prisma
enum PaymentType {
  INCOME   // ✅ Kirim (Mijozdan to'lov)
  OUTCOME  // 💸 Chiqim (Xarajatlar)
}
```

| Type | Tavsif | Misol |
|------|--------|-------|
| `INCOME` | Klinikaga kelib tushadigan mablag'lar | Mijoz to'lovi, oldindan to'lov (Reference: `Klinika.md` 3.5) |
| `OUTCOME` | Klinikadan chiqadigan mablag'lar | Xodim maoshi, kommunal to'lovlar, ijaralar |

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

#### Payment Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([client_id])` | client_id | Mijoz bo'yicha filter qilishni tezlashtirish |
| `@@index([user_id])` | user_id | Foydalanuvchi bo'yicha filter qilishni tezlashtirish |
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([payment_type])` | payment_type | To'lov turi bo'yicha filter qilishni tezlashtirish |
| `@@index([payment_date])` | payment_date | Sana bo'yicha filter/sort qilish (hisobotlar uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([client_id, payment_date])` | client_id, payment_date | Qo'shma index - mijoz va sana bo'yicha |
| `@@index([payment_type, payment_date])` | payment_type, payment_date | Qo'shma index - to'lov turi va sana bo'yicha (hisobotlar uchun) |
| `@@index([payment_date, deleted_at])` | payment_date, deleted_at | Qo'shma index - sana va soft delete |

#### ClientPaid Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([client_id])` | client_id | Mijoz bo'yicha filter qilishni tezlashtirish |
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([payment_date])` | payment_date | Sana bo'yicha filter qilishni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([client_id, payment_date])` | client_id, payment_date | Qo'shma index - mijoz va sana bo'yicha |
| `@@index([visit_id, payment_date])` | visit_id, payment_date | Qo'shma index - visit va sana bo'yicha |

#### OtherPaid Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([group_id])` | group_id | Guruh bo'yicha filter qilishni tezlashtirish |
| `@@index([type])` | type | To'lov turi bo'yicha filter qilishni tezlashtirish |
| `@@index([payment_date])` | payment_date | Sana bo'yicha filter qilishni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([type, payment_date])` | type, payment_date | Qo'shma index - to'lov turi va sana bo'yicha |

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_payment_client` | Client | N:1 | SetNull | Cascade | Mijoz o'chirilganda payment.client_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_payment_user` | User | N:1 | SetNull | Cascade | User o'chirilganda payment.user_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_payment_visit` | Visit | N:1 | SetNull | Cascade | Visit o'chirilganda payment.visit_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_payment_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_payment_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_client_paid_client` | Client | N:1 | SetNull | Cascade | Mijoz o'chirilganda clientPaid.client_id NULL ga o'zgaradi |
| `fk_client_paid_visit` | Visit | N:1 | SetNull | Cascade | Visit o'chirilganda clientPaid.visit_id NULL ga o'zgaradi |
| `fk_other_paid_group` | OtherPaidGroup | N:1 | SetNull | Cascade | Guruh o'chirilganda otherPaid.group_id NULL ga o'zgaradi |
| `fk_other_paid_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi |
| `fk_other_paid_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi |

### 2.6 Cascade Rules Tushunchasi

```
Payment o'chirilganda (Soft Delete/Refund):
┌─────────────────────────────────────────────────┐
│ 1. Payment.deleted_at = NOW()                  │
│ 2. Visit miqdorlari qayta hisoblanadi          │
│ 3. Client balance qayta hisoblanadi            │
│ 4. Moliyaviy tarix saqlanib qoladi             │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Moliyaviy 
tarix saqlanib qoladi, faqat deleted_at set bo'ladi.
(Reference: Klinika.md 8.1)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/payments` | ✅ JWT | Admin, Receptionist, Accountant | Yangi payment yaratish |
| 2 | GET | `/api/v1/payments` | ✅ JWT | Barchasi | Paymentlar ro'yxatini olish |
| 3 | GET | `/api/v1/payments/:id` | ✅ JWT | Barchasi | Bitta payment ma'lumotlari |
| 4 | DELETE | `/api/v1/payments/:id` | ✅ JWT | Admin, Accountant | Payment refund (soft delete) |
| 5 | POST | `/api/v1/client-paid` | ✅ JWT | Admin, Receptionist, Accountant | ClientPaid yaratish |
| 6 | GET | `/api/v1/client-paid` | ✅ JWT | Barchasi | ClientPaid ro'yxatini olish |
| 7 | POST | `/api/v1/other-paid` | ✅ JWT | Admin, Accountant | OtherPaid yaratish |
| 8 | GET | `/api/v1/other-paid` | ✅ JWT | Admin, Accountant | OtherPaid ro'yxatini olish |
| 9 | POST | `/api/v1/other-paid-groups` | ✅ JWT | Admin, Accountant | OtherPaidGroup yaratish |
| 10 | GET | `/api/v1/other-paid-groups` | ✅ JWT | Admin, Accountant | OtherPaidGroup ro'yxatini olish |
| 11 | GET | `/api/v1/payments/summary` | ✅ JWT | Admin, Accountant | Moliyaviy hisobot (summary) |

---

### 3.2 POST /api/v1/payments

**Tavsif:** Yangi payment yaratish (Admin, Receptionist, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreatePaymentDto {
  client_id: number;      // Mavjud Client ID
  visit_id?: number;      // Mavjud Visit ID (optional)
  amount: number;         // To'lov summasi (musbat)
  payment_type?: string;  // INCOME/OUTCOME (default: INCOME)
  payment_date?: Date;    // To'lov sanasi (default: now)
  description?: string;   // To'lov tavsifi
}
```

**Request Body Example:**
```json
{
  "client_id": 1,
  "visit_id": 1,
  "amount": 250000,
  "payment_type": "INCOME",
  "payment_date": "2024-01-15T12:00:00.000Z",
  "description": "Naqd to'lov"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "To'lov muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "client": { "id": 1, "full_name": "John Doe", "balance": 0 },
    "visit": { "id": 1, "total_amount": 250000, "paid_amount": 250000, "debt_amount": 0 },
    "amount": 250000,
    "payment_type": "INCOME",
    "payment_date": "2024-01-15T12:00:00.000Z",
    "description": "Naqd to'lov",
    "created_at": "2024-01-15T12:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// payment.service.ts
async create(createPaymentDto: CreatePaymentDto, userId: number): Promise<Payment> {
  // 1. Client mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id: createPaymentDto.client_id }
  });

  if (!client || client.deleted_at) {
    throw new NotFoundException('PAY_001');
  }

  // 2. Visit mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createPaymentDto.visit_id) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: createPaymentDto.visit_id }
    });

    if (!visit || visit.deleted_at) {
      throw new NotFoundException('PAY_002');
    }

    // 3. Visit client_id bilan Payment client_id mosligini tekshirish
    if (visit.client_id !== createPaymentDto.client_id) {
      throw new BadRequestException('PAY_003');
    }

    // 4. To'lov summasi visit debt_amount dan oshmasligi kerak (INCOME uchun)
    if (createPaymentDto.payment_type === 'INCOME') {
      if (createPaymentDto.amount > visit.debt_amount) {
        throw new BadRequestException('PAY_004');
      }
    }
  }

  // 5. Amount validatsiya (musbat son)
  if (createPaymentDto.amount <= 0) {
    throw new BadRequestException('PAY_005');
  }

  // 6. Payment yaratish
  const payment = await this.prisma.payment.create({
     {
      client_id: createPaymentDto.client_id,
      visit_id: createPaymentDto.visit_id,
      user_id: userId,
      amount: createPaymentDto.amount,
      payment_type: createPaymentDto.payment_type || 'INCOME',
      payment_date: createPaymentDto.payment_date || new Date(),
      description: createPaymentDto.description,
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      client: { select: { id: true, full_name: true, balance: true } },
      visit: { select: { id: true, total_amount: true, paid_amount: true, debt_amount: true } }
    }
  });

  // 7. Agar visit_id bo'lsa, Visit miqdorlarini yangilash
  if (createPaymentDto.visit_id && createPaymentDto.payment_type === 'INCOME') {
    await this.updateVisitAmounts(createPaymentDto.visit_id);
  }

  // 8. Client balance ni yangilash
  await this.updateClientBalance(createPaymentDto.client_id);

  return payment;
}

// Visit miqdorlarini yangilash
private async updateVisitAmounts(visitId: number): Promise<void> {
  // Barcha Payment yozuvlarini yig'ish
  const payments = await this.prisma.payment.aggregate({
    where: { visit_id: visitId, deleted_at: null, payment_type: 'INCOME' },
    _sum: { amount: true }
  });

  // Barcha VisitService yozuvlarini yig'ish
  const services = await this.prisma.visitService.aggregate({
    where: { visit_id: visitId, deleted_at: null },
    _sum: { total: true }
  });

  const total_amount = services._sum.total || 0;
  const paid_amount = payments._sum.amount || 0;
  const debt_amount = total_amount - paid_amount;

  // Visit yangilash
  await this.prisma.visit.update({
    where: { id: visitId },
     {
      total_amount,
      paid_amount,
      debt_amount,
      updated_at: new Date()
    }
  });

  // Agar to'liq to'langan bo'lsa, Visit status DONE ga o'zgartirish
  if (debt_amount <= 0) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId }
    });

    if (visit && visit.status === 'COMPLETED') {
      await this.prisma.visit.update({
        where: { id: visitId },
         {
          status: 'DONE',
          updated_at: new Date()
        }
      });
    }
  }
}

// Client balance ni yangilash
private async updateClientBalance(clientId: number): Promise<void> {
  // Barcha visitlarning debt_amount yig'indisi
  const visits = await this.prisma.visit.aggregate({
    where: { client_id: clientId, deleted_at: null },
    _sum: { debt_amount: true }
  });

  // Barcha ClientPaid yozuvlarining amount yig'indisi
  const clientPaid = await this.prisma.clientPaid.aggregate({
    where: { client_id: clientId, deleted_at: null },
    _sum: { amount: true }
  });

  // Barcha Payment (INCOME) yozuvlarining amount yig'indisi
  const payments = await this.prisma.payment.aggregate({
    where: { client_id: clientId, deleted_at: null, payment_type: 'INCOME' },
    _sum: { amount: true }
  });

  const totalDebt = visits._sum.debt_amount || 0;
  const totalPrepaid = clientPaid._sum.amount || 0;
  const totalPaid = payments._sum.amount || 0;
  const balance = (totalPrepaid + totalPaid) - totalDebt;

  // Client yangilash
  await this.prisma.client.update({
    where: { id: clientId },
     {
      balance,
      updated_at: new Date()
    }
  });
}
```

---

### 3.3 GET /api/v1/payments

**Tavsif:** Paymentlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `client_id` | number | - | Mijoz bo'yicha filter |
| `visit_id` | number | - | Visit bo'yicha filter |
| `payment_type` | PaymentType | - | To'lov turi bo'yicha filter (INCOME/OUTCOME) |
| `date_from` | date | - | Sana oralig'i (boshlanishi) |
| `date_to` | date | - | Sana oralig'i (tugashi) |
| `sortBy` | string | payment_date | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/payments?page=1&limit=20&client_id=1&payment_type=INCOME&date_from=2024-01-01&date_to=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client": { "id": 1, "full_name": "John Doe" },
      "visit": { "id": 1, "total_amount": 250000 },
      "amount": 250000,
      "payment_type": "INCOME",
      "payment_date": "2024-01-15T12:00:00.000Z",
      "description": "Naqd to'lov"
    },
    {
      "id": 2,
      "client": { "id": 2, "full_name": "Jane Smith" },
      "visit": null,
      "amount": 100000,
      "payment_type": "INCOME",
      "payment_date": "2024-01-16T10:00:00.000Z",
      "description": "Oldindan to'lov"
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
async findAll(query: GetPaymentsQuery): Promise<PaginatedResult<Payment>> {
  const where: any = { deleted_at: null };

  // Client filter
  if (query.client_id) {
    where.client_id = query.client_id;
  }

  // Visit filter
  if (query.visit_id) {
    where.visit_id = query.visit_id;
  }

  // Payment type filter
  if (query.payment_type) {
    where.payment_type = query.payment_type;
  }

  // Date range filter
  if (query.date_from || query.date_to) {
    where.payment_date = {
      gte: query.date_from ? new Date(query.date_from) : undefined,
      lt: query.date_to ? new Date(new Date(query.date_to).setHours(23, 59, 59, 999)) : undefined
    };
  }

  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);

  // Sorting
  const orderBy = {
    [query.sortBy || 'payment_date']: query.sortOrder || 'desc'
  };

  const [data, total] = await Promise.all([
    this.prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        client: { select: { id: true, full_name: true, phone: true } },
        visit: { select: { id: true, total_amount: true, paid_amount: true, debt_amount: true } },
        user: { select: { id: true, full_name: true } }
      }
    }),
    this.prisma.payment.count({ where })
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

### 3.4 DELETE /api/v1/payments/:id (Refund)

**Tavsif:** Payment refund qilish (soft delete) (Admin, Accountant)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "To'lov muvaffaqiyatli bekor qilindi",
  "data": {
    "id": 1,
    "amount": 250000,
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async refund(paymentId: number, userId: number): Promise<Payment> {
  // 1. Payment mavjudligini tekshirish
  const payment = await this.prisma.payment.findUnique({
    where: { id: paymentId }
  });

  if (!payment || payment.deleted_at) {
    throw new NotFoundException('PAY_007');
  }

  // 2. Faqat Admin yoki Accountant refund qilish huquqiga ega
  // (Role check middleware orqali amalga oshiriladi)

  // 3. Agar visit_id bo'lsa, Visit miqdorlarini qayta hisoblash
  if (payment.visit_id && payment.payment_type === 'INCOME') {
    await this.updateVisitAmounts(payment.visit_id);
  }

  // 4. Client balance ni qayta hisoblash
  if (payment.client_id) {
    await this.updateClientBalance(payment.client_id);
  }

  // 5. Soft Delete
  const refunded = await this.prisma.payment.update({
    where: { id: paymentId },
     {
      deleted_at: new Date(),
      modified_by: userId,
      updated_at: new Date()
    }
  });

  return refunded;
}
```

---

### 3.5 POST /api/v1/client-paid

**Tavsif:** ClientPaid yaratish (Admin, Receptionist, Accountant)

**Request Body:**
```json
{
  "client_id": 1,
  "visit_id": null,
  "amount": 100000,
  "payment_date": "2024-01-15T10:00:00.000Z",
  "description": "Oldindan to'lov"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Oldindan to'lov muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "client": { "id": 1, "full_name": "John Doe", "balance": 100000 },
    "amount": 100000,
    "payment_date": "2024-01-15T10:00:00.000Z",
    "description": "Oldindan to'lov"
  }
}
```

---

### 3.6 POST /api/v1/other-paid

**Tavsif:** OtherPaid yaratish (Admin, Accountant)

**Request Body:**
```json
{
  "group_id": 1,
  "type": "OUTCOME",
  "amount": 500000,
  "payment_date": "2024-01-15T10:00:00.000Z",
  "description": "Xodim maoshi"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Boshqa to'lov muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "group": { "id": 1, "name": "Maoshlar" },
    "type": "OUTCOME",
    "amount": 500000,
    "payment_date": "2024-01-15T10:00:00.000Z",
    "description": "Xodim maoshi"
  }
}
```

---

### 3.7 GET /api/v1/payments/summary

**Tavsif:** Moliyaviy hisobot (summary) (Admin, Accountant)

**Query Params:**
```
GET /api/v1/payments/summary?date_from=2024-01-01&date_to=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "income": {
      "total": 5000000,
      "count": 50
    },
    "outcome": {
      "total": 2000000,
      "count": 20
    },
    "balance": 3000000,
    "by_type": {
      "payment": { "income": 4000000, "outcome": 0 },
      "client_paid": { "income": 1000000, "outcome": 0 },
      "other_paid": { "income": 0, "outcome": 2000000 }
    }
  }
}
```

**Service Layer Implementation:**
```typescript
async getSummary(dateFrom: Date, dateTo: Date): Promise<PaymentSummary> {
  const where = {
    deleted_at: null,
    payment_date: {
      gte: dateFrom,
      lt: new Date(dateTo.setHours(23, 59, 59, 999))
    }
  };

  // Payment income/outcome
  const paymentIncome = await this.prisma.payment.aggregate({
    where: { ...where, payment_type: 'INCOME' },
    _sum: { amount: true },
    _count: { id: true }
  });

  const paymentOutcome = await this.prisma.payment.aggregate({
    where: { ...where, payment_type: 'OUTCOME' },
    _sum: { amount: true },
    _count: { id: true }
  });

  // ClientPaid income
  const clientPaidIncome = await this.prisma.clientPaid.aggregate({
    where: { deleted_at: null, payment_date: where.payment_date },
    _sum: { amount: true },
    _count: { id: true }
  });

  // OtherPaid income/outcome
  const otherPaidIncome = await this.prisma.otherPaid.aggregate({
    where: { ...where, type: 'INCOME' },
    _sum: { amount: true },
    _count: { id: true }
  });

  const otherPaidOutcome = await this.prisma.otherPaid.aggregate({
    where: { ...where, type: 'OUTCOME' },
    _sum: { amount: true },
    _count: { id: true }
  });

  const totalIncome = 
    (paymentIncome._sum.amount || 0) + 
    (clientPaidIncome._sum.amount || 0) + 
    (otherPaidIncome._sum.amount || 0);

  const totalOutcome = 
    (paymentOutcome._sum.amount || 0) + 
    (otherPaidOutcome._sum.amount || 0);

  return {
    period: {
      from: dateFrom,
      to: dateTo
    },
    income: {
      total: totalIncome,
      count: 
        (paymentIncome._count.id || 0) + 
        (clientPaidIncome._count.id || 0) + 
        (otherPaidIncome._count.id || 0)
    },
    outcome: {
      total: totalOutcome,
      count: 
        (paymentOutcome._count.id || 0) + 
        (otherPaidOutcome._count.id || 0)
    },
    balance: totalIncome - totalOutcome,
    by_type: {
      payment: {
        income: paymentIncome._sum.amount || 0,
        outcome: paymentOutcome._sum.amount || 0
      },
      client_paid: {
        income: clientPaidIncome._sum.amount || 0,
        outcome: 0
      },
      other_paid: {
        income: otherPaidIncome._sum.amount || 0,
        outcome: otherPaidOutcome._sum.amount || 0
      }
    }
  };
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-payment.dto.ts
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  Min,
  IsString,
  MaxLength,
  IsDecimal
} from 'class-validator';

export enum PaymentTypeEnum {
  INCOME = 'INCOME',
  OUTCOME = 'OUTCOME'
}

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  client_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  visit_id?: number;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsEnum(PaymentTypeEnum)
  payment_type?: PaymentTypeEnum;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

// create-client-paid.dto.ts
export class CreateClientPaidDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  client_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  visit_id?: number;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

// create-other-paid.dto.ts
export class CreateOtherPaidDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  group_id?: number;

  @IsEnum(PaymentTypeEnum)
  @IsNotEmpty()
  type: PaymentTypeEnum;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `client_id` | Required | PAY_001 | Mijoz majburiy |
| `client_id` | Must Exist | PAY_001 | Mijoz topilmadi |
| `visit_id` | Must Exist | PAY_002 | Visit topilmadi |
| `visit_id` | client_id Match | PAY_003 | Mijoz va Visit mos kelmadi |
| `amount` | Required | PAY_005 | Summa majburiy |
| `amount` | Min 0.01 | PAY_005 | Summa musbat bo'lishi kerak |
| `amount` | <= debt_amount | PAY_004 | To'lov summasi qarzdan oshmasligi kerak |
| `payment_type` | Enum | PAY_009 | INCOME/OUTCOME |
| `payment_date` | IsDateString | PAY_010 | Noto'g'ri sana formati |
| `payment_date` | Max today | PAY_010 | Kelajak sana bo'lmasligi kerak |
| `group_id` | Must Exist | PAY_006 | To'lov guruhi topilmadi |
| `description` | MaxLength 255 | PAY_011 | Tavsif 255 belgidan oshmasin |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `PAY_001` | 404 Not Found | Mijoz topilmadi | Client ID not exists | Client ID ni tekshiring |
| `PAY_002` | 404 Not Found | Visit topilmadi | Visit ID not exists | Visit ID ni tekshiring |
| `PAY_003` | 400 Bad Request | Mijoz va Visit mos kelmadi | client_id mismatch | Client va Visit mosligini tekshiring |
| `PAY_004` | 400 Bad Request | To'lov summasi qarzdan oshiq | amount > debt_amount | Summa tekshirilsin |
| `PAY_005` | 400 Bad Request | Summa noto'g'ri | amount <= 0 | Musbat son kiriting |
| `PAY_006` | 404 Not Found | To'lov guruhi topilmadi | OtherPaidGroup ID not exists | Group ID ni tekshiring |
| `PAY_007` | 404 Not Found | To'lov topilmadi | Payment ID not exists | Payment ID ni tekshiring |
| `PAY_008` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `PAY_009` | 400 Bad Request | Payment type noto'g'ri | Validation failed | INCOME/OUTCOME |
| `PAY_010` | 400 Bad Request | Sana noto'g'ri | Date format yoki kelajak sana | Date format tekshirilsin |
| `PAY_011` | 400 Bad Request | Tavsif juda uzun | Validation failed | Max 255 belgi |

### 5.2 Exception Filter

```typescript
// payment-exception.filter.ts
@Catch()
export class PaymentExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof NotFoundException) return 'PAY_007';
    if (exception instanceof ForbiddenException) return 'PAY_008';
    if (exception instanceof BadRequestException) return 'PAY_005';
    return 'PAY_007';
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
| POST /payments | ✅ | ❌ | ❌ | ✅ | ✅ |
| GET /payments | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /payments/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| DELETE /payments/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /client-paid | ✅ | ❌ | ❌ | ✅ | ✅ |
| GET /client-paid | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /other-paid | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /other-paid | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /other-paid-groups | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /other-paid-groups | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /payments/summary | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Moliyaviy Xavfsizlik (Reference: `Klinika.md` 8.1, 9.2)
- ✅ Barcha summalar Decimal(15,2) formatda (Reference: `Klinika.md` 9.2)
- ✅ To'lov miqdori musbat bo'lishi kerak
- ✅ Client balance avtomatik yangilanadi
- ✅ Moliyaviy operatsiyalar audit qilinadi
- ✅ Refund faqat Admin/Accountant tomonidan amalga oshiriladi
- ✅ Payment type (INCOME/OUTCOME) validatsiya qilinadi
- ✅ Payment summasi visit debt_amount dan oshmasligi kerak

---

## 7. SEED DATA

### 7.1 OtherPaidGroup (Reference: `Klinika.md` 3.5)

```typescript
// seed/payment.seed.ts
export async function seedPayments(prisma: PrismaClient) {
  // OtherPaidGroup yaratish
  const groups = [
    { name: 'Maoshlar', description: 'Xodimlarga to''lanadigan maoshlar' },
    { name: 'Kommunal to''lovlar', description: 'Elektr, suv, gaz' },
    { name: 'Ijara', description: 'Bino ijarasi' },
    { name: 'Soliqlar', description: 'Davlat soliq to''lovlari' },
    { name: 'Boshqa', description: 'Boshqa xarajatlar' }
  ];

  for (const group of groups) {
    await prisma.otherPaidGroup.create({  group });
  }

  // Test Payment yaratish
  const payments = [
    {
      client_id: 1,
      visit_id: 1,
      amount: 250000,
      payment_type: 'INCOME' as const,
      description: 'Naqd to''lov',
      payment_date: new Date('2024-01-15T12:00:00Z')
    },
    {
      client_id: 2,
      visit_id: null,
      amount: 100000,
      payment_type: 'INCOME' as const,
      description: 'Oldindan to''lov',
      payment_date: new Date('2024-01-16T10:00:00Z')
    }
  ];

  for (const payment of payments) {
    await prisma.payment.create({  payment });
  }

  // Test ClientPaid yaratish
  const clientPaid = [
    {
      client_id: 1,
      visit_id: null,
      amount: 50000,
      description: 'Depozit',
      payment_date: new Date('2024-01-10T10:00:00Z')
    }
  ];

  for (const paid of clientPaid) {
    await prisma.clientPaid.create({  paid });
  }

  // Test OtherPaid yaratish
  const otherPaid = [
    {
      group_id: 1,
      type: 'OUTCOME' as const,
      amount: 500000,
      description: 'Yanvar oyi maoshi',
      payment_date: new Date('2024-01-31T10:00:00Z')
    },
    {
      group_id: 2,
      type: 'OUTCOME' as const,
      amount: 200000,
      description: 'Elektr energiyasi',
      payment_date: new Date('2024-01-25T10:00:00Z')
    }
  ];

  for (const paid of otherPaid) {
    await prisma.otherPaid.create({  paid });
  }

  console.log('✅ Payments seeded successfully');
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat to'lovlar
npm run seed:payments
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test to'lovlar o'chiriladi
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
// payment.service.spec.ts
describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService, PrismaService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new payment successfully', async () => {
      const dto: CreatePaymentDto = {
        client_id: 1,
        visit_id: 1,
        amount: 250000,
        payment_type: 'INCOME',
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, client_id: 1, debt_amount: 300000, deleted_at: null });
      prisma.payment.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.amount).toBe(250000);
      expect(prisma.payment.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if amount > debt_amount', async () => {
      const dto: CreatePaymentDto = {
        client_id: 1,
        visit_id: 1,
        amount: 500000,
        payment_type: 'INCOME',
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, client_id: 1, debt_amount: 300000, deleted_at: null });

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if amount <= 0', async () => {
      const dto: CreatePaymentDto = {
        client_id: 1,
        amount: 0,
        payment_type: 'INCOME',
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refund', () => {
    it('should refund payment successfully', async () => {
      prisma.payment.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null, visit_id: 1, client_id: 1, payment_type: 'INCOME' });
      prisma.payment.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.refund(1, 1);

      expect(result.deleted_at).toBeDefined();
    });
  });

  describe('getSummary', () => {
    it('should return payment summary', async () => {
      prisma.payment.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 5000000 }, _count: { id: 50 } });
      prisma.clientPaid.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 1000000 }, _count: { id: 10 } });
      prisma.otherPaid.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 2000000 }, _count: { id: 20 } });

      const result = await service.getSummary(new Date('2024-01-01'), new Date('2024-01-31'));

      expect(result.income.total).toBeGreaterThan(0);
      expect(result.balance).toBeDefined();
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_payment

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Enum
CREATE TYPE "PaymentType" AS ENUM ('INCOME', 'OUTCOME');

-- Create Payment Table
CREATE TABLE "payments" (
  "id" SERIAL PRIMARY KEY,
  "client_id" INTEGER,
  "user_id" INTEGER,
  "visit_id" INTEGER,
  "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "payment_type" "PaymentType" NOT NULL DEFAULT 'INCOME',
  "description" TEXT,
  "payment_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_payment_client" 
    FOREIGN KEY ("client_id") 
    REFERENCES "clients"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_payment_user" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_payment_visit" 
    FOREIGN KEY ("visit_id") 
    REFERENCES "visits"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create ClientPaid Table
CREATE TABLE "client_paid" (
  "id" SERIAL PRIMARY KEY,
  "client_id" INTEGER,
  "visit_id" INTEGER,
  "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "description" TEXT,
  "payment_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_client_paid_client" 
    FOREIGN KEY ("client_id") 
    REFERENCES "clients"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_paid_visit" 
    FOREIGN KEY ("visit_id") 
    REFERENCES "visits"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create OtherPaidGroup Table
CREATE TABLE "other_paid_groups" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "description" TEXT,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER
);

-- Create OtherPaid Table
CREATE TABLE "other_paid" (
  "id" SERIAL PRIMARY KEY,
  "group_id" INTEGER,
  "type" "PaymentType" NOT NULL,
  "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "description" TEXT,
  "payment_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_other_paid_group" 
    FOREIGN KEY ("group_id") 
    REFERENCES "other_paid_groups"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX "payments_visit_id_idx" ON "payments"("visit_id");
CREATE INDEX "payments_payment_type_idx" ON "payments"("payment_type");
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");
CREATE INDEX "payments_deleted_at_idx" ON "payments"("deleted_at");
CREATE INDEX "payments_client_id_payment_date_idx" ON "payments"("client_id", "payment_date");
CREATE INDEX "payments_payment_type_payment_date_idx" ON "payments"("payment_type", "payment_date");
CREATE INDEX "payments_payment_date_deleted_at_idx" ON "payments"("payment_date", "deleted_at");

CREATE INDEX "client_paid_client_id_idx" ON "client_paid"("client_id");
CREATE INDEX "client_paid_visit_id_idx" ON "client_paid"("visit_id");
CREATE INDEX "client_paid_payment_date_idx" ON "client_paid"("payment_date");
CREATE INDEX "client_paid_deleted_at_idx" ON "client_paid"("deleted_at");

CREATE INDEX "other_paid_groups_status_idx" ON "other_paid_groups"("status");
CREATE INDEX "other_paid_groups_name_idx" ON "other_paid_groups"("name");
CREATE INDEX "other_paid_groups_deleted_at_idx" ON "other_paid_groups"("deleted_at");

CREATE INDEX "other_paid_group_id_idx" ON "other_paid"("group_id");
CREATE INDEX "other_paid_type_idx" ON "other_paid"("type");
CREATE INDEX "other_paid_payment_date_idx" ON "other_paid"("payment_date");
CREATE INDEX "other_paid_deleted_at_idx" ON "other_paid"("deleted_at");
CREATE INDEX "other_paid_type_payment_date_idx" ON "other_paid"("type", "payment_date");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_payment"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "other_paid" CASCADE;
DROP TABLE IF EXISTS "other_paid_groups" CASCADE;
DROP TABLE IF EXISTS "client_paid" CASCADE;
DROP TABLE IF EXISTS "payments" CASCADE;
DROP TYPE IF EXISTS "PaymentType" CASCADE;
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
- [ ] Moliyaviy hisob-kitoblar tekshirildi

---

## 10. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 10.1 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
// Payment
@@index([client_id])              // Mijoz filter uchun
@@index([user_id])                // Foydalanuvchi filter uchun
@@index([visit_id])               // Visit filter uchun
@@index([payment_type])           // To'lov turi filter uchun
@@index([payment_date])           // Sana filter uchun (eng muhim)
@@index([deleted_at])             // Soft delete filter uchun
@@index([client_id, payment_date]) // Qo'shma index - mijoz va sana
@@index([payment_type, payment_date]) // Qo'shma index - to'lov turi va sana (hisobotlar uchun)
@@index([payment_date, deleted_at]) // Qo'shma index - sana va soft delete

// ClientPaid
@@index([client_id])              // Mijoz filter uchun
@@index([visit_id])               // Visit filter uchun
@@index([payment_date])           // Sana filter uchun
@@index([deleted_at])             // Soft delete filter uchun
@@index([client_id, payment_date]) // Qo'shma index
@@index([visit_id, payment_date])  // Qo'shma index

// OtherPaid
@@index([group_id])               // Guruh filter uchun
@@index([type])                   // To'lov turi filter uchun
@@index([payment_date])           // Sana filter uchun
@@index([deleted_at])             // Soft delete filter uchun
@@index([type, payment_date])     // Qo'shma index - to'lov turi va sana
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Payment List | Redis | 2 daqiqa | Payment create/delete |
| Payment Summary | Redis | 10 daqiqa | Payment create/delete |
| Client Balance | Redis | 1 daqiqa | Payment/ClientPaid create/delete |
| OtherPaid List | Redis | 5 daqiqa | OtherPaid create/delete |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const payments = await prisma.payment.findMany({
  select: { 
    id: true, 
    client_id: true, 
    amount: true,
    payment_type: true,
    payment_date: true
  },
  where: { 
    deleted_at: null, 
    payment_type: 'INCOME'
  },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const payments = await prisma.payment.findMany({
  where: { 
    client_id: 1,
    payment_date: {
      gte: new Date('2024-01-01'),
      lt: new Date('2024-01-31')
    },
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const payments = await prisma.payment.findMany();
```

### 10.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |
| Payment Processing Time | < 100ms |
| Summary Calculation Time | < 500ms |

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `14-payment-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Client RFC | `RFC-009-client-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| ServiceUser RFC | `RFC-015-service-user-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Payment yaratish mijoz bilan bog'lanishi
- [ ] Payment visitga bog'lanishi (optional)
- [ ] Payment type INCOME/OUTCOME qiymat qabul qilishi (Reference: `Klinika.md` 3.5)
- [ ] Payment summasi musbat bo'lishi
- [ ] Payment summasi visit debt_amount dan oshmasligi (INCOME uchun)
- [ ] ClientPaid yaratish mijoz bilan bog'lanishi
- [ ] ClientPaid visitga bog'lanishi (optional)
- [ ] OtherPaid yaratish guruh bilan bog'lanishi (optional)
- [ ] OtherPaid type INCOME/OUTCOME qiymat qabul qilishi
- [ ] OtherPaidGroup yaratish va boshqarish
- [ ] Visit miqdorlari avtomatik hisoblanadi (total/paid/debt)
- [ ] Client balance avtomatik yangilanadi
- [ ] To'liq to'langan visit DONE statusga o'tadi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin/Accountant refund qilish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Receptionist to'lov qabul qilish huquqiga ega
- [ ] Barcha rollar to'lov ro'yxatini ko'ra oladi
- [ ] Moliyaviy hisobot (summary) ishlaydi (Reference: `Klinika.md` 7.1)
- [ ] Pagination va filterlash ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq
- [ ] Concurrent users 50+ qo'llab-quvvatlanadi
- [ ] Data retention 5 yil
- [ ] Payment processing time < 100ms
- [ ] Summary calculation time < 500ms

---

## 13. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Payment amount > debt_amount | O'rta | Yuqori | Validation before payment creation |
| Client balance inconsistency | O'rta | Yuqori | Automatic balance update + audit trail |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Data privacy concerns | Past | Yuqori | Data encryption + access control (Reference: `Klinika.md` 8.1) |
| Refund abuse | O'rta | Yuqori | Role-based access control (Admin/Accountant only) |
| Duplicate payments | O'rta | O'rta | Unique constraint + validation |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Online payment integration (Payme, Click) | 🟡 Medium | Phase 4 |
| Payment installment plans | 🟢 Low | Phase 4 |
| Payment statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| Payment change history | 🟢 Low | Phase 4 |
| SMS/Email payment notifications | 🟢 Low | Phase 4 |
| Recurring payments | 🟢 Low | Phase 4 |
| Multi-currency support | 🟢 Low | Phase 4 |
| Payment reconciliation | 🟢 Low | Phase 4 |

---