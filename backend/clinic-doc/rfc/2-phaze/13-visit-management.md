# 📋 RFC-013: Qabul Jarayoni Boshqaruvi (Visit Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-013 |
| **Nomi** | Visit Management |
| **Phase** | 2A - Core Entities (Oxirgi) |
| **Model** | `Visit`, `VisitService`, `VisitRoom`, `VisitReferral` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Core Business) |
| **Bog'liq RFC** | RFC-002 (User), RFC-009 (Client), RFC-010 (Room), RFC-011 (Service), RFC-012 (Referral) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikaga kelgan mijozlarning qabul jarayonini (Visit) boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Visit (qabul) yaratish, xizmatlar qo'shish, xona ajratish, tavsiya biriktirish, to'lov jarayonini boshqarish va qabulni yakunlash. Har bir visit uchun moliyaviy hisob-kitobni avtomatlashtirish va tibbiy tarixni shakllantirish (Reference: `Klinika.md` 3.3, 4.1).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Visit yaratish (Create) | ❌ Tibbiy tarix (kelajakda) |
| ✅ Visit ro'yxatini olish (Read) | ❌ Tibbiy retseptlar (kelajakda) |
| ✅ Visit yangilash (Update) | ❌ Frontend implementatsiya |
| ✅ Visit status o'zgartirish | ❌ Third-party integratsiya |
| ✅ Visitga xizmat qo'shish | |
| ✅ Visitga xona ajratish | |
| ✅ Visitga tavsiya biriktirish | |
| ✅ Visit to'lov jarayoni | |
| ✅ Visit yakunlash | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.3, 4.1)
- Klinika asosiy biznes jarayonini raqamlashtirish (qabul boshqaruvi)
- Mijoz qabul jarayonini bosqichma-bosqich kuzatish
- Xizmatlar va to'lovlarni avtomatik hisoblash
- Xona bandligini real-time boshqarish
- Shifokor yuklamasini kuzatish
- Moliyaviy hisobotlar uchun asos yaratish
- Qarzdorlikni nazorat qilish (debt tracking)
- Tavsiya tizimi samaradorligini o'lchash

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

#### Visit Model
```prisma
model Visit {
  id           Int         @id @default(autoincrement())
  client_id    Int?        @map("client_id")
  doctor_id    Int?        @map("doctor_id")
  status       VisitStatus
  total_amount Decimal     @default(0) @db.Decimal(15, 2) @map("total_amount")
  paid_amount  Decimal     @default(0) @db.Decimal(15, 2) @map("paid_amount")
  debt_amount  Decimal     @default(0) @db.Decimal(15, 2) @map("debt_amount")
  description  String?     @db.Text
  visit_date   Timestamptz @default(now()) @map("visit_date")
  created_at   Timestamptz @default(now())
  updated_at   Timestamptz @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?       @map("registered_by")
  modified_by  Int?        @map("modified_by")

  // Relations
  client       Client?     @relation("fk_visit_client", fields: [client_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  doctor       User?       @relation("fk_visit_doctor", fields: [doctor_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?      @relation("fk_visit_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?       @relation("fk_visit_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  visit_referrals VisitReferral[] @relation("fk_visit_referral_visit")
  visit_rooms     VisitRoom[]     @relation("fk_visit_room_visit")
  visit_services  VisitService[]  @relation("fk_visit_service_visit")
  payments        Payment[]       @relation("fk_payment_visit")
  client_paid     ClientPaid[]    @relation("fk_client_paid_visit")

  @@index([client_id])
  @@index([doctor_id])
  @@index([status])
  @@index([visit_date])
  @@index([deleted_at])
  @@index([client_id, visit_date])
  @@index([doctor_id, visit_date])
  @@index([status, visit_date])
  @@index([visit_date, deleted_at])
  @@map("visits")
}
```

#### VisitService Model
```prisma
model VisitService {
  id           Int         @id @default(autoincrement())
  visit_id     Int?        @map("visit_id")
  service_id   Int?        @map("service_id")
  price        Decimal     @default(0) @db.Decimal(15, 2)
  quantity     Int         @default(1)
  total        Decimal     @default(0) @db.Decimal(15, 2)
  created_at   Timestamptz @default(now())
  updated_at   Timestamptz @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?       @map("registered_by")
  modified_by  Int?        @map("modified_by")

  // Relations
  service      Service?    @relation("fk_visit_service_service", fields: [service_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  visit        Visit?      @relation("fk_visit_service_visit", fields: [visit_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  register_user User?      @relation("fk_visit_service_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?       @relation("fk_visit_service_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([visit_id])
  @@index([service_id])
  @@index([deleted_at])
  @@index([visit_id, service_id])
  @@index([registered_by])
  @@index([modified_by])
  @@map("visit_services")
}
```

#### VisitRoom Model
```prisma
model VisitRoom {
  id           Int            @id @default(autoincrement())
  visit_id     Int?           @map("visit_id")
  room_id      Int?           @map("room_id")
  status       VisitRoomStatus
  started_at   Timestamptz?   @map("started_at")
  ended_at     Timestamptz?   @map("ended_at")
  created_at   Timestamptz    @default(now())
  updated_at   Timestamptz    @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?          @map("registered_by")
  modified_by  Int?           @map("modified_by")

  // Relations
  room         Room?          @relation("fk_visit_room_room", fields: [room_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  visit        Visit?         @relation("fk_visit_room_visit", fields: [visit_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  register_user User?         @relation("fk_visit_room_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?          @relation("fk_visit_room_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([visit_id])
  @@index([room_id])
  @@index([status])
  @@index([deleted_at])
  @@index([visit_id, status])
  @@index([registered_by])
  @@index([modified_by])
  @@map("visit_rooms")
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

#### Visit Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. VisitService, VisitRoom, VisitReferral, Payment jadvallari bilan bog'lanish uchun |
| `client_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Client jadvaliga bog'lanish. Qaysi mijoz qabulga kelganligini ko'rsatadi (Reference: `Klinika.md` 3.2) |
| `doctor_id` | Int | ✅ | - | INTEGER | **Foreign Key**. User jadvaliga bog'lanish (Doctor roli). Qaysi shifokor qabul qilganligini ko'rsatadi |
| `status` | Enum | ✅ | - | VisitStatus | **Visit holati**. SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, DONE. Visit jarayonini kuzatish uchun (Reference: `Klinika.md` 3.3) |
| `total_amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Jami summa**. Barcha xizmatlar yig'indisi. Moliyaviy hisob-kitob uchun muhim (Reference: `Klinika.md` 3.5, 9.2) |
| `paid_amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **To'langan summa**. Qancha to'lov amalga oshirilganligi |
| `debt_amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Qarz summasi**. total_amount - paid_amount. Qarzdorlikni nazorat qilish uchun (Reference: `Klinika.md` 3.5) |
| `description` | String | ❌ | null | TEXT | **Tavsif**. Shikoyat, diagnoz yoki qo'shimcha ma'lumot |
| `visit_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Qabul sanasi**. Qachon qabul amalga oshirilganligi. Hisobotlar uchun muhim |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade. Audit uchun |

#### VisitService Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator |
| `visit_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish. Qaysi visitga xizmat ko'rsatilganligi |
| `service_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Service jadvaliga bog'lanish. Qaysi xizmat ko'rsatilganligi |
| `price` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Xizmat narxi**. O'sha vaqtdagi xizmat narxi (Service.price o'zgarsa ham bu o'zgarmaydi) |
| `quantity` | Int | ✅ | 1 | INTEGER | **Miqdor**. Xizmat necha marta ko'rsatilganligi |
| `total` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Jami**. price × quantity. Avtomatik hisoblanadi |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Audit uchun |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish** |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete** |
| `registered_by` | Int | ❌ | null | INTEGER | **Kim yaratdi**. Audit uchun |
| `modified_by` | Int | ❌ | null | INTEGER | **Kim o'zgartirdi**. Audit uchun |

#### VisitRoom Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator |
| `visit_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish |
| `room_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Room jadvaliga bog'lanish. Qaysi xona ishlatilganligi |
| `status` | Enum | ✅ | - | VisitRoomStatus | **Xona holati**. ASSIGNED, IN_USE, COMPLETED (Reference: `Klinika.md` 3.6) |
| `started_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Boshlanish vaqti**. Xona qachon ishlatila boshlanganligi |
| `ended_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Tugash vaqti**. Xona qachon bo'shatilganligi |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt** |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish** |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete** |
| `registered_by` | Int | ❌ | null | INTEGER | **Kim yaratdi** |
| `modified_by` | Int | ❌ | null | INTEGER | **Kim o'zgartirdi** |

#### VisitReferral Model
| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator |
| `visit_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish |
| `referral_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Referral jadvaliga bog'lanish. Kim tavsiya qilganligi |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt** |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish** |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete** |
| `registered_by` | Int | ❌ | null | INTEGER | **Kim yaratdi** |
| `modified_by` | Int | ❌ | null | INTEGER | **Kim o'zgartirdi** |

### 2.3 Enum Tuzilishi (Reference: `klinika_prisma.txt`)

#### VisitStatus Enum
```prisma
enum VisitStatus {
  SCHEDULED      // 📅 Rejalashtirilgan
  IN_PROGRESS    // ⏳ Jarayonda
  COMPLETED      // ✅ Yakunlangan
  CANCELLED      // ❌ Bekor qilingan
  NO_SHOW        // 🚫 Kelmadi
  DONE           // 🏁 To'liq yakunlangan (to'lov bilan)
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `SCHEDULED` | Qabul rejalashtirilgan | Receptionist visit yaratganda. Kelajak sana uchun (Reference: `Klinika.md` 3.3) |
| `IN_PROGRESS` | Qabul jarayonda | Doctor bemorni ko'rayotganda. Xizmatlar qo'shilayotganda |
| `COMPLETED` | Qabul yakunlangan | Doctor xizmatlarni qo'shib, visitni yakunlaganda. To'lov hali bo'lmagan |
| `CANCELLED` | Qabul bekor qilingan | Mijoz kelmaydigan bo'lsa yoki boshqa sabab |
| `NO_SHOW` | Mijoz kelmadi | Rejalashtirilgan vaqtda mijoz kelmasa |
| `DONE` | To'liq yakunlangan | To'lov to'liq amalga oshirilganda (debt_amount = 0) (Reference: `Klinika.md` 4.1) |

#### VisitRoomStatus Enum
```prisma
enum VisitRoomStatus {
  ASSIGNED     // 🏷️ Xona ajratildi
  IN_USE       // 🔑 Xona ishlatilmoqda
  COMPLETED    // ✅ Xona bo'shatildi
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `ASSIGNED` | Xona ajratildi | Receptionist xonani visitga biriktirganda |
| `IN_USE` | Xona ishlatilmoqda | Doctor bemorni qabul qilayotganda |
| `COMPLETED` | Xona bo'shatildi | Qabul tugaganda, xona AVAILABLE ga qaytadi (Reference: `Klinika.md` 3.6) |

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

#### Visit Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([client_id])` | client_id | Mijoz bo'yicha filter qilishni tezlashtirish |
| `@@index([doctor_id])` | doctor_id | Shifokor bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish |
| `@@index([visit_date])` | visit_date | Sana bo'yicha filter/sort qilish (hisobotlar uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([client_id, visit_date])` | client_id, visit_date | Qo'shma index - mijoz va sana bo'yicha (mijoz tarixi uchun) |
| `@@index([doctor_id, visit_date])` | doctor_id, visit_date | Qo'shma index - shifokor va sana bo'yicha (shifokor yuklamasi uchun) |
| `@@index([status, visit_date])` | status, visit_date | Qo'shma index - status va sana bo'yicha (faqat aktiv visitlar) |
| `@@index([visit_date, deleted_at])` | visit_date, deleted_at | Qo'shma index - sana va soft delete |

#### VisitService Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([service_id])` | service_id | Service bo'yicha filter qilishni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([visit_id, service_id])` | visit_id, service_id | Qo'shma index - visit va service bo'yicha |
| `@@index([registered_by])` | registered_by | Audit uchun |
| `@@index([modified_by])` | modified_by | Audit uchun |

#### VisitRoom Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([room_id])` | room_id | Room bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([visit_id, status])` | visit_id, status | Qo'shma index - visit va status bo'yicha |
| `@@index([registered_by])` | registered_by | Audit uchun |
| `@@index([modified_by])` | modified_by | Audit uchun |

#### VisitReferral Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([referral_id])` | referral_id | Referral bo'yicha filter qilishni tezlashtirish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([registered_by])` | registered_by | Audit uchun |
| `@@index([modified_by])` | modified_by | Audit uchun |
| `@@unique([visit_id, referral_id])` | visit_id, referral_id | Bir visitga bir tavsiya (duplicate oldini olish) |

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_visit_client` | Client | N:1 | SetNull | Cascade | Mijoz o'chirilganda visit.client_id NULL ga o'zgaradi. Visit tarixi saqlanadi |
| `fk_visit_doctor` | User | N:1 | SetNull | Cascade | Doctor o'chirilganda visit.doctor_id NULL ga o'zgaradi. Visit tarixi saqlanadi |
| `fk_visit_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_visit_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_visit_service_service` | Service | N:1 | Cascade | Cascade | Service o'chirilganda VisitService yozuvlari o'chiriladi |
| `fk_visit_service_visit` | Visit | N:1 | Cascade | Cascade | Visit o'chirilganda VisitService yozuvlari o'chiriladi |
| `fk_visit_room_room` | Room | N:1 | Cascade | Cascade | Room o'chirilganda VisitRoom yozuvlari o'chiriladi |
| `fk_visit_room_visit` | Visit | N:1 | Cascade | Cascade | Visit o'chirilganda VisitRoom yozuvlari o'chiriladi |
| `fk_visit_referral_referral` | Referral | N:1 | Cascade | Cascade | Referral o'chirilganda VisitReferral yozuvlari o'chiriladi |
| `fk_visit_referral_visit` | Visit | N:1 | Cascade | Cascade | Visit o'chirilganda VisitReferral yozuvlari o'chiriladi |
| `fk_payment_visit` | Payment | N:1 | SetNull | Cascade | Visit o'chirilganda Payment.client_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_client_paid_visit` | ClientPaid | N:1 | SetNull | Cascade | Visit o'chirilganda ClientPaid.visit_id NULL ga o'zgaradi |

### 2.6 Cascade Rules Tushunchasi

```
Visit o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Visit.status = 'CANCELLED'                  │
│ 2. Visit.deleted_at = NOW()                    │
│ 3. VisitService yozuvlari Cascade delete       │
│ 4. VisitRoom yozuvlari Cascade delete          │
│ 5. VisitReferral yozuvlari Cascade delete      │
│ 6. Payment yozuvlari saqlanadi (SetNull)       │
│ 7. ClientPaid yozuvlari saqlanadi (SetNull)    │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Moliyaviy va 
tibbiy tarix saqlanib qoladi, faqat status o'zgaradi.
(Reference: Klinika.md 8.1)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/visits` | ✅ JWT | Admin, Doctor, Receptionist | Yangi visit yaratish |
| 2 | GET | `/api/v1/visits` | ✅ JWT | Barchasi | Visitlar ro'yxatini olish |
| 3 | GET | `/api/v1/visits/:id` | ✅ JWT | Barchasi | Bitta visit ma'lumotlari |
| 4 | PUT | `/api/v1/visits/:id` | ✅ JWT | Admin, Doctor, Receptionist | Visit yangilash |
| 5 | PATCH | `/api/v1/visits/:id/status` | ✅ JWT | Admin, Doctor, Receptionist | Visit status o'zgartirish |
| 6 | POST | `/api/v1/visits/:visitId/services` | ✅ JWT | Admin, Doctor | Visitga xizmat qo'shish |
| 7 | POST | `/api/v1/visits/:visitId/rooms` | ✅ JWT | Admin, Receptionist | Visitga xona ajratish |
| 8 | POST | `/api/v1/visits/:visitId/referrals` | ✅ JWT | Admin, Receptionist | Visitga tavsiya biriktirish |
| 9 | PUT | `/api/v1/visits/:visitId/complete` | ✅ JWT | Admin, Doctor | Visit yakunlash |
| 10 | POST | `/api/v1/visits/:visitId/payments` | ✅ JWT | Admin, Receptionist, Accountant | Visit to'lov yaratish |
| 11 | DELETE | `/api/v1/visits/:visitId` | ✅ JWT | Admin | Visit bekor qilish (soft delete) |
| 12 | GET | `/api/v1/visits/:visitId/services` | ✅ JWT | Barchasi | Visit xizmatlarini olish |
| 13 | GET | `/api/v1/visits/:visitId/rooms` | ✅ JWT | Barchasi | Visit xonalarini olish |
| 14 | GET | `/api/v1/visits/:visitId/payments` | ✅ JWT | Barchasi | Visit to'lovlarini olish |

---

### 3.2 POST /api/v1/visits

**Tavsif:** Yangi visit yaratish (Admin, Doctor, Receptionist)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateVisitDto {
  client_id: number;      // Mavjud Client ID
  doctor_id?: number;     // Mavjud User ID (Doctor)
  visit_date?: Date;      // Qabul sanasi (default: now)
  description?: string;   // Shikoyat/tavsif
  status?: VisitStatus;   // Default: SCHEDULED
}
```

**Request Body Example:**
```json
{
  "client_id": 1,
  "doctor_id": 2,
  "visit_date": "2024-01-15T10:00:00.000Z",
  "description": "Bosh og'rig'i, harorat",
  "status": "SCHEDULED"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Visit muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "client": { "id": 1, "full_name": "John Doe", "phone": "+998901234567" },
    "doctor": { "id": 2, "full_name": "Dr. Smith" },
    "status": "SCHEDULED",
    "total_amount": 0,
    "paid_amount": 0,
    "debt_amount": 0,
    "visit_date": "2024-01-15T10:00:00.000Z",
    "description": "Bosh og'rig'i, harorat",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// visit.service.ts
async create(createVisitDto: CreateVisitDto, userId: number): Promise<Visit> {
  // 1. Client mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id: createVisitDto.client_id }
  });

  if (!client || client.deleted_at) {
    throw new NotFoundException('VISIT_001');
  }

  // 2. Doctor mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createVisitDto.doctor_id) {
    const doctor = await this.prisma.user.findUnique({
      where: { id: createVisitDto.doctor_id },
      include: { role: true }
    });

    if (!doctor || doctor.deleted_at || doctor.role?.name !== 'Doctor') {
      throw new NotFoundException('VISIT_002');
    }
  }

  // 3. Visit yaratish
  const visit = await this.prisma.visit.create({
     {
      client_id: createVisitDto.client_id,
      doctor_id: createVisitDto.doctor_id,
      status: createVisitDto.status || 'SCHEDULED',
      visit_date: createVisitDto.visit_date || new Date(),
      description: createVisitDto.description,
      total_amount: 0,
      paid_amount: 0,
      debt_amount: 0,
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      client: { select: { id: true, full_name: true, phone: true } },
      doctor: { select: { id: true, full_name: true } }
    }
  });

  return visit;
}
```

---

### 3.3 GET /api/v1/visits

**Tavsif:** Visitlar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `client_id` | number | - | Mijoz bo'yicha filter |
| `doctor_id` | number | - | Shifokor bo'yicha filter |
| `status` | VisitStatus | - | Status bo'yicha filter |
| `visit_date` | date | - | Sana bo'yicha filter (YYYY-MM-DD) |
| `date_from` | date | - | Sana oralig'i (boshlanishi) |
| `date_to` | date | - | Sana oralig'i (tugashi) |
| `sortBy` | string | visit_date | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/visits?page=1&limit=20&client_id=1&status=SCHEDULED&visit_date=2024-01-15&sortBy=visit_date&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client": { "id": 1, "full_name": "John Doe" },
      "doctor": { "id": 2, "full_name": "Dr. Smith" },
      "status": "SCHEDULED",
      "total_amount": 250000,
      "paid_amount": 250000,
      "debt_amount": 0,
      "visit_date": "2024-01-15T10:00:00.000Z",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visit_services": 3, "payments": 1 }
    },
    {
      "id": 2,
      "client": { "id": 2, "full_name": "Jane Smith" },
      "doctor": { "id": 3, "full_name": "Dr. Johnson" },
      "status": "IN_PROGRESS",
      "total_amount": 150000,
      "paid_amount": 0,
      "debt_amount": 150000,
      "visit_date": "2024-01-15T11:00:00.000Z",
      "created_at": "2024-01-15T11:00:00.000Z",
      "_count": { "visit_services": 2, "payments": 0 }
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
async findAll(query: GetVisitsQuery): Promise<PaginatedResult<Visit>> {
  const where: any = { deleted_at: null };

  // Client filter
  if (query.client_id) {
    where.client_id = query.client_id;
  }

  // Doctor filter
  if (query.doctor_id) {
    where.doctor_id = query.doctor_id;
  }

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  // Date filter
  if (query.visit_date) {
    const date = new Date(query.visit_date);
    where.visit_date = {
      gte: new Date(date.setHours(0, 0, 0, 0)),
      lt: new Date(date.setHours(23, 59, 59, 999))
    };
  }

  // Date range filter
  if (query.date_from || query.date_to) {
    where.visit_date = {
      ...where.visit_date,
      gte: query.date_from ? new Date(query.date_from) : undefined,
      lt: query.date_to ? new Date(new Date(query.date_to).setHours(23, 59, 59, 999)) : undefined
    };
  }

  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);

  // Sorting
  const orderBy = {
    [query.sortBy || 'visit_date']: query.sortOrder || 'desc'
  };

  const [data, total] = await Promise.all([
    this.prisma.visit.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        client: { select: { id: true, full_name: true, phone: true } },
        doctor: { select: { id: true, full_name: true } },
        _count: {
          select: { 
            visit_services: { where: { deleted_at: null } },
            payments: { where: { deleted_at: null } }
          }
        }
      }
    }),
    this.prisma.visit.count({ where })
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

### 3.4 POST /api/v1/visits/:visitId/services

**Tavsif:** Visitga xizmat qo'shish (Admin, Doctor)

**Request Body:**
```json
{
  "service_id": 1,
  "quantity": 1,
  "price": 100000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Xizmat muvaffaqiyatli qo'shildi",
  "data": {
    "id": 1,
    "visit_id": 1,
    "service": { "id": 1, "name": "Terapevt ko'rigi" },
    "price": 100000,
    "quantity": 1,
    "total": 100000
  }
}
```

**Service Layer Implementation:**
```typescript
async addService(visitId: number, addVisitServiceDto: AddVisitServiceDto, userId: number): Promise<VisitService> {
  // 1. Visit mavjudligini tekshirish
  const visit = await this.prisma.visit.findUnique({
    where: { id: visitId }
  });

  if (!visit || visit.deleted_at) {
    throw new NotFoundException('VISIT_003');
  }

  // 2. Visit status tekshirish (faqat SCHEDULED yoki IN_PROGRESS)
  if (!['SCHEDULED', 'IN_PROGRESS'].includes(visit.status)) {
    throw new BadRequestException('VISIT_004');
  }

  // 3. Service mavjudligini tekshirish
  const service = await this.prisma.service.findUnique({
    where: { id: addVisitServiceDto.service_id }
  });

  if (!service || service.deleted_at) {
    throw new NotFoundException('VISIT_005');
  }

  // 4. VisitService yaratish
  const quantity = addVisitServiceDto.quantity || 1;
  const price = addVisitServiceDto.price || service.price;
  const total = price * quantity;

  const visitService = await this.prisma.visitService.create({
     {
      visit_id: visitId,
      service_id: addVisitServiceDto.service_id,
      price: price,
      quantity: quantity,
      total: total,
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      service: { select: { id: true, name: true } }
    }
  });

  // 5. Visit total_amount yangilash
  await this.recalculateVisitAmounts(visitId);

  return visitService;
}

// Visit miqdorlarini qayta hisoblash
private async recalculateVisitAmounts(visitId: number): Promise<void> {
  // Barcha VisitService yozuvlarini yig'ish
  const services = await this.prisma.visitService.aggregate({
    where: { visit_id: visitId, deleted_at: null },
    _sum: { total: true }
  });

  // Barcha Payment yozuvlarini yig'ish
  const payments = await this.prisma.payment.aggregate({
    where: { visit_id: visitId, deleted_at: null },
    _sum: { amount: true }
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
}
```

---

### 3.5 PUT /api/v1/visits/:visitId/complete

**Tavsif:** Visit yakunlash (Admin, Doctor)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Visit muvaffaqiyatli yakunlandi",
  "data": {
    "id": 1,
    "status": "COMPLETED",
    "total_amount": 250000,
    "paid_amount": 0,
    "debt_amount": 250000,
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async complete(visitId: number, userId: number): Promise<Visit> {
  // 1. Visit mavjudligini tekshirish
  const visit = await this.prisma.visit.findUnique({
    where: { id: visitId }
  });

  if (!visit || visit.deleted_at) {
    throw new NotFoundException('VISIT_003');
  }

  // 2. Status tekshirish
  if (visit.status === 'COMPLETED' || visit.status === 'DONE') {
    throw new BadRequestException('VISIT_007');
  }

  // 3. Visit miqdorlarini qayta hisoblash
  await this.recalculateVisitAmounts(visitId);

  // 4. Visit status COMPLETED ga o'zgartirish
  const updatedVisit = await this.prisma.visit.update({
    where: { id: visitId },
     {
      status: 'COMPLETED',
      updated_at: new Date(),
      modified_by: userId
    },
    include: {
      client: { select: { id: true, full_name: true } },
      doctor: { select: { id: true, full_name: true } }
    }
  });

  // 5. VisitRoom status COMPLETED ga o'zgartirish va Room bo'shatish
  await this.prisma.visitRoom.updateMany({
    where: { visit_id: visitId, deleted_at: null },
     {
      status: 'COMPLETED',
      ended_at: new Date(),
      updated_at: new Date()
    }
  });

  // 6. Room status AVAILABLE ga qaytarish
  await this.prisma.room.updateMany({
    where: {
      id: {
        in: (await this.prisma.visitRoom.findMany({
          where: { visit_id: visitId },
          select: { room_id: true }
        })).map(r => r.room_id)
      }
    },
     {
      status: 'AVAILABLE',
      updated_at: new Date()
    }
  });

  return updatedVisit;
}
```

---

### 3.6 POST /api/v1/visits/:visitId/payments

**Tavsif:** Visit to'lov yaratish (Admin, Receptionist, Accountant)

**Request Body:**
```json
{
  "amount": 250000,
  "payment_type": "INCOME",
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
    "visit_id": 1,
    "amount": 250000,
    "payment_type": "INCOME",
    "payment_date": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async createPayment(visitId: number, createVisitPaymentDto: CreateVisitPaymentDto, userId: number): Promise<Payment> {
  // 1. Visit mavjudligini tekshirish
  const visit = await this.prisma.visit.findUnique({
    where: { id: visitId }
  });

  if (!visit || visit.deleted_at) {
    throw new NotFoundException('VISIT_003');
  }

  // 2. To'lov summasi tekshiruvi (debt_amount dan oshmasligi kerak)
  if (createVisitPaymentDto.amount > visit.debt_amount) {
    throw new BadRequestException('VISIT_009');
  }

  // 3. To'lov yaratish
  const payment = await this.prisma.payment.create({
     {
      visit_id: visitId,
      client_id: visit.client_id,
      user_id: userId,
      amount: createVisitPaymentDto.amount,
      payment_type: createVisitPaymentDto.payment_type || 'INCOME',
      description: createVisitPaymentDto.description,
      payment_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      visit: { select: { id: true, total_amount: true } }
    }
  });

  // 4. Visit miqdorlarini qayta hisoblash
  await this.recalculateVisitAmounts(visitId);

  // 5. Client balance yangilash
  await this.updateClientBalance(visit.client_id);

  // 6. Agar to'liq to'langan bo'lsa, Visit status DONE ga o'zgartirish
  const updatedVisit = await this.prisma.visit.findUnique({
    where: { id: visitId }
  });

  if (updatedVisit.debt_amount <= 0 && updatedVisit.status === 'COMPLETED') {
    await this.prisma.visit.update({
      where: { id: visitId },
       {
        status: 'DONE',
        updated_at: new Date()
      }
    });
  }

  return payment;
}

// Client balance yangilash
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

  const totalDebt = visits._sum.debt_amount || 0;
  const totalPrepaid = clientPaid._sum.amount || 0;
  const balance = totalPrepaid - totalDebt;

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

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-visit.dto.ts
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  Min,
  IsString,
  MaxLength
} from 'class-validator';

export enum VisitStatusEnum {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  DONE = 'DONE'
}

export class CreateVisitDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  client_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  doctor_id?: number;

  @IsOptional()
  @IsDateString()
  visit_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(VisitStatusEnum)
  status?: VisitStatusEnum;
}

// add-visit-service.dto.ts
export class AddVisitServiceDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  service_id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}

// create-visit-payment.dto.ts
export class CreateVisitPaymentDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsEnum(['INCOME', 'OUTCOME'])
  payment_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `client_id` | Required | VISIT_001 | Mijoz majburiy |
| `client_id` | Must Exist | VISIT_001 | Mijoz topilmadi |
| `doctor_id` | Must Exist | VISIT_002 | Shifokor topilmadi |
| `doctor_id` | Role Check | VISIT_002 | Foydalanuvchi Doctor roli emas |
| `visit_date` | IsDateString | VISIT_010 | Noto'g'ri sana formati |
| `status` | Enum | VISIT_011 | SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW/DONE |
| `service_id` | Required | VISIT_005 | Xizmat majburiy |
| `service_id` | Must Exist | VISIT_005 | Xizmat topilmadi |
| `quantity` | Min 1 | VISIT_012 | Miqdor kamida 1 bo'lishi kerak |
| `price` | Min 0 | VISIT_013 | Narx manfiy bo'lishi mumkin emas |
| `amount` (payment) | Required | VISIT_009 | To'lov summasi majburiy |
| `amount` (payment) | Min 1 | VISIT_009 | To'lov summasi musbat bo'lishi kerak |
| `amount` (payment) | <= debt_amount | VISIT_009 | To'lov summasi qarzdan oshmasligi kerak |
| `description` | MaxLength 1000 | VISIT_014 | Tavsif 1000 belgidan oshmasin |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `VISIT_001` | 404 Not Found | Mijoz topilmadi | Client ID not exists | Client ID ni tekshiring |
| `VISIT_002` | 404 Not Found | Shifokor topilmadi | Doctor ID not exists yoki role !== Doctor | Doctor ID ni tekshiring |
| `VISIT_003` | 404 Not Found | Visit topilmadi | Visit ID not exists yoki deleted | Visit ID ni tekshiring |
| `VISIT_004` | 400 Bad Request | Visit status xizmat qo'shishga ruxsat bermaydi | Status !== SCHEDULED/IN_PROGRESS | Visit status tekshirilsin |
| `VISIT_005` | 404 Not Found | Xizmat topilmadi | Service ID not exists | Service ID ni tekshiring |
| `VISIT_006` | 400 Bad Request | Bo'sh xona topilmadi | No AVAILABLE room | Boshqa vaqt tanlang |
| `VISIT_007` | 400 Bad Request | Visit allaqachon yakunlangan | Status === COMPLETED/DONE | Visit status tekshirilsin |
| `VISIT_008` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `VISIT_009` | 400 Bad Request | To'lov summasi noto'g'ri | Amount <= 0 yoki > debt_amount | Summa tekshirilsin |
| `VISIT_010` | 400 Bad Request | Visit date noto'g'ri | Date format yoki kelajak sana | Date format tekshirilsin |
| `VISIT_011` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | VisitStatus enum qiymatlari |
| `VISIT_012` | 400 Bad Request | Miqdor noto'g'ri | Quantity < 1 | Min 1 bo'lishi kerak |
| `VISIT_013` | 400 Bad Request | Narx noto'g'ri | Price < 0 | Musbat son kiriting |
| `VISIT_014` | 400 Bad Request | Tavsif juda uzun | Validation failed | Max 1000 belgi |

### 5.2 Exception Filter

```typescript
// visit-exception.filter.ts
@Catch()
export class VisitExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof NotFoundException) return 'VISIT_003';
    if (exception instanceof ForbiddenException) return 'VISIT_008';
    if (exception instanceof BadRequestException) return 'VISIT_009';
    return 'VISIT_003';
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
| POST /visits | ✅ | ✅ | ❌ | ✅ | ❌ |
| GET /visits | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /visits/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /visits/:id | ✅ | ✅ | ❌ | ✅ | ❌ |
| PATCH /visits/:id/status | ✅ | ✅ | ❌ | ✅ | ❌ |
| POST /visits/:id/services | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /visits/:id/rooms | ✅ | ❌ | ❌ | ✅ | ❌ |
| POST /visits/:id/referrals | ✅ | ❌ | ❌ | ✅ | ❌ |
| PUT /visits/:id/complete | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /visits/:id/payments | ✅ | ❌ | ❌ | ✅ | ✅ |
| DELETE /visits/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /visits/:id/services | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /visits/:id/rooms | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /visits/:id/payments | ✅ | ✅ | ✅ | ✅ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Moliyaviy Xavfsizlik (Reference: `Klinika.md` 8.1, 9.2)
- ✅ Barcha summalar Decimal(15,2) formatda
- ✅ To'lov miqdori visit debt_amount dan oshmasligi kerak
- ✅ Client balance avtomatik yangilanadi
- ✅ Moliyaviy operatsiyalar audit qilinadi
- ✅ Visit miqdorlari avtomatik hisoblanadi (total/paid/debt)

---

## 7. SEED DATA

### 7.1 Test Visitlar

```typescript
// seed/visit.seed.ts
export async function seedVisits(prisma: PrismaClient) {
  // Test visit yaratish
  const visits = [
    {
      client_id: 1,
      doctor_id: 2,
      status: 'COMPLETED',
      total_amount: 250000,
      paid_amount: 250000,
      debt_amount: 0,
      description: 'Bosh og''rig''i, harorat',
      visit_date: new Date('2024-01-15T10:00:00Z')
    },
    {
      client_id: 2,
      doctor_id: 3,
      status: 'SCHEDULED',
      total_amount: 0,
      paid_amount: 0,
      debt_amount: 0,
      description: 'Rejalashtirilgan ko''rik',
      visit_date: new Date('2024-01-20T14:00:00Z')
    },
    {
      client_id: 3,
      doctor_id: 2,
      status: 'IN_PROGRESS',
      total_amount: 150000,
      paid_amount: 0,
      debt_amount: 150000,
      description: 'Tish og''rig''i',
      visit_date: new Date('2024-01-15T11:00:00Z')
    }
  ];

  for (const visit of visits) {
    await prisma.visit.create({  visit });
  }

  console.log(`✅ Visits seeded successfully (${visits.length} visits)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat visitlar
npm run seed:visits
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test visitlar o'chiriladi
- [ ] Visit ma'lumotlari konfidensialligi ta'minlanadi
- [ ] Backup qilish rejasi tayyor
- [ ] Moliyaviy ma'lumotlar tekshiriladi

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
// visit.service.spec.ts
describe('VisitService', () => {
  let service: VisitService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitService, PrismaService],
    }).compile();

    service = module.get<VisitService>(VisitService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new visit successfully', async () => {
      const dto: CreateVisitDto = {
        client_id: 1,
        doctor_id: 2,
        status: 'SCHEDULED',
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, role: { name: 'Doctor' }, deleted_at: null });
      prisma.visit.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.client_id).toBe(1);
      expect(prisma.visit.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if client not found', async () => {
      const dto: CreateVisitDto = {
        client_id: 999,
        doctor_id: 2,
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.create(dto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addService', () => {
    it('should add service to visit successfully', async () => {
      const dto: AddVisitServiceDto = {
        service_id: 1,
        quantity: 1,
        price: 100000,
      };

      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, status: 'SCHEDULED', deleted_at: null });
      prisma.service.findUnique = jest.fn().mockResolvedValue({ id: 1, price: 100000, deleted_at: null });
      prisma.visitService.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.addService(1, dto, 1);

      expect(result.service_id).toBe(1);
    });

    it('should throw BadRequestException if visit status is COMPLETED', async () => {
      const dto: AddVisitServiceDto = {
        service_id: 1,
        quantity: 1,
      };

      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, status: 'COMPLETED', deleted_at: null });

      await expect(service.addService(1, dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('complete', () => {
    it('should complete visit successfully', async () => {
      prisma.visit.findUnique = jest.fn().mockResolvedValue({ id: 1, status: 'IN_PROGRESS', deleted_at: null });
      prisma.visit.update = jest.fn().mockResolvedValue({ id: 1, status: 'COMPLETED' });
      prisma.visitRoom.updateMany = jest.fn().mockResolvedValue({ count: 1 });
      prisma.room.updateMany = jest.fn().mockResolvedValue({ count: 1 });

      const result = await service.complete(1, 1);

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('recalculateVisitAmounts', () => {
    it('should recalculate visit amounts correctly', async () => {
      prisma.visitService.aggregate = jest.fn().mockResolvedValue({ _sum: { total: 250000 } });
      prisma.payment.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 100000 } });
      prisma.visit.update = jest.fn().mockResolvedValue({ id: 1 });

      await service['recalculateVisitAmounts'](1);

      expect(prisma.visit.update).toHaveBeenCalledWith({
        where: { id: 1 },
         {
          total_amount: 250000,
          paid_amount: 100000,
          debt_amount: 150000,
          updated_at: expect.any(Date)
        }
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
npx prisma migrate dev --name create_visit

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Enum
CREATE TYPE "VisitStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DONE');
CREATE TYPE "VisitRoomStatus" AS ENUM ('ASSIGNED', 'IN_USE', 'COMPLETED');

-- Create Visit Table
CREATE TABLE "visits" (
  "id" SERIAL PRIMARY KEY,
  "client_id" INTEGER,
  "doctor_id" INTEGER,
  "status" "VisitStatus" NOT NULL,
  "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "debt_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "description" TEXT,
  "visit_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_visit_client" 
    FOREIGN KEY ("client_id") 
    REFERENCES "clients"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_doctor" 
    FOREIGN KEY ("doctor_id") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create VisitService Table
CREATE TABLE "visit_services" (
  "id" SERIAL PRIMARY KEY,
  "visit_id" INTEGER,
  "service_id" INTEGER,
  "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "total" DECIMAL(15,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_visit_service_service" 
    FOREIGN KEY ("service_id") 
    REFERENCES "services"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_service_visit" 
    FOREIGN KEY ("visit_id") 
    REFERENCES "visits"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
);

-- Create VisitRoom Table
CREATE TABLE "visit_rooms" (
  "id" SERIAL PRIMARY KEY,
  "visit_id" INTEGER,
  "room_id" INTEGER,
  "status" "VisitRoomStatus" NOT NULL,
  "started_at" TIMESTAMPTZ,
  "ended_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_visit_room_room" 
    FOREIGN KEY ("room_id") 
    REFERENCES "rooms"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_visit_room_visit" 
    FOREIGN KEY ("visit_id") 
    REFERENCES "visits"("id") 
    ON DELETE CASCADE 
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
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "visits_client_id_idx" ON "visits"("client_id");
CREATE INDEX "visits_doctor_id_idx" ON "visits"("doctor_id");
CREATE INDEX "visits_status_idx" ON "visits"("status");
CREATE INDEX "visits_visit_date_idx" ON "visits"("visit_date");
CREATE INDEX "visits_deleted_at_idx" ON "visits"("deleted_at");
CREATE INDEX "visits_client_id_visit_date_idx" ON "visits"("client_id", "visit_date");
CREATE INDEX "visits_doctor_id_visit_date_idx" ON "visits"("doctor_id", "visit_date");
CREATE INDEX "visits_status_visit_date_idx" ON "visits"("status", "visit_date");
CREATE INDEX "visits_visit_date_deleted_at_idx" ON "visits"("visit_date", "deleted_at");

CREATE INDEX "visit_services_visit_id_idx" ON "visit_services"("visit_id");
CREATE INDEX "visit_services_service_id_idx" ON "visit_services"("service_id");
CREATE INDEX "visit_services_deleted_at_idx" ON "visit_services"("deleted_at");
CREATE INDEX "visit_services_visit_id_service_id_idx" ON "visit_services"("visit_id", "service_id");

CREATE INDEX "visit_rooms_visit_id_idx" ON "visit_rooms"("visit_id");
CREATE INDEX "visit_rooms_room_id_idx" ON "visit_rooms"("room_id");
CREATE INDEX "visit_rooms_status_idx" ON "visit_rooms"("status");
CREATE INDEX "visit_rooms_deleted_at_idx" ON "visit_rooms"("deleted_at");
CREATE INDEX "visit_rooms_visit_id_status_idx" ON "visit_rooms"("visit_id", "status");

CREATE INDEX "visit_referrals_visit_id_idx" ON "visit_referrals"("visit_id");
CREATE INDEX "visit_referrals_referral_id_idx" ON "visit_referrals"("referral_id");
CREATE INDEX "visit_referrals_deleted_at_idx" ON "visit_referrals"("deleted_at");
CREATE UNIQUE INDEX "visit_referrals_visit_id_referral_id_idx" ON "visit_referrals"("visit_id", "referral_id");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_visit"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "visit_referrals" CASCADE;
DROP TABLE IF EXISTS "visit_rooms" CASCADE;
DROP TABLE IF EXISTS "visit_services" CASCADE;
DROP TABLE IF EXISTS "visits" CASCADE;
DROP TYPE IF EXISTS "VisitStatus" CASCADE;
DROP TYPE IF EXISTS "VisitRoomStatus" CASCADE;
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
// Visit
@@index([client_id])              // Mijoz filter uchun
@@index([doctor_id])              // Shifokor filter uchun
@@index([status])                 // Status filter uchun
@@index([visit_date])             // Sana filter uchun (eng muhim)
@@index([deleted_at])             // Soft delete filter uchun
@@index([client_id, visit_date])  // Qo'shma index - mijoz tarixi uchun
@@index([doctor_id, visit_date])  // Qo'shma index - shifokor yuklamasi uchun
@@index([status, visit_date])     // Qo'shma index - aktiv visitlar uchun
@@index([visit_date, deleted_at]) // Qo'shma index - sana va soft delete

// VisitService
@@index([visit_id])               // Visit filter uchun
@@index([service_id])             // Service filter uchun
@@index([deleted_at])             // Soft delete filter uchun
@@index([visit_id, service_id])   // Qo'shma index

// VisitRoom
@@index([visit_id])               // Visit filter uchun
@@index([room_id])                // Room filter uchun
@@index([status])                 // Status filter uchun
@@index([deleted_at])             // Soft delete filter uchun
@@index([visit_id, status])       // Qo'shma index

// VisitReferral
@@index([visit_id])               // Visit filter uchun
@@index([referral_id])            // Referral filter uchun
@@index([deleted_at])             // Soft delete filter uchun
@@unique([visit_id, referral_id]) // Unique constraint - bir visitga bir tavsiya
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Visit List | Redis | 2 daqiqa | Visit create/update/delete |
| Single Visit | Redis | 1 daqiqa | Visit update/delete |
| Visit Services | Redis | 2 daqiqa | VisitService create/update/delete |
| Visit Payments | Redis | 2 daqiqa | Payment create/update |
| Visit Statistics | Redis | 5 daqiqa | Visit create/update/delete |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const visits = await prisma.visit.findMany({
  select: { 
    id: true, 
    client_id: true, 
    doctor_id: true,
    status: true,
    total_amount: true,
    paid_amount: true,
    debt_amount: true,
    visit_date: true
  },
  where: { 
    deleted_at: null, 
    status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
  },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const visits = await prisma.visit.findMany({
  where: { 
    doctor_id: 1,
    visit_date: {
      gte: new Date('2024-01-01'),
      lt: new Date('2024-01-31')
    },
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const visits = await prisma.visit.findMany();
```

### 10.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |
| Visit Calculation Time | < 50ms |
| Payment Processing Time | < 100ms |

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `13-visit-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Client RFC | `RFC-009-client-management.md` | ✅ Tasdiqlandi |
| Room RFC | `RFC-010-room-management.md` | ✅ Tasdiqlandi |
| Service RFC | `RFC-011-service-management.md` | ✅ Tasdiqlandi |
| Referral RFC | `RFC-012-referral-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ⏳ Phase 2B |
| ClientPaid RFC | `RFC-015-client-paid-management.md` | ⏳ Phase 2B |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Visit yaratish mijoz va shifokor bilan bog'lanishi
- [ ] Visit status SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED/NO_SHOW/DONE qiymat qabul qilishi (Reference: `Klinika.md` 3.3)
- [ ] Visitga xizmat qo'shish ishlaydi
- [ ] Visitga xona ajratish ishlaydi
- [ ] Visitga tavsiya biriktirish ishlaydi
- [ ] Visit miqdorlari avtomatik hisoblanadi (total/paid/debt) (Reference: `Klinika.md` 3.5)
- [ ] Visit yakunlash Room statusni AVAILABLE ga qaytaradi (Reference: `Klinika.md` 3.6)
- [ ] To'lov yaratish Client balance ni yangilaydi
- [ ] To'liq to'langan visit DONE statusga o'tadi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin visit o'chirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Doctor visit yaratish/xizmat qo'shish/yakunlash huquqiga ega
- [ ] Receptionist visit yaratish/xona ajratish huquqiga ega
- [ ] Accountant to'lov yaratish huquqiga ega
- [ ] Pagination va filterlash ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi
- [ ] Status transition qoidalari ishlaydi (SCHEDULED → IN_PROGRESS → COMPLETED → DONE)

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq
- [ ] Concurrent users 50+ qo'llab-quvvatlanadi
- [ ] Data retention 5 yil
- [ ] Visit calculation time < 50ms
- [ ] Payment processing time < 100ms

---

## 13. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Visit miqdorlari noto'g'ri hisoblanishi | O'rta | Yuqori | Automatic recalculation + validation |
| Payment > debt_amount | O'rta | Yuqori | Validation before payment creation |
| Cascade delete muammolari | O'rta | O'rta | Cascade delete + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Status transition xatolari | O'rta | O'rta | Status transition matrix + validation |
| Client balance inconsistency | O'rta | Yuqori | Automatic balance update + audit trail |
| Room status inconsistency | O'rta | O'rta | Automatic room status update on visit complete |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Data privacy concerns | Past | Yuqori | Data encryption + access control (Reference: `Klinika.md` 8.1) |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Medical history/records | 🟡 Medium | Phase 3 |
| Prescription management | 🟡 Medium | Phase 3 |
| Visit notes/comments | 🟢 Low | Phase 3 |
| Visit statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Appointment reminders (SMS/Telegram) | 🟢 Low | Phase 4 |
| Online booking integration | 🟢 Low | Phase 4 |
| Visit change history | 🟢 Low | Phase 4 |
| Multi-doctor visit support | 🟢 Low | Phase 4 |
| Visit templates | 🟢 Low | Phase 4 |
| Recurring visits | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

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
**Reference Documents:** `klinika_prisma.txt`, `Klinika.md` (Sections 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2)

---