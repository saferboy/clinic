# Yakuniy Texnik Hujjat

**Versiya:** 1.0 Final

**Yaratilgan Sana:** 2024

**Status:** ✅ Production Ready

**Texnologiya:** NestJS + Prisma ORM + PostgreSQL

---

## 📋 MUNDAARIJA

1. [Loyiha Pasporti](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
2. [Texnik Arxitektura](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
3. [Database Schema Tahlili](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
4. [Biznes Jarayonlar](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
5. [API Arxitekturasi](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
6. [Xavfsizlik Tizimi](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
7. [RBAC va Permissions](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
8. [Hisobotlar va Analitika](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
9. [Development Phases](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
10. [Deployment va Infrastructure](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
11. [Kamchiliklar va Yutuqlar](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)
12. [Keyingi Qadamlar](https://www.notion.so/Klinikani-Boshqarish-Tizimi-CRM-ERP-3170e83d6b148002a192ea6566e7755e?pvs=21)

---

## 1. LOYIHA PASPORTI

### 1.1 Loyiha Maqsadi

```
Xususiy klinikalar uchun to'liq avtomatlashtirilgan boshqaruv tizimi:
├── CRM (Customer Relationship Management)
│   └── Mijozlar bazasi, bemor tarixi, aloqa ma'lumotlari
├── ERP (Enterprise Resource Planning)
│   └── Xizmatlar, to'lovlar, shifokorlar, xonalar boshqaruvi
├── Moliya
│   └── Kirim-chiqim hisobi, qarzdorlik nazorati
└── Hisobot
    └── Statistika, analitika, moliyaviy hisobotlar
```

### 1.2 Asosiy Ko'rsatkichlar

| Ko'rsatkich | Qiymat | Izoh |
| --- | --- | --- |
| **Jadval Soni** | 20 ta | Asosiy business entities |
| **Enum Tiplari** | 8 ta | Status va tip boshqaruvi |
| **Audit Maydonlari** | 5 ta | registered_by, modified_by, created_at, updated_at, deleted_at |
| **Foreign Keys** | 50+ | Barcha bog'lanishlar indexed |
| **Unique Constraints** | 15+ | Ma'lumot integriteti |

### 1.3 Texnologik Stack

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                       │
│              (React/Vue/Angular - Alohida)              │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API (JSON)
┌───────────────────────▼─────────────────────────────────┐
│                    BACKEND LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   NestJS    │  │  Prisma ORM │  │  Class-Validator│ │
│  │   (v10.x)   │  │   (v5.x)    │  │   (DTO Validation)│ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   DATABASE LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ PostgreSQL  │  │   PgBouncer │  │    Backup       │ │
│  │   (v15.x)   │  │   (Pooling) │  │    (Daily)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 2. TEXNIK ARXITEKTURA

### 2.1 Arxitektura Naqshi

```
┌────────────────────────────────────────────────────────────┐
│                    MONOLITIC ARCHITECTURE                  │
│              (Microservice-ga o'tish mumkin)               │
└────────────────────────────────────────────────────────────┘

Module Structure:
├── Auth Module (Authentication & Authorization)
├── User Module (User Management)
├── Client Module (CRM)
├── Visit Module (Qabul Boshqaruvi)
├── Service Module (Xizmatlar)
├── Payment Module (Moliya)
├── Department Module (Bo'limlar)
├── Room Module (Xonalar)
├── Report Module (Hisobotlar)
└── Notification Module (Bildirishnomalar)
```

### 2.2 Loyiha Tuzilishi

```
klinika-backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── client/
│   │   ├── visit/
│   │   ├── service/
│   │   ├── payment/
│   │   ├── department/
│   │   ├── room/
│   │   ├── report/
│   │   └── notification/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── utils/
├── test/
├── .env
├── .env.example
├── docker-compose.yml
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. DATABASE SCHEMA TAHLILI

### 3.1 Jadval Guruhlari

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE ENTITIES                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│  FOYDALANUVCHILAR  │    MIJOZLAR     │      MOLIYA           │
├─────────────────┼─────────────────┼─────────────────────────┤
│ • User          │ • Client        │ • Payment               │
│ • UserRole      │ • ClientGroup   │ • ClientPaid            │
│                 │ • Source        │ • OtherPaid             │
│                 │ • LocRegion     │ • OtherPaidGroup        │
│                 │ • LocDistrict   │                         │
├─────────────────┴─────────────────┴─────────────────────────┤
│                    XIZMATLAR VA QABUL                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│ • Service       │ • Visit         │ • VisitService          │
│ • Department    │ • VisitRoom     │ • VisitReferral         │
│ • Room          │ • Referral      │ • ServiceUser           │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### 3.2 Asosiy Model Tuzilmalari

### 3.2.1 User Model

```tsx
model User {
  id           Int          @id @default(autoincrement())
  role_id      Int?         @map("role_id")
  full_name    String       @db.VarChar(100)
  login        String       @db.VarChar(50)      @unique
  password     String       @db.VarChar(255)     // Hashed
  phone        String?      @db.VarChar(20)
  email        String?      @db.VarChar(100)     @unique
  description  String?      @db.Text
  status       RecordStatus @default(ACTIVE)
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?

  // Relations
  role         UserRole?    @relation("fk_user_role", ...)

  // Audit Relations (Modified)
  modified_clients      Client[]      @relation("fk_client_modified_by")
  modified_visits       Visit[]       @relation("fk_visit_modified_by")
  // ... 15+ audit relations

  // Audit Relations (Registered)
  registered_clients    Client[]      @relation("fk_client_registered_by")
  // ... 15+ audit relations

  // Business Relations
  doctor_visits         Visit[]       @relation("fk_visit_doctor")
  user_payments         Payment[]     @relation("fk_payment_user")
  service_users         ServiceUser[] @relation("fk_service_user_user")

  @@index([role_id])
  @@index([login])
  @@index([status])
  @@map("users")
}
```

### 3.2.2 Visit Model (Core Entity)

```
model Visit {
  id           Int         @id @default(autoincrement())
  client_id    Int?        @map("client_id")
  doctor_id    Int?        @map("doctor_id")
  status       VisitStatus // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, DONE
  total_amount Decimal     @default(0) @db.Decimal(15, 2)
  paid_amount  Decimal     @default(0) @db.Decimal(15, 2)
  debt_amount  Decimal     @default(0) @db.Decimal(15, 2)
  description  String?     @db.Text
  visit_date   Timestamptz @default(now())
  created_at   Timestamptz @default(now())
  updated_at   Timestamptz @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?       @map("registered_by")
  modified_by  Int?        @map("modified_by")

  // Relations
  client         Client?           @relation("fk_visit_client", ...)
  doctor         User?             @relation("fk_visit_doctor", ...)
  visit_referrals VisitReferral[]  @relation("fk_visit_referral_visit")
  visit_rooms    VisitRoom[]       @relation("fk_visit_room_visit")
  visit_services VisitService[]    @relation("fk_visit_service_visit")
  payments       Payment[]         @relation("fk_payment_visit")
  client_paid    ClientPaid[]      @relation("fk_client_paid_visit")

  @@index([client_id])
  @@index([doctor_id])
  @@index([status])
  @@index([visit_date])
  @@index([client_id, visit_date])
  @@index([doctor_id, visit_date])
  @@index([status, visit_date])
  @@map("visits")
}
```

### 3.3 Enum Tiplari

| Enum | Qiymatlar | Ishlatilishi |
| --- | --- | --- |
| **ClientGender** | MALE, FEMALE, OTHER | Client.jinsi |
| **PaymentType** | INCOME, OUTCOME | Payment, OtherPaid |
| **RoomStatus** | AVAILABLE, OCCUPIED, MAINTENANCE, CLOSED | Room.status |
| **ServiceUserType** | FIXED, PERCENT | ServiceUser.type |
| **VisitStatus** | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW, DONE | Visit.status |
| **VisitRoomStatus** | ASSIGNED, IN_USE, COMPLETED | VisitRoom.status |
| **RecordStatus** | ACTIVE, INACTIVE, ARCHIVED | Barcha asosiy jadvallar |

### 3.4 Indexatsiya Strategiyasi

```
✅ Single Column Indexes:
   - id (primary key - automatic)
   - status (filtering uchun)
   - created_at, deleted_at (sorting uchun)
   - phone, email (search uchun)
   - login (authentication uchun)

✅ Composite Indexes:
   - [client_id, visit_date] - Client visit history
   - [doctor_id, visit_date] - Doctor schedule
   - [status, visit_date] - Visit filtering
   - [service_id, user_id] - ServiceUser unique
   - [visit_id, referral_id] - VisitReferral unique
   - [payment_type, payment_date] - Financial reports
   - [client_id, payment_date] - Client payments

✅ Foreign Key Indexes:
   - Barcha _id maydonlari indexed
   - ON DELETE: SetNull (ko'p holatlarda)
   - ON DELETE: Cascade (VisitService, VisitRoom, VisitReferral)
```

### 3.5 Audit Trail Implementatsiyasi

```
Har bir jadvalda 5 ta audit maydoni mavjud:

┌─────────────────────────────────────────────────────────────┐
│                    AUDIT FIELDS                             │
├──────────────────┬──────────────────────────────────────────┤
│ registered_by    │ Kim yaratdi (User ID)                    │
│ modified_by      │ Kim o'zgartirdi (User ID)                │
│ created_at       │ Yaratilgan vaqt (Timestamptz)            │
│ updated_at       │ Oxirgi o'zgartirish (Timestamptz)        │
│ deleted_at       │ Soft delete vaqti (Timestamptz?)         │
└──────────────────┴──────────────────────────────────────────┘

Implementation:
├── Prisma middleware orqali automatic fill
├── registered_by: Create operatsiyasida
├── modified_by: Update operatsiyasida
├── deleted_at: Soft delete operatsiyasida
└── JWT token dan user_id olinadi
```

---

## 4. BIZNES JARAYONLAR

### 4.1 Mijoz Qabul Qilish Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIJOZ QABUL QILISH JARAYONI                   │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐      ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  1. CLI  │      │  2. CLI  │     │  3. VISIT│     │  4. VISIT│
  │  CREATE  │────▶│  SEARCH  │────▶│  CREATE  │────▶│  SERVICE │
  └──────────┘      └──────────┘     └──────────┘     └──────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
  Yangi mijoz     Mavjud mijoz    Qabul ochish    Xizmat qo'shish
  ro'yxatga olish topiladi       (SCHEDULED)     (VisitService)

  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  5. ROOM │     │  6. PAY  │     │  7. VISIT│     │  8. REPORT│
  │  ASSIGN  │────▶│  PROCESS │────▶│  COMPLETE│────▶│  GENERATE │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
  Xona ajratish    To'lov qilish    Visit status    Hisobot yaratish
  (VisitRoom)      (Payment)        COMPLETED       (Report Module)
```

### 4.2 Visit State Machine

```
                    ┌─────────────┐
                    │ SCHEDULED   │ ◄── Qabulga yozish
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ IN_PROGRESS │ ◄── Shifokor qabul qilmoqda
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ COMPLETED   │ ◄── Xizmatlar yakunlandi
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │CANCELLED│  │ NO_SHOW │  │  DONE   │
        └─────────┘  └─────────┘  └─────────┘
        Bekor qilish  Kelmadi     To'liq yakun

Status O'zgarish Qoidalari:
├── SCHEDULED → IN_PROGRESS (Doctor boshladi)
├── IN_PROGRESS → COMPLETED (Xizmat tugadi)
├── COMPLETED → DONE (To'lov to'liq)
├── SCHEDULED → CANCELLED (Bekor qilindi)
└── SCHEDULED → NO_SHOW (Mijoz kelmadi)
```

### 4.3 To'lov Jarayoni Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        TO'LOV JARAYONI                          │
└─────────────────────────────────────────────────────────────────┘

         ┌─────────────────────────────────────────────┐
         │          TO'LOV TURINI ANIQLASH             │
         └─────────────────────┬───────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌─────────────┐ ┌─────────────┐  ┌─────────────┐
       │             │ │  ~~QABULDA~~    │  │  ~~QARZGA~~     │
       │  TO'LOV     │ │  ~~TO'LOV~~     │  │  ~~TO'LOV~~     │
       └──────┬──────┘ └───────┬─────┘  └───────┬─────┘
              │                │                │
              ▼                ▼                ▼
       ClientPaid        ~~Payment          Payment~~
       jadvaliga         ~~jadvaliga        jadvaliga~~
       yoziladi          ~~yoziladi         yoziladi~~
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │  CLIENT BALANCE     │
                    │  YANGILANADI        │
                    └─────────────────────┘

Visit Moliyasi Formula:
├── total_amount = SUM(VisitService.total)
├── paid_amount = SUM(Payment.amount) + SUM(ClientPaid.amount)
└── debt_amount = total_amount - paid_amount
```

### 4.4 Shifokor Ish Oqimi

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHIFOKOR ISH JARAYONI                        │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐      ┌──────────┐     ┌──────────┐
  │  KUNLIK  │     │  MIJOZ   │      │  XIZMAT  │     │  YAKUN   │
  │  JADVAL  │────▶│  QABULI  │────▶│  KO'RSAT │────▶│  LASH    │
  └──────────┘     └──────────┘      └──────────┘     └──────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
  Visitlarni      Bemorni ko'rik   Xizmatlarni    Visit statusni
  ko'rish         dan o'tkazish    bajarish       COMPLETED qilish
  (doctor_id)     (IN_PROGRESS)    (VisitService)                  │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  STAVKA HISOB   │
                                                 │  (ServiceUser)  │
                                                 └─────────────────┘

Shifokor Stavka Hisobi:
├── FIXED: Har bir xizmat uchun fiksatsiya summa
│   └── Misol: 50,000 so'm har bir konsultatsiya
└── PERCENT: Xizmat narxidan foiz
    └── Misol: 30% xizmat narxidan
```

### 4.5 Referal (Tavsiya) Tizimi

```
┌─────────────────────────────────────────────────────────────────┐
│                      REFERAL TIZIMI                             │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │  REFERAL     │         │   VISIT      │         │   HISOBOT    │
  │  RO'YXATGA   │────────▶│   BILAN      │────────▶│   VA         │
  │  OLISH       │         │   BOG'LASH   │         │   STATISTIKA │
  └──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       ▼                        ▼                        ▼
  F.I.O + Telefon         VisitReferral            Qancha mijoz
  saqlanadi               jadvalida                keltirgani
  (Referral)              bog'lanadi               hisoblanadi
                          (visit_id, referral_id)

Referal Model:
├── id: Primary key
├── full_name: Referal ismi
├── phone: Telefon raqam
├── description: Izoh
├── status: ACTIVE/INACTIVE/ARCHIVED
└── Audit fields: registered_by, modified_by, created_at, updated_at, deleted_at
```

---

## 5. API ARXITEKTURASI

### 5.1 API Structure

```
Base URL: /api/v1

Authentication:
├── POST   /auth/login          - Login
├── POST   /auth/logout         - Logout
├── POST   /auth/refresh        - Refresh token
└── GET    /auth/me             - Current user info

Modules:
├── /users          - Foydalanuvchilar boshqaruvi
├── /clients        - Mijozlar CRM
├── /visits         - Qabul jarayoni
├── /services       - Xizmatlar
├── /payments       - To'lovlar
├── /departments    - Bo'limlar
├── /rooms          - Xonalar
├── /reports        - Hisobotlar
└── /notifications  - Bildirishnomalar
```

### 5.2 API Response Format

```tsx
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "timestamp": "2024-01-15T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "phone", "message": "Invalid phone format" }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 5.3 DTO Validation

```tsx
// CreateClientDto
export class CreateClientDto {
  @IsString()
  @MaxLength(100)
  full_name: string;

  @IsString()
  @Matches(/^\\+998[0-9]{9}$/, { message: 'Invalid phone format' })
  phone: string;

  @IsEnum(ClientGender)
  gender: ClientGender;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsInt()
  group_id?: number;

  @IsOptional()
  @IsInt()
  region_id?: number;

  @IsOptional()
  @IsInt()
  district_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  source_id?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### 5.4 API Endpoint Examples

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT MODULE                              │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/v1/clients           - Yangi mijoz yaratish         │
│ GET    /api/v1/clients           - Mijozlar ro'yxati (paginated)│
│ GET    /api/v1/clients/:id       - Mijoz ma'lumotlari           │
│ PATCH  /api/v1/clients/:id       - Mijoz ma'lumotlarini yangilash│
│ DELETE /api/v1/clients/:id       - Mijozni soft delete qilish   │
│ GET    /api/v1/clients/:id/visits- Mijoz visit history          │
│ GET    /api/v1/clients/:id/payments- Mijoz to'lov history       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      VISIT MODULE                               │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/v1/visits            - Yangi visit yaratish         │
│ GET    /api/v1/visits            - Visitlar ro'yxati            │
│ GET    /api/v1/visits/:id        - Visit ma'lumotlari           │
│ PATCH  /api/v1/visits/:id/status - Visit status o'zgartirish    │
│ POST   /api/v1/visits/:id/services- Xizmat qo'shish             │
│ POST   /api/v1/visits/:id/rooms  - Xona ajratish                │
│ POST   /api/v1/visits/:id/payments- To'lov qo'shish             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PAYMENT MODULE                             │
├─────────────────────────────────────────────────────────────────┤
│ POST   /api/v1/payments          - Yangi to'lov yaratish        │
│ GET    /api/v1/payments          - To'lovlar ro'yxati           │
│ GET    /api/v1/payments/:id      - To'lov ma'lumotlari          │
│ GET    /api/v1/payments/report   - Moliyaviy hisobot            │
│ POST   /api/v1/client-paid       - Oldindan to'lov              │
│ POST   /api/v1/other-paid        - Boshqa kirim/chiqim          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. XAVFSIZLIK TIZIMI

### 6.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT AUTHENTICATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  LOGIN   │     │  TOKEN   │     │   API    │     │  ACCESS  │
  │  REQUEST │────▶│  GENERATE│────▶│  REQUEST │────▶│  GRANTED │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
  login + password  Access Token    Bearer Token    Resource
  (HTTPS)           + Refresh Token (Authorization)  Access

Token Structure:
├── Access Token: 15 minutes expiry
├── Refresh Token: 7 days expiry
├── Payload: { user_id, role_id, permissions, iat, exp }
└── Storage: HTTP-only cookies yoki localStorage
```

### 6.2 Security Measures

| Chora-tadbir | Implementatsiya | Status |
| --- | --- | --- |
| **Password Hash** | bcrypt/argon2 (12 rounds) | ✅ |
| **JWT Authentication** | Access + Refresh token | ✅ |
| **RBAC** | Role-based permissions | ✅ |
| **Audit Log** | registered_by, modified_by | ✅ |
| **Soft Delete** | deleted_at maydoni | ✅ |
| **HTTPS** | TLS 1.3 | ✅ |
| **Rate Limiting** | 100 req/min per IP | ⚠️ TODO |
| **Input Validation** | class-validator DTO | ⚠️ TODO |
| **SQL Injection** | Prisma ORM (protected) | ✅ |
| **XSS Protection** | Response sanitization | ⚠️ TODO |
| **CORS** | Configured whitelist | ⚠️ TODO |
| **Helmet** | Security headers | ⚠️ TODO |

### 6.3 Password Policy

```
Minimum Requirements:
├── Length: 8+ characters
├── Uppercase: At least 1
├── Lowercase: At least 1
├── Number: At least 1
├── Special Character: At least 1
└── Password History: Last 5 passwords cannot be reused

Hash Algorithm:
├── Algorithm: bcrypt
├── Rounds: 12
└── Storage: VARCHAR(255)
```

---

## 7. RBAC VA PERMISSIONS

### 7.1 Rol Tuzilishi

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER ROLES                                 │
├──────────────┬──────────────────────────────────────────────────┤
│ Admin        │ To'liq huquq (barcha modullar)                   │
│ Doctor       │ Shifokor (qabul, xizmat, o'z visitlari)          │
│ Nurse        │ Hamshira (yordamchi funksiyalar)                 │
│ Receptionist │ Qabul xonasi (ro'yxatga olish, payment create)   │
│ Accountant   │ Buxgalter (moliya, hisobotlar)                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### 7.2 Permissions Matrix

| Modul | Admin | Doctor | Receptionist | Accountant | Nurse |
| --- | --- | --- | --- | --- | --- |
| **User Management** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Client CRUD** | ✅ Full | ✅ Read/Update | ✅ Full | ✅ Read | ✅ Read |
| **Visit Create** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Visit Complete** | ✅ | ✅ (o'z) | ❌ | ❌ | ❌ |
| **Payment Create** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Payment View** | ✅ | ✅ (o'z) | ✅ | ✅ | ❌ |
| **Reports** | ✅ Full | ✅ Limited | ✅ Limited | ✅ Full | ❌ |
| **Settings** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Service Management** | ✅ Full | ✅ Read | ❌ | ❌ | ❌ |
| **Room Management** | ✅ Full | ✅ Read | ✅ Assign | ❌ | ❌ |

### 7.3 Permissions JSON Structure

```json
{
  "client": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false
  },
  "visit": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false,
    "complete": true
  },
  "payment": {
    "create": false,
    "read": true,
    "update": false,
    "delete": false
  },
  "report": {
    "read": true,
    "export": false
  },
  "settings": {
    "read": false,
    "update": false
  }
}
```

### 7.4 Guard Implementation

```tsx
// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.name === role);
  }
}

// Permissions Guard
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every((perm) =>
      user.permissions?.[perm]?.create || user.permissions?.[perm]?.read
    );
  }
}
```

---

## 8. HISOBOTLAR VA ANALITIKA

### 8.1 Hisobot Turlari

| Hisobot | Tavsif | Davr | Mas'ul |
| --- | --- | --- | --- |
| **Kunlik Hisobot** | Kunlik kirim, visitlar soni | Kun | Admin, Accountant |
| **Oylik Hisobot** | Oylik moliyaviy natijalar | Oy | Admin, Accountant |
| **Shifokor Hisoboti** | Har bir shifokor ko'rsatkichi | Kun/Oy | Admin, Doctor |
| **Mijoz Hisoboti** | Mijozlar tashrifi va to'lovlari | Kun/Oy/Yil | Admin |
| **Xizmat Hisoboti** | Eng talabgir xizmatlar | Oy/Yil | Admin |
| **Qarzdorlik Hisoboti** | Qarzдор mijozlar ro'yxati | Kun | Admin, Accountant |
| **Xona Bandligi** | Xonalar occupancy rate | Kun/Oy | Admin |
| **Referal Hisoboti** | Referal statistikasi | Oy | Admin |

### 8.2 Asosiy Metrikalar

```
┌─────────────────────────────────────────────────────────────────┐
│                      KPI METRIKALAR                             │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Kunlik Visit Soni              │ COUNT(Visit) WHERE date=TODAY│
│ 💰 O'rtacha Check                 │ AVG(Visit.total_amount)      │
│ 🔄 Mijoz Qaytish Foizi            │ (Returning Clients / Total) * 100│
│ 👨‍⚕️ Shifokor Yuklamasi            │ COUNT(Visit) GROUP BY doctor │
│ 🚪 Xona Bandligi                  │ (Occupied Hours / Total) * 100│
│ 💳 Qarzdorlik Foizi               │ (SUM(debt_amount) / SUM(total)) * 100│
│ 📈 Oylik O'sish                   │ (This Month - Last Month) / Last Month│
│ ⭐ Mijoz Qoniqishi                │ Rating average (kelajakda)   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Report API Endpoints

```
GET /api/v1/reports/daily?date=2024-01-15
├── total_visits: number
├── total_income: decimal
├── total_payments: decimal
├── new_clients: number
└── visits_by_status: object

GET /api/v1/reports/monthly?year=2024&month=1
├── total_income: decimal
├── total_outcome: decimal
├── net_profit: decimal
├── visits_count: number
├── clients_count: number
└── daily_breakdown: array

GET /api/v1/reports/doctor/:id?from=2024-01-01&to=2024-01-31
├── total_visits: number
├── total_income: decimal
├── services_performed: array
├── average_visit_duration: number
└── commission_amount: decimal

GET /api/v1/reports/debtors
├── clients: array
│   ├── client_id
│   ├── full_name
│   ├── phone
│   └── debt_amount
└── total_debt: decimal
```

---

## 9. DEVELOPMENT PHASES

### 9.1 Phase Rejasi (Yangilangan)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  PHASE 1 │    │  PHASE 2 │    │  PHASE 3 │    │  PHASE 4 │    │  PHASE 5 │
│  CORE    │───▶│  FINANCE │───▶│  REPORT  │───▶│  NOTIFY  │───▶│  DEPLOY  │
│  6 hafta │    │  4 hafta │    │  4 hafta │    │  3 hafta │    │  3 hafta │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 9.2 Har Bir Phase Vazifalari

### Phase 1: CORE (6 hafta)

```
Week 1-2: Foundation
├── NestJS project setup
├── Prisma schema finalization
├── Database migration setup
├── Docker configuration
└── CI/CD pipeline basic

Week 3-4: Authentication & User
├── JWT authentication
├── User CRUD operations
├── UserRole management
├── RBAC guards implementation
└── Password hash & validation

Week 5-6: Core Entities
├── Client module (CRUD + search)
├── Department module
├── Room module
├── Service module
├── Visit module (basic)
└── Seed data & testing
```

### Phase 2: FINANCE (4 hafta)

```
Week 7-8: Payment System
├── Payment module (CRUD)
├── ClientPaid module
├── OtherPaid module
├── OtherPaidGroup module
└── Payment validation & audit

Week 9-10: Visit Finance
├── VisitService module
├── VisitRoom module
├── VisitReferral module
├── ServiceUser module (commission)
├── Balance calculation logic
└── Financial reporting base
```

### Phase 3: REPORT (4 hafta)

```
Week 11-12: Basic Reports
├── Daily report endpoint
├── Monthly report endpoint
├── Doctor performance report
├── Client history report
└── Export to Excel/PDF

Week 13-14: Analytics
├── Dashboard metrics
├── Chart data endpoints
├── Debt report
├── Room occupancy report
└── Cache implementation (Redis)
```

### Phase 4: NOTIFY (3 hafta)

```
Week 15-16: Notifications
├── SMS gateway integration
├── Telegram bot integration
├── Email service (optional)
├── Notification templates
└── Queue system (BullMQ)

Week 17: Mobile API
├── Mobile-optimized endpoints
├── Push notification setup
├── API rate limiting
└── Mobile authentication
```

### Phase 5: DEPLOY (3 hafta)

```
Week 18-19: Testing
├── Unit tests (Jest)
├── Integration tests
├── E2E tests (Supertest)
├── Load testing
└── Security audit

Week 20: Deployment
├── Production server setup
├── Database backup strategy
├── Monitoring (Prometheus/Grafana)
├── Logging (ELK stack)
└── Documentation finalization
```

### 9.3 Timeline Summary

| Phase | Duration | Start | End | Deliverables |
| --- | --- | --- | --- | --- |
| Phase 1 | 6 hafta | Week 1 | Week 6 | Core modules, Auth, User, Client |
| Phase 2 | 4 hafta | Week 7 | Week 10 | Payment, Visit Finance, Commission |
| Phase 3 | 4 hafta | Week 11 | Week 14 | Reports, Analytics, Dashboard |
| Phase 4 | 3 hafta | Week 15 | Week 17 | SMS, Telegram, Notifications |
| Phase 5 | 3 hafta | Week 18 | Week 20 | Testing, Deployment, Docs |
| **Total** | **20 hafta** |  |  | **Production Ready** |

---

## 10. DEPLOYMENT VA INFRASTRUCTURE

### 10.1 Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION INFRASTRUCTURE                    │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   Load Balancer │
                    │    (Nginx)      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌────────────┐ ┌────────────┐ ┌────────────┐
       │   App 1    │ │   App 2    │ │   App 3    │
       │  (NestJS)  │ │  (NestJS)  │ │  (NestJS)  │
       └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
             │              │              │
             └──────────────┼──────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
       ┌────────────┐             ┌────────────┐
       │ PostgreSQL │             │   Redis    │
       │  (Primary) │             │  (Cache)   │
       └─────┬──────┘             └────────────┘
             │
       ┌─────▼──────┐
       │ PostgreSQL │
       │  (Replica) │
       │  (Backup)  │
       └────────────┘
```

### 10.2 Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/klinika
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=klinika
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  pgadmin:
    image: dpage/pgadmin4
    environment:
      - PGADMIN_DEFAULT_EMAIL=admin@klinika.uz
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - "5050:80"
    depends_on:
      - db

volumes:
  postgres_data:
  redis_data:
```

### 10.3 Backup Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      BACKUP STRATEGY                            │
├─────────────────────────────────────────────────────────────────┤
│ Database Backup:                                                │
│ ├── Frequency: Daily at 03:00 AM                                │
│ ├── Retention: 30 days                                          │
│ ├── Type: Full backup + WAL archiving                           │
│ ├── Storage: S3 compatible storage                              │
│ └── Recovery: Point-in-time recovery available                  │
│                                                                 │
│ Application Backup:                                             │
│ ├── Code: Git repository (GitHub/GitLab)                        │
│ ├── Environment: .env files (encrypted)                         │
│ └── Config: Docker configs versioned                            │
│                                                                 │
│ Disaster Recovery:                                              │
│ ├── RTO (Recovery Time Objective): 4 hours                      │
│ ├── RPO (Recovery Point Objective): 1 hour                      │
│ └── Failover: Manual with documented procedure                  │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Monitoring & Logging

```
Monitoring Stack:
├── Prometheus - Metrics collection
├── Grafana - Visualization & Dashboards
├── Alertmanager - Alert notifications
└── Node Exporter - System metrics

Logging Stack:
├── Winston - Application logging
├── ELK Stack (Elasticsearch, Logstash, Kibana)
└── Log rotation: Daily, 30 days retention

Key Metrics to Monitor:
├── API Response Time (p95, p99)
├── Database Query Time
├── Error Rate (4xx, 5xx)
├── Active Connections
├── Memory Usage
├── CPU Usage
└── Disk Usage
```

---

## 11. KAMCHILIKLAR VA YUTUQLAR

### 11.1 ✅ YUTUQLAR

| # | Yutuq | Ahamiyati | Izoh |
| --- | --- | --- | --- |
| 1 | **To'liq Audit Trail** | 🔴 Yuqori | Har bir o'zgarish qayd etiladi (registered_by, modified_by) |
| 2 | **Soft Delete** | 🟡 O'rta | Ma'lumotlar fizik o'chirilmaydi, deleted_at ishlatiladi |
| 3 | **Prisma Schema** | 🔴 Yuqori | Type-safe, migration management, auto-generated types |
| 4 | **RBAC Permissions** | 🟡 O'rta | JSON formatda flexible permissions |
| 5 | **Visit State Machine** | 🔴 Yuqori | Aniq status flow (SCHEDULED→IN_PROGRESS→COMPLETED→DONE) |
| 6 | **Moliyaviy Hisob** | 🔴 Yuqori | total/paid/debt aniq hisobga olinadi |
| 7 | **Indexatsiya** | 🟡 O'rta | Tez-tez ishlatiladigan maydonlarda indexlar |
| 8 | **Decimal Type** | 🟡 O'rta | Moliyaviy operatsiyalar uchun Decimal(15,2) |
| 9 | **Foreign Key Relations** | 🟡 O'rta | Barcha bog'lanishlar aniq defined |
| 10 | **Enum Types** | 🟡 O'rta | Status va tiplar enum bilan boshqariladi |

### 11.2 ⚠️ KAMCHILIKLAR

| # | Kamchilik | Xavf | Tavsiya | Priority |
| --- | --- | --- | --- | --- |
| 1 | **Refund jarayoni yo'q** | 🔴 Yuqori | Payment model ga refund status qo'shish | CRITICAL |
| 2 | **Shifokor working hours** | 🟡 O'rta | DoctorSchedule jadvali qo'shish | HIGH |
| 3 | **Xona overlapping check** | 🔴 Yuqori | VisitRoom create da validation | CRITICAL |
| 4 | **API versioning** | 🟡 O'rta | /api/v1/ prefix qo'shish | MEDIUM |
| 5 | **Error handling standarti** | 🟡 O'rta | Global exception filter yaratish | HIGH |
| 6 | **Testing strategiyasi** | 🔴 Yuqori | Unit, E2E testlar rejasini qo'shish | CRITICAL |
| 7 | **Rate limiting** | 🟡 O'rta | API abuse oldini olish | HIGH |
| 8 | **Input validation** | 🔴 Yuqori | DTO + class-validator to'liq implement | CRITICAL |
| 9 | **Caching layer** | 🟡 O'rta | Redis cache qo'shish | MEDIUM |
| 10 | **Background jobs** | 🟡 O'rta | SMS, hisobotlar uchun queue | MEDIUM |
| 11 | **API documentation** | 🟡 O'rta | Swagger/OpenAPI auto-generate | HIGH |
| 12 | **CI/CD pipeline** | 🟡 O'rta | Automated testing & deployment | HIGH |

### 11.3 Risk Assessment

```
┌─────────────────────────────────────────────────────────────────┐
│                      RISK MATRIX                                │
├──────────────────┬─────────────┬─────────────┬──────────────────┤
│ Risk             │ Likelihood  │ Impact      │ Priority         │
├──────────────────┼─────────────┼─────────────┼──────────────────┤
│ Data Loss        │ Low         │ Critical    │ HIGH             │
│ Security Breach  │ Medium      │ Critical    │ HIGH             │
│ Performance      │ Medium      │ High        │ MEDIUM           │
│ Downtime         │ Low         │ High        │ MEDIUM           │
│ Compliance       │ Medium      │ High        │ HIGH             │
│ Scale Issues     │ Low         │ Medium      │ LOW              │
└──────────────────┴─────────────┴─────────────┴──────────────────┘
```

---

## 12. KEYINGI QADAMLAR

### 12.1 Prioritet Bo'yicha Vazifalar

```
🔴 CRITICAL (1-2 hafta):
├── 1. Error handling standarti yaratish (Global Exception Filter)
├── 2. Input validation to'liq (DTO + class-validator)
├── 3. VisitRoom overlapping validation implement
├── 4. Testing strategy (Jest + Supertest) setup
└── 5. Refund jarayoni qo'shish

🟡 HIGH PRIORITY (3-4 hafta):
├── 6. DoctorSchedule modeli yaratish
├── 7. API versioning (/api/v1/)
├── 8. Rate limiting (Throttler)
├── 9. API documentation (Swagger)
└── 10. CI/CD pipeline setup

🟢 MEDIUM PRIORITY (5-8 hafta):
├── 11. Caching layer (Redis)
├── 12. Background jobs (BullMQ)
├── 13. Monitoring (Prometheus + Grafana)
├── 14. Logging (ELK Stack)
└── 15. Backup automation
```

### 12.2 Documentation Checklist

```
✅ Completed:
├── Database Schema (Prisma)
├── Business Process Flow
├── RBAC Permissions Matrix
├── API Structure
└── Deployment Architecture

⏳ In Progress:
├── API Documentation (Swagger)
├── Code Documentation (JSDoc)
├── User Manual
└── Admin Guide

📋 TODO:
├── Migration Guide
├── Troubleshooting Guide
├── Security Policy Document
└── Disaster Recovery Plan
```

### 12.3 Production Readiness Checklist

```
Security:
☐ Password policy implemented
☐ JWT token rotation
☐ HTTPS enforced
☐ CORS configured
☐ Rate limiting active
☐ Input validation complete
☐ SQL injection protected (Prisma)
☐ XSS protection

Performance:
☐ Database indexes optimized
☐ Query caching implemented
☐ Connection pooling configured
☐ Load testing completed
☐ Response time < 200ms

Reliability:
☐ Error handling complete
☐ Logging implemented
☐ Monitoring setup
☐ Backup strategy active
☐ Disaster recovery tested

Compliance:
☐ Audit trail working
☐ Data retention policy
☐ Privacy policy (GDPR/Local)
☐ Access control tested
```

---

## 13. XULOSA

### 13.1 Loyiha Holati

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT STATUS                               │
├─────────────────────────────────────────────────────────────────┤
│ Database Schema:        ████████████████████ 100% ✅            │
│ Business Logic:         ████████████████░░░░  80% ⚠️            │
│ Security:               ██████████████░░░░░░  70% ⚠️            │
│ Testing:                ██████░░░░░░░░░░░░░░  30% ❌            │
│ Documentation:          ████████████████░░░░  80% ⚠️            │
│ Deployment:             ████████░░░░░░░░░░░░  40% ❌            │
├─────────────────────────────────────────────────────────────────┤
│ Overall Progress:       ██████████████░░░░░░  70%               │
└─────────────────────────────────────────────────────────────────┘

✅ Hozir holat: 70% tayyor
📈 Production ready: 30% qo'shimcha ish kerak
⏱️ Estimated time: 8-10 hafta
```

### 13.2 Asosiy Tavsiyalar

```
1. 🎯 FOCUS ON TESTING
   - Unit test coverage > 80%
   - Integration tests for all modules
   - E2E tests for critical flows

2. 🔒 SECURITY HARDENING
   - Implement all security measures
   - Security audit before production
   - Regular vulnerability scanning

3. 📊 PERFORMANCE OPTIMIZATION
   - Database query optimization
   - Caching strategy implementation
   - Load testing before deployment

4. 📚 DOCUMENTATION
   - API documentation (Swagger)
   - Code documentation (JSDoc)
   - User manuals

5. 🚀 DEPLOYMENT STRATEGY
   - Staging environment
   - Blue-green deployment
   - Rollback plan
```

### 13.3 Success Metrics

```
Technical KPIs:
├── API Response Time: < 200ms (p95)
├── Database Query Time: < 100ms (p95)
├── Error Rate: < 0.1%
├── Uptime: 99.9%
└── Test Coverage: > 80%

Business KPIs:
├── Daily Visits: Track & optimize
├── Revenue Growth: Month over month
├── Client Retention: > 60%
├── Debt Collection: > 90%
└── Staff Efficiency: Visits per doctor
```

---

## 📞 ALOQA VA QO'LLAB-QUVVATLASH

**Loyiha Mas'uli:** Senior Architect & NestJS Developer

**Hujjat Versiyasi:** 1.0 Final

**Oxirgi Yangilanish:** 2024

**Keyingi Review:** Phase 1 tugagandan so'ng

---