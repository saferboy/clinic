# 📋 RFC-015: Mijoz Oldindan To'lovlari Boshqaruvi (ClientPaid Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-015 |
| **Nomi** | ClientPaid Management |
| **Phase** | 2B - Finance |
| **Model** | `ClientPaid` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🟡 Medium (Finance - Core) |
| **Bog'liq RFC** | RFC-002 (User), RFC-009 (Client), RFC-013 (Visit), RFC-014 (Payment) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.5, 4.2, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC mijozlar tomonidan amalga oshirilgan oldindan to'lovlarni (depozit, avans) boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Mijoz balance ini avtomatik yangilash, oldindan to'lovlarni kelajakdagi visitlar uchun ishlatish imkoniyatini yaratish va moliyaviy hisobotlar uchun asos yaratish (Reference: `Klinika.md` 3.5, 4.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ ClientPaid yaratish (Create) | ❌ Online to'lov integratsiyasi (kelajakda) |
| ✅ ClientPaid ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ ClientPaid yangilash (Update) | ❌ Bank integratsiyasi (kelajakda) |
| ✅ ClientPaid refund (Soft Delete) | ❌ Multi-currency support |
| ✅ Client balance hisoblash | |
| ✅ Visit bilan bog'lanish (optional) | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.5, 4.2)
- Mijoz oldindan to'lovlarini markazlashtirilgan boshqarish
- Mijoz balance avtomatik hisoblash va yangilash
- Kelajakdagi visitlar uchun depozit tizimi
- Moliyaviy hisobotlar uchun asos yaratish (Reference: `Klinika.md` 7.1)
- Qarzdorlikni kamaytirish imkoniyati
- Mijoz loyalitetini oshirish (depozit tizimi orqali)

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

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

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi |
| `client_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Client jadvaliga bog'lanish. Qaysi mijoz oldindan to'lov qilganligi (Reference: `Klinika.md` 3.2) |
| `visit_id` | Int | ❌ | null | INTEGER | **Foreign Key**. Visit jadvaliga bog'lanish. Qaysi visit uchun oldindan to'lov (optional - umumiy depozit bo'lishi mumkin) |
| `amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **To'lov summasi**. So'mda ifodalanadi. 2 kasr belgigacha. Moliyaviy hisob-kitob uchun muhim (Reference: `Klinika.md` 9.2) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. To'lov haqida qo'shimcha ma'lumot (to'lov turi, izoh va h.k.) |
| `payment_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **To'lov sanasi**. Qachon to'lov amalga oshirilganligi. Hisobotlar uchun muhim |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade. Audit uchun |

### 2.3 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([client_id])` | client_id | Mijoz bo'yicha filter qilishni tezlashtirish |
| `@@index([visit_id])` | visit_id | Visit bo'yicha filter qilishni tezlashtirish |
| `@@index([payment_date])` | payment_date | Sana bo'yicha filter/sort qilish (hisobotlar uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([client_id, payment_date])` | client_id, payment_date | Qo'shma index - mijoz va sana bo'yicha (mijoz tarixi uchun) |
| `@@index([visit_id, payment_date])` | visit_id, payment_date | Qo'shma index - visit va sana bo'yicha |

### 2.4 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_client_paid_client` | Client | N:1 | SetNull | Cascade | Mijoz o'chirilganda clientPaid.client_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_client_paid_visit` | Visit | N:1 | SetNull | Cascade | Visit o'chirilganda clientPaid.visit_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_client_paid_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_client_paid_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |

### 2.5 Cascade Rules Tushunchasi

```
ClientPaid o'chirilganda (Soft Delete/Refund):
┌─────────────────────────────────────────────────┐
│ 1. ClientPaid.deleted_at = NOW()               │
│ 2. Client balance qayta hisoblanadi            │
│ 3. Moliyaviy tarix saqlanib qoladi             │
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
| 1 | POST | `/api/v1/client-paid` | ✅ JWT | Admin, Receptionist, Accountant | Yangi ClientPaid yaratish |
| 2 | GET | `/api/v1/client-paid` | ✅ JWT | Barchasi | ClientPaid ro'yxatini olish |
| 3 | GET | `/api/v1/client-paid/:id` | ✅ JWT | Barchasi | Bitta ClientPaid ma'lumotlari |
| 4 | PUT | `/api/v1/client-paid/:id` | ✅ JWT | Admin, Accountant | ClientPaid yangilash |
| 5 | DELETE | `/api/v1/client-paid/:id` | ✅ JWT | Admin, Accountant | ClientPaid refund (soft delete) |
| 6 | GET | `/api/v1/clients/:clientId/client-paid` | ✅ JWT | Barchasi | Mijoz oldindan to'lovlari |
| 7 | GET | `/api/v1/clients/:clientId/balance` | ✅ JWT | Barchasi | Mijoz balance olish |

---

### 3.2 POST /api/v1/client-paid

**Tavsif:** Yangi ClientPaid yaratish (Admin, Receptionist, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateClientPaidDto {
  client_id: number;      // Mavjud Client ID
  visit_id?: number;      // Mavjud Visit ID (optional - qaysi visit uchun)
  amount: number;         // To'lov summasi (musbat)
  payment_date?: Date;    // To'lov sanasi (default: now)
  description?: string;   // To'lov tavsifi
}
```

**Request Body Example:**
```json
{
  "client_id": 1,
  "visit_id": null,
  "amount": 500000,
  "payment_date": "2024-01-15T10:00:00.000Z",
  "description": "Depozit - kelajakdagi xizmatlar uchun"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Oldindan to'lov muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "client": { "id": 1, "full_name": "John Doe", "balance": 500000 },
    "visit": null,
    "amount": 500000,
    "payment_date": "2024-01-15T10:00:00.000Z",
    "description": "Depozit - kelajakdagi xizmatlar uchun",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// client-paid.service.ts
async create(createClientPaidDto: CreateClientPaidDto, userId: number): Promise<ClientPaid> {
  // 1. Client mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id: createClientPaidDto.client_id }
  });

  if (!client || client.deleted_at) {
    throw new NotFoundException('CP_001');
  }

  // 2. Visit mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createClientPaidDto.visit_id) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: createClientPaidDto.visit_id }
    });

    if (!visit || visit.deleted_at) {
      throw new NotFoundException('CP_002');
    }

    // 3. Visit client_id bilan ClientPaid client_id mosligini tekshirish
    if (visit.client_id !== createClientPaidDto.client_id) {
      throw new BadRequestException('CP_003');
    }
  }

  // 4. Amount validatsiya (musbat son)
  if (createClientPaidDto.amount <= 0) {
    throw new BadRequestException('CP_004');
  }

  // 5. ClientPaid yaratish
  const clientPaid = await this.prisma.clientPaid.create({
     {
      client_id: createClientPaidDto.client_id,
      visit_id: createClientPaidDto.visit_id,
      amount: createClientPaidDto.amount,
      payment_date: createClientPaidDto.payment_date || new Date(),
      description: createClientPaidDto.description,
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      client: { select: { id: true, full_name: true, balance: true } },
      visit: { select: { id: true, total_amount: true, paid_amount: true, debt_amount: true } }
    }
  });

  // 6. Client balance ni yangilash
  await this.updateClientBalance(createClientPaidDto.client_id);

  return clientPaid;
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
  
  // Balance formulasi: (Oldindan to'lov + To'lovlar) - Qarz
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

### 3.3 GET /api/v1/client-paid

**Tavsif:** ClientPaid ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `client_id` | number | - | Mijoz bo'yicha filter |
| `visit_id` | number | - | Visit bo'yicha filter |
| `date_from` | date | - | Sana oralig'i (boshlanishi) |
| `date_to` | date | - | Sana oralig'i (tugashi) |
| `sortBy` | string | payment_date | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/client-paid?page=1&limit=20&client_id=1&date_from=2024-01-01&date_to=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "client": { "id": 1, "full_name": "John Doe", "phone": "+998901234567" },
      "visit": null,
      "amount": 500000,
      "payment_date": "2024-01-15T10:00:00.000Z",
      "description": "Depozit"
    },
    {
      "id": 2,
      "client": { "id": 1, "full_name": "John Doe", "phone": "+998901234567" },
      "visit": { "id": 1, "total_amount": 250000, "paid_amount": 0, "debt_amount": 250000 },
      "amount": 300000,
      "payment_date": "2024-01-16T10:00:00.000Z",
      "description": "1-sonli visit uchun oldindan to'lov"
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
async findAll(query: GetClientPaidQuery): Promise<PaginatedResult<ClientPaid>> {
  const where: any = { deleted_at: null };

  // Client filter
  if (query.client_id) {
    where.client_id = query.client_id;
  }

  // Visit filter
  if (query.visit_id) {
    where.visit_id = query.visit_id;
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
    this.prisma.clientPaid.findMany({
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
    this.prisma.clientPaid.count({ where })
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

### 3.4 DELETE /api/v1/client-paid/:id (Refund)

**Tavsif:** ClientPaid refund qilish (soft delete) (Admin, Accountant)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Oldindan to'lov muvaffaqiyatli bekor qilindi",
  "data": {
    "id": 1,
    "amount": 500000,
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async refund(id: number, userId: number): Promise<ClientPaid> {
  // 1. ClientPaid mavjudligini tekshirish
  const clientPaid = await this.prisma.clientPaid.findUnique({
    where: { id }
  });

  if (!clientPaid || clientPaid.deleted_at) {
    throw new NotFoundException('CP_005');
  }

  // 2. Faqat Admin yoki Accountant refund qilish huquqiga ega
  // (Role check middleware orqali amalga oshiriladi)

  // 3. Client balance ni qayta hisoblash
  if (clientPaid.client_id) {
    await this.updateClientBalance(clientPaid.client_id);
  }

  // 4. Soft Delete
  const refunded = await this.prisma.clientPaid.update({
    where: { id },
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

### 3.5 GET /api/v1/clients/:clientId/balance

**Tavsif:** Mijoz balance olish (Barchasi)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "clientId": 1,
    "totalPrepaid": 500000,
    "totalPaid": 250000,
    "totalDebt": 250000,
    "balance": 500000,
    "prepaidCount": 2,
    "paymentCount": 1
  }
}
```

**Service Layer Implementation:**
```typescript
async getClientBalance(clientId: number): Promise<ClientBalance> {
  // Barcha visitlarning debt_amount yig'indisi
  const visits = await this.prisma.visit.aggregate({
    where: { client_id: clientId, deleted_at: null },
    _sum: { 
      debt_amount: true,
      total_amount: true,
      paid_amount: true
    }
  });

  // Barcha ClientPaid yozuvlarining amount yig'indisi
  const clientPaid = await this.prisma.clientPaid.aggregate({
    where: { client_id: clientId, deleted_at: null },
    _sum: { amount: true },
    _count: { id: true }
  });

  // Barcha Payment (INCOME) yozuvlarining amount yig'indisi
  const payments = await this.prisma.payment.aggregate({
    where: { client_id: clientId, deleted_at: null, payment_type: 'INCOME' },
    _sum: { amount: true },
    _count: { id: true }
  });

  const totalDebt = visits._sum.debt_amount || 0;
  const totalPrepaid = clientPaid._sum.amount || 0;
  const totalPaid = payments._sum.amount || 0;
  const balance = (totalPrepaid + totalPaid) - totalDebt;

  return {
    clientId,
    totalPrepaid,
    totalPaid,
    totalDebt,
    balance,
    prepaidCount: clientPaid._count.id,
    paymentCount: payments._count.id
  };
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-client-paid.dto.ts
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  Min,
  IsString,
  MaxLength,
  IsDecimal
} from 'class-validator';

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
  @MaxLength(1000)
  description?: string;
}

// update-client-paid.dto.ts
export class UpdateClientPaidDto {
  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  payment_date?: string;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `client_id` | Required | CP_001 | Mijoz majburiy |
| `client_id` | Must Exist | CP_001 | Mijoz topilmadi |
| `visit_id` | Must Exist | CP_002 | Visit topilmadi |
| `visit_id` | client_id Match | CP_003 | Mijoz va Visit mos kelmadi |
| `amount` | Required | CP_004 | Summa majburiy |
| `amount` | Min 0.01 | CP_004 | Summa musbat bo'lishi kerak |
| `payment_date` | IsDateString | CP_007 | Noto'g'ri sana formati |
| `payment_date` | Max today | CP_007 | Kelajak sana bo'lmasligi kerak |
| `description` | MaxLength 1000 | CP_008 | Tavsif 1000 belgidan oshmasin |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `CP_001` | 404 Not Found | Mijoz topilmadi | Client ID not exists | Client ID ni tekshiring |
| `CP_002` | 404 Not Found | Visit topilmadi | Visit ID not exists | Visit ID ni tekshiring |
| `CP_003` | 400 Bad Request | Mijoz va Visit mos kelmadi | client_id mismatch | Client va Visit mosligini tekshiring |
| `CP_004` | 400 Bad Request | Summa noto'g'ri | amount <= 0 | Musbat son kiriting |
| `CP_005` | 404 Not Found | Oldindan to'lov topilmadi | ClientPaid ID not exists | ClientPaid ID ni tekshiring |
| `CP_006` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `CP_007` | 400 Bad Request | Sana noto'g'ri | Date format yoki kelajak sana | Date format tekshirilsin |
| `CP_008` | 400 Bad Request | Tavsif juda uzun | Validation failed | Max 1000 belgi |

### 5.2 Exception Filter

```typescript
// client-paid-exception.filter.ts
@Catch()
export class ClientPaidExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof NotFoundException) return 'CP_005';
    if (exception instanceof ForbiddenException) return 'CP_006';
    if (exception instanceof BadRequestException) return 'CP_004';
    return 'CP_005';
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
| POST /client-paid | ✅ | ❌ | ❌ | ✅ | ✅ |
| GET /client-paid | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /client-paid/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /client-paid/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| DELETE /client-paid/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /clients/:id/client-paid | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /clients/:id/balance | ✅ | ✅ | ✅ | ✅ | ✅ |

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

---

## 7. SEED DATA

### 7.1 Test ClientPaid

```typescript
// seed/client-paid.seed.ts
export async function seedClientPaid(prisma: PrismaClient) {
  // Test ClientPaid yaratish
  const clientPaid = [
    {
      client_id: 1,
      visit_id: null,
      amount: 500000,
      description: 'Depozit - kelajakdagi xizmatlar uchun',
      payment_date: new Date('2024-01-10T10:00:00Z')
    },
    {
      client_id: 1,
      visit_id: 1,
      amount: 300000,
      description: '1-sonli visit uchun oldindan to''lov',
      payment_date: new Date('2024-01-12T10:00:00Z')
    },
    {
      client_id: 2,
      visit_id: null,
      amount: 1000000,
      description: 'VIP mijoz depoziti',
      payment_date: new Date('2024-01-15T10:00:00Z')
    }
  ];

  for (const paid of clientPaid) {
    await prisma.clientPaid.create({  paid });
  }

  console.log(`✅ ClientPaid seeded successfully (${clientPaid.length} records)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat ClientPaid
npm run seed:client-paid
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test ClientPaid o'chiriladi
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
// client-paid.service.spec.ts
describe('ClientPaidService', () => {
  let service: ClientPaidService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientPaidService, PrismaService],
    }).compile();

    service = module.get<ClientPaidService>(ClientPaidService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new clientPaid successfully', async () => {
      const dto: CreateClientPaidDto = {
        client_id: 1,
        amount: 500000,
        description: 'Depozit',
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.clientPaid.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.amount).toBe(500000);
      expect(prisma.clientPaid.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if client not found', async () => {
      const dto: CreateClientPaidDto = {
        client_id: 999,
        amount: 500000,
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.create(dto, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if amount <= 0', async () => {
      const dto: CreateClientPaidDto = {
        client_id: 1,
        amount: 0,
      };

      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refund', () => {
    it('should refund clientPaid successfully', async () => {
      prisma.clientPaid.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null, client_id: 1 });
      prisma.clientPaid.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.refund(1, 1);

      expect(result.deleted_at).toBeDefined();
    });
  });

  describe('getClientBalance', () => {
    it('should return client balance correctly', async () => {
      prisma.visit.aggregate = jest.fn().mockResolvedValue({ _sum: { debt_amount: 250000 } });
      prisma.clientPaid.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 500000 }, _count: { id: 2 } });
      prisma.payment.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 250000 }, _count: { id: 1 } });

      const result = await service.getClientBalance(1);

      expect(result.balance).toBe(500000);
      expect(result.totalPrepaid).toBe(500000);
      expect(result.totalDebt).toBe(250000);
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_client_paid

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
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
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_paid_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_client_paid_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "client_paid_client_id_idx" ON "client_paid"("client_id");
CREATE INDEX "client_paid_visit_id_idx" ON "client_paid"("visit_id");
CREATE INDEX "client_paid_payment_date_idx" ON "client_paid"("payment_date");
CREATE INDEX "client_paid_deleted_at_idx" ON "client_paid"("deleted_at");
CREATE INDEX "client_paid_client_id_payment_date_idx" ON "client_paid"("client_id", "payment_date");
CREATE INDEX "client_paid_visit_id_payment_date_idx" ON "client_paid"("visit_id", "payment_date");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_client_paid"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "client_paid" CASCADE;
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
@@index([client_id])              // Mijoz filter uchun
@@index([visit_id])               // Visit filter uchun
@@index([payment_date])           // Sana filter uchun (eng muhim)
@@index([deleted_at])             // Soft delete filter uchun
@@index([client_id, payment_date]) // Qo'shma index - mijoz va sana
@@index([visit_id, payment_date])  // Qo'shma index - visit va sana
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| ClientPaid List | Redis | 2 daqiqa | ClientPaid create/delete |
| Client Balance | Redis | 1 daqiqa | ClientPaid/Payment create/delete |
| ClientPaid by Client | Redis | 2 daqiqa | ClientPaid create/delete |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const clientPaid = await prisma.clientPaid.findMany({
  select: { 
    id: true, 
    client_id: true, 
    amount: true,
    payment_date: true
  },
  where: { 
    deleted_at: null, 
    client_id: 1
  },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const clientPaid = await prisma.clientPaid.findMany({
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
const clientPaid = await prisma.clientPaid.findMany();
```

### 10.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |
| Balance Calculation Time | < 50ms |

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `15-client-paid-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Client RFC | `RFC-009-client-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| OtherPaid RFC | `RFC-016-other-paid-management.md` | ⏳ Keyingi |
| ServiceUser RFC | `RFC-017-service-user-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] ClientPaid yaratish mijoz bilan bog'lanishi
- [ ] ClientPaid visitga bog'lanishi (optional)
- [ ] ClientPaid summasi musbat bo'lishi
- [ ] Client balance avtomatik yangilanadi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin/Accountant refund qilish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Receptionist oldindan to'lov qabul qilish huquqiga ega
- [ ] Barcha rollar ClientPaid ro'yxatini ko'ra oladi
- [ ] Mijoz balance olish ishlaydi
- [ ] Pagination va filterlash ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull)
- [ ] Balance formulasi to'g'ri ishlaydi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq
- [ ] Concurrent users 50+ qo'llab-quvvatlanadi
- [ ] Data retention 5 yil
- [ ] Balance calculation time < 50ms

---

## 13. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Client balance inconsistency | O'rta | Yuqori | Automatic balance update + audit trail |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Data privacy concerns | Past | Yuqori | Data encryption + access control (Reference: `Klinika.md` 8.1) |
| Refund abuse | O'rta | Yuqori | Role-based access control (Admin/Accountant only) |
| Duplicate ClientPaid | O'rta | O'rta | Validation + unique constraint |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Online payment integration (Payme, Click) | 🟡 Medium | Phase 4 |
| ClientPaid statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| ClientPaid change history | 🟢 Low | Phase 4 |
| SMS/Email payment notifications | 🟢 Low | Phase 4 |
| Recurring ClientPaid | 🟢 Low | Phase 4 |
| ClientPaid installment plans | 🟢 Low | Phase 4 |

---
