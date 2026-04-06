# 📋 RFC-017: Boshqa Kirim/Chiqimlar Boshqaruvi (OtherPaid Management)

## 📄 RFC METADATA
| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-017 |
| **Nomi** | OtherPaid Management |
| **Phase** | 2B - Finance |
| **Model** | `OtherPaid`, `OtherPaidGroup` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🟡 Medium (Finance - Core) |
| **Bog'liq RFC** | RFC-002 (User), RFC-016 (OtherPaidGroup) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.5, 4.2, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikaning boshqa kirim va chiqimlarini (mijoz to'lovlari bilan bog'liq bo'lmagan) boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Kommunal to'lovlar, ijaralar, maoshlar, soliq to'lovlari va boshqa xarajatlarni hisobga olish, kategoriyalash va moliyaviy hisobotlar uchun asos yaratish (Reference: `Klinika.md` 3.5, 4.2, 7.1).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ OtherPaid yaratish (Create) | ❌ Online to'lov integratsiyasi |
| ✅ OtherPaid ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ OtherPaid yangilash (Update) | ❌ Bank integratsiyasi |
| ✅ OtherPaid o'chirish (Soft Delete) | ❌ Multi-currency support |
| ✅ Kategoriya bo'yicha filterlash | |
| ✅ Moliyaviy hisobot (Summary) | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.5, 7.1)
- Klinika xarajatlarini markazlashtirilgan boshqarish
- Kirim/chiqim oqimlarini kategoriyalash
- Moliyaviy hisobotlarda kategoriyalar kesimida statistika
- Xarajat turlarini nazorat qilish
- Budget planning uchun asos yaratish
- Buxgalteriya hisobotlarini yengillashtirish
- Xarajat optimallashtirish imkoniyati

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

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

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi |
| `group_id` | Int | ❌ | null | INTEGER | **Foreign Key**. OtherPaidGroup jadvaliga bog'lanish. Chiqim kategoriyasi (Reference: `Klinika.md` 3.5) |
| `type` | Enum | ✅ | - | PaymentType | **To'lov turi**. INCOME (kirim), OUTCOME (chiqim). Moliyaviy oqimni aniqlash uchun (Reference: `Klinika.md` 3.5) |
| `amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Summa**. So'mda ifodalanadi. 2 kasr belgigacha. Moliyaviy hisob-kitob uchun muhim (Reference: `Klinika.md` 9.2) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi, to'lov haqida qo'shimcha ma'lumot |
| `payment_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **To'lov sanasi**. Qachon to'lov amalga oshirilganligi. Hisobotlar uchun muhim |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade. Audit uchun |

### 2.3 Enum Tuzilishi (Reference: `klinika_prisma.txt`)

#### PaymentType Enum
```prisma
enum PaymentType {
  INCOME   // ✅ Kirim (Klinika daromadi)
  OUTCOME  // 💸 Chiqim (Klinika xarajati)
}
```

| Type | Tavsif | Misol |
|------|--------|-------|
| `INCOME` | Klinikaga kelib tushadigan mablag'lar | Foiz daromadi, sotuvdan tushum, boshqa kirimlar (Reference: `Klinika.md` 3.5) |
| `OUTCOME` | Klinikadan chiqadigan mablag'lar | Maoshlar, kommunal to'lovlar, ijaralar, soliqlar |

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([group_id])` | group_id | Guruh bo'yicha filter qilishni tezlashtirish |
| `@@index([type])` | type | To'lov turi bo'yicha filter qilishni tezlashtirish (kirim/chiqim) |
| `@@index([payment_date])` | payment_date | Sana bo'yicha filter/sort qilish (hisobotlar uchun muhim) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([type, payment_date])` | type, payment_date | Qo'shma index - to'lov turi va sana bo'yicha (hisobotlar uchun eng muhim) |

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_other_paid_group` | OtherPaidGroup | N:1 | SetNull | Cascade | Guruh o'chirilganda otherPaid.group_id NULL ga o'zgaradi. Moliyaviy tarix saqlanadi |
| `fk_other_paid_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_other_paid_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |

### 2.6 Cascade Rules Tushunchasi

```
OtherPaid o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. OtherPaid.deleted_at = NOW()                │
│ 2. Moliyaviy tarix saqlanib qoladi             │
│ 3. Hisobotlarda ko'rinmaydi (deleted_at null)  │
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
| 1 | POST | `/api/v1/other-paid` | ✅ JWT | Admin, Accountant | Yangi OtherPaid yaratish |
| 2 | GET | `/api/v1/other-paid` | ✅ JWT | Admin, Accountant | OtherPaid ro'yxatini olish |
| 3 | GET | `/api/v1/other-paid/:id` | ✅ JWT | Admin, Accountant | Bitta OtherPaid ma'lumotlari |
| 4 | PUT | `/api/v1/other-paid/:id` | ✅ JWT | Admin, Accountant | OtherPaid yangilash |
| 5 | DELETE | `/api/v1/other-paid/:id` | ✅ JWT | Admin | OtherPaid o'chirish (soft) |
| 6 | GET | `/api/v1/other-paid/summary` | ✅ JWT | Admin, Accountant | Moliyaviy hisobot (summary) |

---

### 3.2 POST /api/v1/other-paid

**Tavsif:** Yangi OtherPaid yaratish (Admin, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateOtherPaidDto {
  group_id?: number;      // Mavjud OtherPaidGroup ID (optional)
  type: PaymentType;      // INCOME/OUTCOME
  amount: number;         // Summa (musbat)
  payment_date?: Date;    // To'lov sanasi (default: now)
  description?: string;   // To'lov tavsifi (0-255 belgi)
}
```

**Request Body Example:**
```json
{
  "group_id": 2,
  "type": "OUTCOME",
  "amount": 1500000,
  "payment_date": "2024-01-15T10:00:00.000Z",
  "description": "Yanvar oyi kommunal to'lovlar"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Boshqa to'lov muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "group": { "id": 2, "name": "Kommunal to'lovlar" },
    "type": "OUTCOME",
    "amount": 1500000,
    "payment_date": "2024-01-15T10:00:00.000Z",
    "description": "Yanvar oyi kommunal to'lovlar",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// other-paid.service.ts
async create(createOtherPaidDto: CreateOtherPaidDto, userId: number): Promise<OtherPaid> {
  // 1. Group mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createOtherPaidDto.group_id) {
    const group = await this.prisma.otherPaidGroup.findUnique({
      where: { id: createOtherPaidDto.group_id }
    });

    if (!group || group.deleted_at) {
      throw new NotFoundException('OP_001');
    }
  }

  // 2. Amount validatsiya (musbat son)
  if (createOtherPaidDto.amount <= 0) {
    throw new BadRequestException('OP_002');
  }

  // 3. OtherPaid yaratish
  const otherPaid = await this.prisma.otherPaid.create({
     {
      group_id: createOtherPaidDto.group_id,
      type: createOtherPaidDto.type,
      amount: createOtherPaidDto.amount,
      payment_date: createOtherPaidDto.payment_date || new Date(),
      description: createOtherPaidDto.description,
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      group: { select: { id: true, name: true } }
    }
  });

  return otherPaid;
}
```

---

### 3.3 GET /api/v1/other-paid

**Tavsif:** OtherPaid ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `type` | PaymentType | - | To'lov turi bo'yicha filter (INCOME/OUTCOME) |
| `group_id` | number | - | Guruh bo'yicha filter |
| `date_from` | date | - | Sana oralig'i (boshlanishi) |
| `date_to` | date | - | Sana oralig'i (tugashi) |
| `sortBy` | string | payment_date | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/other-paid?page=1&limit=20&type=OUTCOME&date_from=2024-01-01&date_to=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "group": { "id": 2, "name": "Kommunal to'lovlar" },
      "type": "OUTCOME",
      "amount": 1500000,
      "payment_date": "2024-01-15T10:00:00.000Z",
      "description": "Yanvar oyi kommunal to'lovlar"
    },
    {
      "id": 2,
      "group": { "id": 1, "name": "Maoshlar" },
      "type": "OUTCOME",
      "amount": 5000000,
      "payment_date": "2024-01-31T10:00:00.000Z",
      "description": "Yanvar oyi maoshlar"
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
async findAll(query: GetOtherPaidQuery): Promise<PaginatedResult<OtherPaid>> {
  const where: any = { deleted_at: null };

  // Type filter
  if (query.type) {
    where.type = query.type;
  }

  // Group filter
  if (query.group_id) {
    where.group_id = query.group_id;
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
    this.prisma.otherPaid.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        group: { select: { id: true, name: true } },
        user: { select: { id: true, full_name: true } }
      }
    }),
    this.prisma.otherPaid.count({ where })
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

### 3.4 GET /api/v1/other-paid/summary

**Tavsif:** Moliyaviy hisobot (summary) (Admin, Accountant)

**Query Params:**
```
GET /api/v1/other-paid/summary?date_from=2024-01-01&date_to=2024-01-31
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
      "total": 2000000,
      "count": 5
    },
    "outcome": {
      "total": 8000000,
      "count": 25
    },
    "balance": -6000000,
    "byCategory": [
      {
        "group_id": 1,
        "group_name": "Maoshlar",
        "type": "OUTCOME",
        "total": 5000000,
        "count": 10
      },
      {
        "group_id": 2,
        "group_name": "Kommunal to'lovlar",
        "type": "OUTCOME",
        "total": 1500000,
        "count": 5
      },
      {
        "group_id": 3,
        "group_name": "Ijara",
        "type": "OUTCOME",
        "total": 1000000,
        "count": 2
      }
    ]
  }
}
```

**Service Layer Implementation:**
```typescript
async getSummary(dateFrom: Date, dateTo: Date): Promise<OtherPaidSummary> {
  // Kirim yig'indisi
  const income = await this.prisma.otherPaid.aggregate({
    where: {
      deleted_at: null,
      type: 'INCOME',
      payment_date: {
        gte: dateFrom,
        lt: new Date(dateTo.setHours(23, 59, 59, 999))
      }
    },
    _sum: { amount: true },
    _count: { id: true }
  });

  // Chiqim yig'indisi
  const outcome = await this.prisma.otherPaid.aggregate({
    where: {
      deleted_at: null,
      type: 'OUTCOME',
      payment_date: {
        gte: dateFrom,
        lt: new Date(dateTo.setHours(23, 59, 59, 999))
      }
    },
    _sum: { amount: true },
    _count: { id: true }
  });

  // Kategoriya bo'yicha taqsimot
  const byCategory = await this.prisma.otherPaid.groupBy({
    by: ['group_id', 'type'],
    _sum: { amount: true },
    _count: { id: true },
    where: {
      deleted_at: null,
      payment_date: {
        gte: dateFrom,
        lt: new Date(dateTo.setHours(23, 59, 59, 999))
      }
    }
  });

  // Guruh nomlarini olish
  const groupIds = byCategory
    .filter(item => item.group_id !== null)
    .map(item => item.group_id!);

  const groups = await this.prisma.otherPaidGroup.findMany({
    where: { id: { in: groupIds } },
    select: { id: true, name: true }
  });

  const totalIncome = income._sum.amount || 0;
  const totalOutcome = outcome._sum.amount || 0;
  const balance = totalIncome - totalOutcome;

  return {
    period: {
      from: dateFrom,
      to: dateTo
    },
    income: {
      total: totalIncome,
      count: income._count.id
    },
    outcome: {
      total: totalOutcome,
      count: outcome._count.id
    },
    balance,
    byCategory: byCategory.map(item => ({
      group_id: item.group_id,
      group_name: groups.find(g => g.id === item.group_id)?.name || 'Kategoriyasiz',
      type: item.type,
      total: item._sum.amount || 0,
      count: item._count.id
    }))
  };
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-other-paid.dto.ts
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

// update-other-paid.dto.ts
export class UpdateOtherPaidDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  group_id?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsDateString()
  payment_date?: string;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `type` | Required | OP_003 | To'lov turi majburiy |
| `type` | Enum | OP_003 | INCOME/OUTCOME |
| `amount` | Required | OP_002 | Summa majburiy |
| `amount` | Min 0.01 | OP_002 | Summa musbat bo'lishi kerak |
| `amount` | Decimal(15,2) | OP_002 | 2 kasr belgigacha |
| `group_id` | Must Exist | OP_001 | To'lov guruhi topilmadi |
| `payment_date` | IsDateString | OP_004 | Noto'g'ri sana formati |
| `payment_date` | Max today | OP_004 | Kelajak sana bo'lmasligi kerak |
| `description` | MaxLength 255 | OP_005 | Tavsif 255 belgidan oshmasin |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `OP_001` | 404 Not Found | To'lov guruhi topilmadi | OtherPaidGroup ID not exists | Group ID ni tekshiring |
| `OP_002` | 400 Bad Request | Summa noto'g'ri | amount <= 0 | Musbat son kiriting |
| `OP_003` | 400 Bad Request | To'lov turi noto'g'ri | Validation failed | INCOME/OUTCOME |
| `OP_004` | 400 Bad Request | Sana noto'g'ri | Date format yoki kelajak sana | Date format tekshirilsin |
| `OP_005` | 400 Bad Request | Tavsif juda uzun | Validation failed | Max 255 belgi |
| `OP_006` | 404 Not Found | Boshqa to'lov topilmadi | OtherPaid ID not exists | ID ni tekshiring |
| `OP_007` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |

### 5.2 Exception Filter

```typescript
// other-paid-exception.filter.ts
@Catch()
export class OtherPaidExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof NotFoundException) return 'OP_006';
    if (exception instanceof ForbiddenException) return 'OP_007';
    if (exception instanceof BadRequestException) return 'OP_002';
    return 'OP_006';
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
| POST /other-paid | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /other-paid | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /other-paid/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| PUT /other-paid/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| DELETE /other-paid/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /other-paid/summary | ✅ | ❌ | ❌ | ❌ | ✅ |

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
- ✅ Summa musbat bo'lishi kerak
- ✅ Moliyaviy operatsiyalar audit qilinadi
- ✅ Delete faqat Admin tomonidan amalga oshiriladi
- ✅ Payment type (INCOME/OUTCOME) validatsiya qilinadi
- ✅ Moliyaviy ma'lumotlar konfidensial (Doctor/Nurse/Receptionist kirish huquqi yo'q)

---

## 7. SEED DATA

### 7.1 Test OtherPaid (Reference: `Klinika.md` 3.5)

```typescript
// seed/other-paid.seed.ts
export async function seedOtherPaid(prisma: PrismaClient) {
  // Test OtherPaid yaratish (Chiqimlar)
  const outcomes = [
    {
      group_id: 1,  // Maoshlar
      type: 'OUTCOME' as const,
      amount: 5000000,
      description: 'Yanvar oyi maoshlar',
      payment_date: new Date('2024-01-31T10:00:00Z')
    },
    {
      group_id: 2,  // Kommunal to'lovlar
      type: 'OUTCOME' as const,
      amount: 1500000,
      description: 'Yanvar oyi kommunal to''lovlar',
      payment_date: new Date('2024-01-25T10:00:00Z')
    },
    {
      group_id: 3,  // Ijara
      type: 'OUTCOME' as const,
      amount: 1000000,
      description: 'Yanvar oyi ijara to''lovi',
      payment_date: new Date('2024-01-01T10:00:00Z')
    },
    {
      group_id: 4,  // Soliqlar
      type: 'OUTCOME' as const,
      amount: 800000,
      description: 'Chorak soliq to''lovi',
      payment_date: new Date('2024-01-15T10:00:00Z')
    }
  ];

  // Test OtherPaid yaratish (Kirimlar)
  const incomes = [
    {
      group_id: 10,  // Foiz daromadi
      type: 'INCOME' as const,
      amount: 500000,
      description: 'Bank foiz daromadi',
      payment_date: new Date('2024-01-31T10:00:00Z')
    },
    {
      group_id: 11,  // Sotuvdan tushum
      type: 'INCOME' as const,
      amount: 1500000,
      description: 'Dori-darmon sotuvidan tushum',
      payment_date: new Date('2024-01-20T10:00:00Z')
    }
  ];

  const allOtherPaid = [...outcomes, ...incomes];

  for (const otherPaid of allOtherPaid) {
    await prisma.otherPaid.create({  otherPaid });
  }

  console.log(`✅ OtherPaid seeded successfully (${allOtherPaid.length} records)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat OtherPaid
npm run seed:other-paid
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test OtherPaid o'chiriladi
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
// other-paid.service.spec.ts
describe('OtherPaidService', () => {
  let service: OtherPaidService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtherPaidService, PrismaService],
    }).compile();

    service = module.get<OtherPaidService>(OtherPaidService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new otherPaid successfully', async () => {
      const dto: CreateOtherPaidDto = {
        group_id: 1,
        type: 'OUTCOME',
        amount: 1500000,
        description: 'Test',
      };

      prisma.otherPaidGroup.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.otherPaid.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.amount).toBe(1500000);
      expect(prisma.otherPaid.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if amount <= 0', async () => {
      const dto: CreateOtherPaidDto = {
        type: 'OUTCOME',
        amount: 0,
      };

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if group not found', async () => {
      const dto: CreateOtherPaidDto = {
        group_id: 999,
        type: 'OUTCOME',
        amount: 1500000,
      };

      prisma.otherPaidGroup.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.create(dto, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated otherPaid', async () => {
      const query: GetOtherPaidQuery = { page: 1, limit: 20 };

      prisma.otherPaid.findMany = jest.fn().mockResolvedValue([]);
      prisma.otherPaid.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getSummary', () => {
    it('should return otherPaid summary', async () => {
      prisma.otherPaid.aggregate = jest.fn().mockResolvedValue({ _sum: { amount: 8000000 }, _count: { id: 25 } });
      prisma.otherPaid.groupBy = jest.fn().mockResolvedValue([]);
      prisma.otherPaidGroup.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getSummary(new Date('2024-01-01'), new Date('2024-01-31'));

      expect(result.outcome.total).toBeGreaterThan(0);
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
npx prisma migrate dev --name create_other_paid

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
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
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_other_paid_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_other_paid_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "other_paid_group_id_idx" ON "other_paid"("group_id");
CREATE INDEX "other_paid_type_idx" ON "other_paid"("type");
CREATE INDEX "other_paid_payment_date_idx" ON "other_paid"("payment_date");
CREATE INDEX "other_paid_deleted_at_idx" ON "other_paid"("deleted_at");
CREATE INDEX "other_paid_type_payment_date_idx" ON "other_paid"("type", "payment_date");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_other_paid"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "other_paid" CASCADE;
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
@@index([group_id])           // Guruh filter uchun
@@index([type])                // To'lov turi filter uchun
@@index([payment_date])        // Sana filter uchun (eng muhim)
@@index([deleted_at])          // Soft delete filter uchun
@@index([type, payment_date])  // Qo'shma index - to'lov turi va sana (hisobotlar uchun)
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| OtherPaid List | Redis | 2 daqiqa | OtherPaid create/delete |
| OtherPaid Summary | Redis | 10 daqiqa | OtherPaid create/delete |
| OtherPaid by Group | Redis | 5 daqiqa | OtherPaid create/delete |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const otherPaid = await prisma.otherPaid.findMany({
  select: { 
    id: true, 
    group_id: true, 
    amount: true,
    type: true,
    payment_date: true
  },
  where: { 
    deleted_at: null, 
    type: 'OUTCOME'
  },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const otherPaid = await prisma.otherPaid.findMany({
  where: { 
    type: 'OUTCOME',
    payment_date: {
      gte: new Date('2024-01-01'),
      lt: new Date('2024-01-31')
    },
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const otherPaid = await prisma.otherPaid.findMany();
```

### 10.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |
| Summary Calculation Time | < 500ms |

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `17-other-paid-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| ClientPaid RFC | `RFC-015-client-paid-management.md` | ✅ Tasdiqlandi |
| OtherPaidGroup RFC | `RFC-016-other-paid-group-management.md` | ✅ Tasdiqlandi |
| ServiceUser RFC | `RFC-018-service-user-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] OtherPaid yaratish guruh bilan bog'lanishi (optional)
- [ ] Payment type INCOME/OUTCOME qiymat qabul qilishi (Reference: `Klinika.md` 3.5)
- [ ] Summa musbat bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin/Accountant OtherPaid yaratish/o'zgartirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Faqat Admin OtherPaid o'chirish huquqiga ega
- [ ] Barcha moliyaviy rollar OtherPaid ro'yxatini ko'ra oladi
- [ ] Moliyaviy hisobot (summary) ishlaydi (Reference: `Klinika.md` 7.1)
- [ ] Kategoriya bo'yicha filterlash ishlaydi
- [ ] Pagination va filterlash ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull)
- [ ] Date range filter ishlaydi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 200ms
- [ ] Database query time < 100ms
- [ ] Unit test coverage ≥ 90%
- [ ] E2E test coverage ≥ 70%
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Documentation to'liq
- [ ] Concurrent users 50+ qo'llab-quvvatlanadi
- [ ] Data retention 5 yil
- [ ] Summary calculation time < 500ms

---

## 13. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Summa noto'g'ri kiritilishi | O'rta | Yuqori | Validation + Decimal type |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Data privacy concerns | Past | Yuqori | Data encryption + access control (Reference: `Klinika.md` 8.1) |
| Delete abuse | O'rta | Yuqori | Role-based access control (Admin only) |
| Summary calculation slow | Past | O'rta | Caching + optimized queries |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Budget planning per category | 🟡 Medium | Phase 3 |
| Expense statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| OtherPaid change history | 🟢 Low | Phase 4 |
| Category approval workflow | 🟢 Low | Phase 4 |
| Multi-branch category support | 🟢 Low | Phase 4 |
| Recurring expenses | 🟢 Low | Phase 4 |
| Bank integration | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |
| **Finance Audit** | Chief Accountant | __________ | _________ |

---

**RFC Versiyasi:** 1.0
**Status:** Draft
**Oxirgi Yangilanish:** 2024-01-15
**Reference Documents:** `klinika_prisma.txt`, `Klinika.md` (Sections 3.5, 4.2, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2)

---

## 📋 PHASE 2B HOLATI

| # | Model | Flow | RFC | Status |
|---|-------|------|-----|--------|
| 14 | `Payment` | ✅ | ✅ RFC-014 | ✅ Complete |
| 15 | `ClientPaid` | ✅ | ✅ RFC-015 | ✅ Complete |
| 16 | `OtherPaidGroup` | ✅ | ✅ RFC-016 | ✅ Complete |
| 17 | `OtherPaid` | ✅ | ✅ RFC-017 | ✅ Complete |
| 18 | `ServiceUser` | ⏳ | ⏳ | ⏳ **Oxirgi Model** |

**Keyingi qadam:** ServiceUser Management (Phase 2B ning oxirgi modeli)