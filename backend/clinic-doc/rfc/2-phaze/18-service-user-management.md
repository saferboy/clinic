# 📋 RFC-018: Shifokor Stavkalari Boshqaruvi (ServiceUser Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-018 |
| **Nomi** | ServiceUser Management |
| **Phase** | 2B - Finance (Oxirgi) |
| **Model** | `ServiceUser` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🟡 Medium (Finance - Core) |
| **Bog'liq RFC** | RFC-002 (User), RFC-011 (Service), RFC-013 (Visit) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.4, 4.3, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC shifokorlarga xizmatlar bo'yicha stavkalarni (komissiya) belgilash va boshqarish uchun to'liq texnik specifikatsiyani taqdim etadi. Har bir shifokor uchun har bir xizmat bo'yicha FIXED (fiksatsiya) yoki PERCENT (foiz) tipida stavka belgilash, shifokor daromadini hisoblash va moliyaviy hisobotlar uchun asos yaratish (Reference: `Klinika.md` 3.4, 4.3, 7.1).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ ServiceUser yaratish (Create) | ❌ Online to'lov integratsiyasi |
| ✅ ServiceUser ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ ServiceUser yangilash (Update) | ❌ Multi-currency support |
| ✅ ServiceUser o'chirish (Soft Delete) | ❌ Kelajakdagi modullar |
| ✅ Stavka turi (FIXED/PERCENT) | |
| ✅ Shifokor daromad hisoboti | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.4, 4.3, 7.1)
- Shifokor komissiyalarini markazlashtirilgan boshqarish
- FIXED va PERCENT tipidagi stavkalarni qo'llab-quvvatlash
- Shifokor daromadini avtomatik hisoblash
- Moliyaviy hisobotlarda shifokor kesimida statistika
- Shifokor yuklamasini optimallashtirish
- Xizmat ko'rsatish samaradorligini oshirish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model ServiceUser {
  id           Int             @id @default(autoincrement())
  service_id   Int?            @map("service_id")
  user_id      Int?            @map("user_id")
  type         ServiceUserType
  value        Decimal         @default(0) @db.Decimal(10, 2)
  status       RecordStatus    @default(ACTIVE)
  created_at   Timestamptz     @default(now())
  updated_at   Timestamptz     @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?           @map("registered_by")
  modified_by  Int?            @map("modified_by")

  // Relations
  service      Service?        @relation("fk_service_user_service", fields: [service_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  user         User?           @relation("fk_service_user_user", fields: [user_id], references: [id], onDelete: Cascade, onUpdate: Cascade)
  register_user User?          @relation("fk_service_user_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user  User?           @relation("fk_service_user_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([service_id])
  @@index([user_id])
  @@index([status])
  @@index([deleted_at])
  @@index([service_id, user_id])
  @@unique([service_id, user_id])
  @@map("service_users")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi |
| `service_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Service jadvaliga bog'lanish. Qaysi xizmat uchun stavka belgilanganligi (Reference: `Klinika.md` 3.4) |
| `user_id` | Int | ✅ | - | INTEGER | **Foreign Key**. User jadvaliga bog'lanish (Doctor roli). Qaysi shifokor uchun stavka belgilanganligi |
| `type` | Enum | ✅ | - | ServiceUserType | **Stavka turi**. FIXED (fiksatsiya summa), PERCENT (foiz). Shifokor daromadini hisoblash usuli (Reference: `Klinika.md` 3.4) |
| `value` | Decimal | ✅ | 0 | DECIMAL(10,2) | **Stavka qiymati**. FIXED uchun so'mda, PERCENT uchun foizda. 2 kasr belgigacha. Moliyaviy hisob-kitob uchun muhim (Reference: `Klinika.md` 9.2) |
| `status` | Enum | ✅ | ACTIVE | RecordStatus | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi stavka yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade. Audit uchun |

### 2.3 Enum Tuzilishi (Reference: `klinika_prisma.txt`)

#### ServiceUserType Enum
```prisma
enum ServiceUserType {
  FIXED    // ✅ Fiksatsiya summa (so'mda)
  PERCENT  // 💯 Foiz (xizmat narxidan %)
}
```

| Type | Tavsif | Misol | Hisoblash |
|------|--------|-------|-----------|
| `FIXED` | Fiksatsiya summa | 50,000 so'm har bir xizmat | Shifokor daromadi = value (Reference: `Klinika.md` 3.4) |
| `PERCENT` | Foiz | 30% xizmat narxidan | Shifokor daromadi = service.price × (value / 100) |

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([service_id])` | service_id | Xizmat bo'yicha filter qilishni tezlashtirish |
| `@@index([user_id])` | user_id | Shifokor bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv stavkalar) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([service_id, user_id])` | service_id, user_id | Qo'shma index - xizmat va shifokor bo'yicha (eng ko'p ishlatiladigan query) |
| `@@unique([service_id, user_id])` | service_id, user_id | Bir xizmat uchun bir shifokor - bitta stavka (duplicate oldini olish) |

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_service_user_service` | Service | N:1 | Cascade | Cascade | Service o'chirilganda ServiceUser yozuvlari o'chiriladi (stavka mavjud emas) |
| `fk_service_user_user` | User | N:1 | Cascade | Cascade | User (Doctor) o'chirilganda ServiceUser yozuvlari o'chiriladi |
| `fk_service_user_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_service_user_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |

### 2.6 Cascade Rules Tushunchasi

```
ServiceUser o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. ServiceUser.deleted_at = NOW()              │
│ 2. ServiceUser.status = 'INACTIVE'             │
│ 3. Moliyaviy tarix saqlanib qoladi             │
│ 4. Hisobotlarda ko'rinmaydi (deleted_at null)  │
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
| 1 | POST | `/api/v1/service-users` | ✅ JWT | Admin, Accountant | Yangi stavka yaratish |
| 2 | GET | `/api/v1/service-users` | ✅ JWT | Admin, Accountant, Doctor (faqat o'zi) | Stavkalar ro'yxatini olish |
| 3 | GET | `/api/v1/service-users/:id` | ✅ JWT | Admin, Accountant, Doctor (faqat o'zi) | Bitta stavka ma'lumotlari |
| 4 | PUT | `/api/v1/service-users/:id` | ✅ JWT | Admin, Accountant | Stavka yangilash |
| 5 | DELETE | `/api/v1/service-users/:id` | ✅ JWT | Admin | Stavka o'chirish (soft) |
| 6 | GET | `/api/v1/service-users/my` | ✅ JWT | Doctor | Shifokor o'z stavkalarini olish |
| 7 | GET | `/api/v1/service-users/commission/:doctorId` | ✅ JWT | Admin, Accountant, Doctor (faqat o'zi) | Shifokor daromad hisoboti |

---

### 3.2 POST /api/v1/service-users

**Tavsif:** Yangi ServiceUser stavka yaratish (Admin, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateServiceUserDto {
  service_id: number;     // Mavjud Service ID
  user_id: number;        // Mavjud User ID (Doctor roli)
  type: ServiceUserType;  // FIXED/PERCENT
  value: number;          // Stavka qiymati (so'm yoki foiz)
  status?: string;        // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "service_id": 1,
  "user_id": 2,
  "type": "PERCENT",
  "value": 30,
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Stavka muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "service": { "id": 1, "name": "Terapevt ko'rigi", "price": 100000 },
    "user": { "id": 2, "full_name": "Dr. John Smith" },
    "type": "PERCENT",
    "value": 30,
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// service-user.service.ts
async create(createServiceUserDto: CreateServiceUserDto, userId: number): Promise<ServiceUser> {
  // 1. Service mavjudligini tekshirish
  const service = await this.prisma.service.findUnique({
    where: { id: createServiceUserDto.service_id }
  });

  if (!service || service.deleted_at) {
    throw new NotFoundException('SU_001');
  }

  // 2. User mavjudligini va Doctor roli ekanligini tekshirish
  const user = await this.prisma.user.findUnique({
    where: { id: createServiceUserDto.user_id },
    include: { role: true }
  });

  if (!user || user.deleted_at || user.role?.name !== 'Doctor') {
    throw new NotFoundException('SU_002');
  }

  // 3. Unique constraint tekshiruvi (service_id + user_id)
  const existing = await this.prisma.serviceUser.findFirst({
    where: {
      service_id: createServiceUserDto.service_id,
      user_id: createServiceUserDto.user_id,
      deleted_at: null
    }
  });

  if (existing) {
    throw new ConflictException('SU_003');
  }

  // 4. Value validatsiya (PERCENT uchun max 100)
  if (createServiceUserDto.type === 'PERCENT' && createServiceUserDto.value > 100) {
    throw new BadRequestException('SU_004');
  }

  // 5. Stavka yaratish
  const serviceUser = await this.prisma.serviceUser.create({
     {
      service_id: createServiceUserDto.service_id,
      user_id: createServiceUserDto.user_id,
      type: createServiceUserDto.type,
      value: createServiceUserDto.value,
      status: createServiceUserDto.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      service: { select: { id: true, name: true, price: true } },
      user: { select: { id: true, full_name: true } }
    }
  });

  return serviceUser;
}
```

---

### 3.3 GET /api/v1/service-users

**Tavsif:** ServiceUser stavkalari ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `service_id` | number | - | Xizmat bo'yicha filter |
| `user_id` | number | - | Shifokor bo'yicha filter |
| `type` | ServiceUserType | - | Stavka turi bo'yicha filter (FIXED/PERCENT) |
| `status` | string | - | Status bo'yicha filter |
| `sortBy` | string | created_at | Sort maydoni |
| `sortOrder` | string | desc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/service-users?page=1&limit=20&service_id=1&user_id=2&type=PERCENT&status=ACTIVE
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "service": { "id": 1, "name": "Terapevt ko'rigi", "price": 100000 },
      "user": { "id": 2, "full_name": "Dr. John Smith" },
      "type": "PERCENT",
      "value": 30,
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "service": { "id": 2, "name": "UZI tekshiruvi", "price": 150000 },
      "user": { "id": 2, "full_name": "Dr. John Smith" },
      "type": "FIXED",
      "value": 50000,
      "status": "ACTIVE",
      "created_at": "2024-01-15T11:00:00.000Z"
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
async findAll(query: GetServiceUsersQuery, currentUserId: number, currentUserRole: string): Promise<PaginatedResult<ServiceUser>> {
  const where: any = { deleted_at: null };

  // Doctor bo'lsa, faqat o'z stavkalarini ko'radi
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
    where.user_id = currentUserId;
  }

  // Service filter
  if (query.service_id) {
    where.service_id = query.service_id;
  }

  // User filter (Admin/Accountant uchun)
  if (query.user_id && (currentUserRole === 'Admin' || currentUserRole === 'Accountant')) {
    where.user_id = query.user_id;
  }

  // Type filter
  if (query.type) {
    where.type = query.type;
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
    this.prisma.serviceUser.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        service: { select: { id: true, name: true, price: true } },
        user: { select: { id: true, full_name: true } }
      }
    }),
    this.prisma.serviceUser.count({ where })
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

### 3.4 GET /api/v1/service-users/commission/:doctorId

**Tavsif:** Shifokor daromad hisoboti (Admin, Accountant, Doctor)

**Query Params:**
```
GET /api/v1/service-users/commission/2?date_from=2024-01-01&date_to=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "doctor": { "id": 2, "full_name": "Dr. John Smith" },
    "period": {
      "from": "2024-01-01",
      "to": "2024-01-31"
    },
    "details": [
      {
        "visitServiceId": 1,
        "serviceName": "Terapevt ko'rigi",
        "servicePrice": 100000,
        "quantity": 1,
        "commissionType": "PERCENT",
        "commissionValue": 30,
        "commission": 30000,
        "visitDate": "2024-01-15T10:00:00.000Z"
      },
      {
        "visitServiceId": 2,
        "serviceName": "UZI tekshiruvi",
        "servicePrice": 150000,
        "quantity": 1,
        "commissionType": "FIXED",
        "commissionValue": 50000,
        "commission": 50000,
        "visitDate": "2024-01-16T10:00:00.000Z"
      }
    ],
    "totalCommission": 80000,
    "serviceCount": 2
  }
}
```

**Service Layer Implementation:**
```typescript
async calculateDoctorCommission(
  doctorId: number, 
  dateFrom: Date, 
  dateTo: Date,
  currentUserId: number,
  currentUserRole: string
): Promise<DoctorCommissionReport> {
  // 1. Doctor faqat o'z hisobotini ko'ra oladi
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant' && currentUserId !== doctorId) {
    throw new ForbiddenException('SU_007');
  }

  // 2. Doctorning VisitService yozuvlarini olish
  const visitServices = await this.prisma.visitService.findMany({
    where: {
      deleted_at: null,
      visit: {
        doctor_id: doctorId,
        deleted_at: null,
        visit_date: {
          gte: dateFrom,
          lt: new Date(dateTo.setHours(23, 59, 59, 999))
        }
      }
    },
    include: {
      service: { select: { id: true, name: true, price: true } },
      visit: { select: { id: true, visit_date: true, status: true } }
    }
  });

  // 3. Har bir xizmat uchun stavkani olish va komissiya hisoblash
  const commissionDetails = await Promise.all(
    visitServices.map(async (vs) => {
      const serviceUser = await this.prisma.serviceUser.findFirst({
        where: {
          service_id: vs.service_id,
          user_id: doctorId,
          status: 'ACTIVE',
          deleted_at: null
        }
      });

      // 4. Komissiya hisoblash
      let commission = 0;
      if (serviceUser) {
        if (serviceUser.type === 'FIXED') {
          commission = serviceUser.value.toNumber();
        } else if (serviceUser.type === 'PERCENT') {
          commission = vs.service.price.toNumber() * (serviceUser.value.toNumber() / 100);
        }
      }

      return {
        visitServiceId: vs.id,
        serviceName: vs.service.name,
        servicePrice: vs.service.price.toNumber(),
        quantity: vs.quantity,
        commissionType: serviceUser?.type || 'NONE',
        commissionValue: serviceUser?.value.toNumber() || 0,
        commission: commission * vs.quantity,
        visitDate: vs.visit.visit_date
      };
    })
  );

  // 5. Jami komissiya hisoblash
  const totalCommission = commissionDetails.reduce((sum, item) => sum + item.commission, 0);

  // 6. Doctor ma'lumotlarini olish
  const doctor = await this.prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, full_name: true }
  });

  return {
    doctorId,
    doctor,
    period: {
      from: dateFrom,
      to: dateTo
    },
    details: commissionDetails,
    totalCommission,
    serviceCount: commissionDetails.length
  };
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-service-user.dto.ts
import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  Min,
  Max,
  IsDecimal
} from 'class-validator';

export enum ServiceUserTypeEnum {
  FIXED = 'FIXED',
  PERCENT = 'PERCENT'
}

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export class CreateServiceUserDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  service_id: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  user_id: number;

  @IsEnum(ServiceUserTypeEnum)
  @IsNotEmpty()
  type: ServiceUserTypeEnum;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  value: number;

  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}

// update-service-user.dto.ts
export class UpdateServiceUserDto {
  @IsOptional()
  @IsEnum(ServiceUserTypeEnum)
  type?: ServiceUserTypeEnum;

  @IsOptional()
  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  @Max(100)
  value?: number;

  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `service_id` | Required | SU_001 | Xizmat majburiy |
| `service_id` | Must Exist | SU_001 | Xizmat topilmadi |
| `user_id` | Required | SU_002 | Shifokor majburiy |
| `user_id` | Must Exist | SU_002 | Shifokor topilmadi |
| `user_id` | Role Check | SU_002 | Foydalanuvchi Doctor roli emas |
| `type` | Required | SU_003 | Stavka turi majburiy |
| `type` | Enum | SU_003 | FIXED/PERCENT |
| `value` | Required | SU_004 | Stavka qiymati majburiy |
| `value` | Min 0 | SU_004 | Stavka qiymati manfiy bo'lishi mumkin emas |
| `value` | Max 100 (PERCENT) | SU_004 | Foiz 100 dan oshmasligi kerak |
| `service_id + user_id` | Unique | SU_005 | Bu xizmat uchun shifokor allaqachon stavka belgilagan |
| `status` | Enum | SU_006 | ACTIVE/INACTIVE/ARCHIVED |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `SU_001` | 404 Not Found | Xizmat topilmadi | Service ID not exists | Service ID ni tekshiring |
| `SU_002` | 404 Not Found | Shifokor topilmadi | User ID not exists yoki role !== Doctor | User ID va rolni tekshiring |
| `SU_003` | 400 Bad Request | Stavka turi noto'g'ri | Validation failed | FIXED/PERCENT |
| `SU_004` | 400 Bad Request | Stavka qiymati noto'g'ri | value < 0 yoki PERCENT > 100 | 0-100 orasida qiymat kiriting |
| `SU_005` | 409 Conflict | Bu xizmat uchun shifokor allaqachon stavka belgilagan | Unique constraint (service_id + user_id) | Mavjud stavkani yangilang |
| `SU_006` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | ACTIVE/INACTIVE/ARCHIVED |
| `SU_007` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `SU_008` | 404 Not Found | Stavka topilmadi | ServiceUser ID not exists | ID ni tekshiring |

### 5.2 Exception Filter

```typescript
// service-user-exception.filter.ts
@Catch()
export class ServiceUserExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'SU_005';
    if (exception instanceof NotFoundException) return 'SU_008';
    if (exception instanceof ForbiddenException) return 'SU_007';
    if (exception instanceof BadRequestException) return 'SU_004';
    return 'SU_008';
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
| POST /service-users | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /service-users | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| GET /service-users/:id | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| GET /service-users/my | ❌ | ✅ | ❌ | ❌ | ❌ |
| GET /service-users/commission/:id | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| PUT /service-users/:id | ✅ | ❌ | ❌ | ❌ | ✅ |
| DELETE /service-users/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Moliyaviy Xavfsizlik (Reference: `Klinika.md` 8.1, 9.2)
- ✅ Barcha summalar Decimal(10,2) formatda (Reference: `Klinika.md` 9.2)
- ✅ Stavka qiymati musbat bo'lishi kerak
- ✅ PERCENT type uchun max 100
- ✅ Moliyaviy operatsiyalar audit qilinadi
- ✅ Delete faqat Admin tomonidan amalga oshiriladi
- ✅ Doctor faqat o'z stavkalarini ko'ra oladi (Reference: `Klinika.md` 6.1)

---

## 7. SEED DATA

### 7.1 Test ServiceUser (Reference: `Klinika.md` 3.4)

```typescript
// seed/service-user.seed.ts
export async function seedServiceUsers(prisma: PrismaClient) {
  // Test ServiceUser yaratish
  const serviceUsers = [
    {
      service_id: 1,  // Terapevt ko'rigi
      user_id: 2,     // Dr. John Smith
      type: 'PERCENT' as const,
      value: 30,      // 30%
      status: 'ACTIVE' as const
    },
    {
      service_id: 2,  // UZI tekshiruvi
      user_id: 2,     // Dr. John Smith
      type: 'FIXED' as const,
      value: 50000,   // 50,000 so'm
      status: 'ACTIVE' as const
    },
    {
      service_id: 1,  // Terapevt ko'rigi
      user_id: 3,     // Dr. Jane Doe
      type: 'PERCENT' as const,
      value: 25,      // 25%
      status: 'ACTIVE' as const
    },
    {
      service_id: 3,  // Stomatolog ko'rigi
      user_id: 4,     // Dr. Bob Johnson
      type: 'FIXED' as const,
      value: 60000,   // 60,000 so'm
      status: 'ACTIVE' as const
    }
  ];

  for (const serviceUser of serviceUsers) {
    await prisma.serviceUser.create({  serviceUser });
  }

  console.log(`✅ ServiceUsers seeded successfully (${serviceUsers.length} records)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat ServiceUser
npm run seed:service-users
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Test ServiceUser o'chiriladi
- [ ] Moliyaviy ma'lumotlar konfidensialligi ta'minlanadi
- [ ] Backup qilish rejasi tayyor
- [ ] Shifokor stavkalari tekshiriladi

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
// service-user.service.spec.ts
describe('ServiceUserService', () => {
  let service: ServiceUserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceUserService, PrismaService],
    }).compile();

    service = module.get<ServiceUserService>(ServiceUserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new serviceUser successfully', async () => {
      const dto: CreateServiceUserDto = {
        service_id: 1,
        user_id: 2,
        type: 'PERCENT',
        value: 30,
      };

      prisma.service.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, role: { name: 'Doctor' }, deleted_at: null });
      prisma.serviceUser.findFirst = jest.fn().mockResolvedValue(null);
      prisma.serviceUser.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.value).toBe(30);
      expect(prisma.serviceUser.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if serviceUser exists', async () => {
      const dto: CreateServiceUserDto = {
        service_id: 1,
        user_id: 2,
        type: 'PERCENT',
        value: 30,
      };

      prisma.service.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, role: { name: 'Doctor' }, deleted_at: null });
      prisma.serviceUser.findFirst = jest.fn().mockResolvedValue({ id: 1 });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if PERCENT value > 100', async () => {
      const dto: CreateServiceUserDto = {
        service_id: 1,
        user_id: 2,
        type: 'PERCENT',
        value: 150,
      };

      prisma.service.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, role: { name: 'Doctor' }, deleted_at: null });

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated serviceUsers', async () => {
      const query: GetServiceUsersQuery = { page: 1, limit: 20 };

      prisma.serviceUser.findMany = jest.fn().mockResolvedValue([]);
      prisma.serviceUser.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll(query, 1, 'Admin');

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should filter by user_id for Doctor role', async () => {
      const query: GetServiceUsersQuery = { page: 1, limit: 20 };

      await service.findAll(query, 2, 'Doctor');

      expect(prisma.serviceUser.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: 2,
            deleted_at: null
          })
        })
      );
    });
  });

  describe('calculateDoctorCommission', () => {
    it('should return doctor commission report', async () => {
      prisma.visitService.findMany = jest.fn().mockResolvedValue([
        {
          id: 1,
          service: { id: 1, name: 'Terapevt ko\'rigi', price: 100000 },
          quantity: 1,
          visit: { visit_date: new Date('2024-01-15') }
        }
      ]);
      prisma.serviceUser.findFirst = jest.fn().mockResolvedValue({ type: 'PERCENT', value: 30 });

      const result = await service.calculateDoctorCommission(2, new Date('2024-01-01'), new Date('2024-01-31'), 2, 'Doctor');

      expect(result.totalCommission).toBe(30000);
      expect(result.serviceCount).toBe(1);
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_service_user

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Enum
CREATE TYPE "ServiceUserType" AS ENUM ('FIXED', 'PERCENT');

-- Create ServiceUser Table
CREATE TABLE "service_users" (
  "id" SERIAL PRIMARY KEY,
  "service_id" INTEGER,
  "user_id" INTEGER,
  "type" "ServiceUserType" NOT NULL,
  "value" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_service_user_service" 
    FOREIGN KEY ("service_id") 
    REFERENCES "services"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_service_user_user" 
    FOREIGN KEY ("user_id") 
    REFERENCES "users"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_service_user_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_service_user_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "service_users_service_id_idx" ON "service_users"("service_id");
CREATE INDEX "service_users_user_id_idx" ON "service_users"("user_id");
CREATE INDEX "service_users_status_idx" ON "service_users"("status");
CREATE INDEX "service_users_deleted_at_idx" ON "service_users"("deleted_at");
CREATE INDEX "service_users_service_id_user_id_idx" ON "service_users"("service_id", "user_id");
CREATE UNIQUE INDEX "service_users_service_id_user_id_key" ON "service_users"("service_id", "user_id");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_service_user"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "service_users" CASCADE;
DROP TYPE IF EXISTS "ServiceUserType" CASCADE;
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
- [ ] Shifokor stavkalari tekshirildi

---

## 10. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 10.1 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
@@index([service_id])           // Xizmat filter uchun
@@index([user_id])              // Shifokor filter uchun
@@index([status])               // Status filter uchun
@@index([deleted_at])           // Soft delete filter uchun
@@index([service_id, user_id])  // Qo'shma index - xizmat va shifokor (eng muhim)
@@unique([service_id, user_id]) // Unique constraint - duplicate oldini olish
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| ServiceUser List | Redis | 5 daqiqa | ServiceUser create/update/delete |
| Single ServiceUser | Redis | 2 daqiqa | ServiceUser update/delete |
| Doctor Commission | Redis | 10 daqiqa | VisitService create/update |
| ServiceUser by Doctor | Redis | 5 daqiqa | ServiceUser create/update |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar
const serviceUsers = await prisma.serviceUser.findMany({
  select: { 
    id: true, 
    service_id: true, 
    user_id: true,
    type: true,
    value: true
  },
  where: { 
    deleted_at: null, 
    status: 'ACTIVE'
  },
  take: 50
});

// ✅ Yaxshi - Qo'shma index ishlatish
const serviceUsers = await prisma.serviceUser.findMany({
  where: { 
    user_id: 2,
    status: 'ACTIVE',
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const serviceUsers = await prisma.serviceUser.findMany();
```

### 10.4 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat |
|-------------|--------|
| API Response Time | < 200ms |
| Database Query Time | < 100ms |
| Concurrent Users | 50+ |
| Data Retention | 5 yil |
| Commission Calculation Time | < 500ms |

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `18-service-user-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Service RFC | `RFC-011-service-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Stavka yaratish service va user bilan bog'lanishi
- [ ] ServiceUser type FIXED/PERCENT qiymat qabul qilishi (Reference: `Klinika.md` 3.4)
- [ ] Stavka qiymati musbat bo'lishi
- [ ] PERCENT type uchun max 100
- [ ] Unique constraint (service_id + user_id) ishlashi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin/Accountant stavka yaratish/o'zgartirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Faqat Admin stavka o'chirish huquqiga ega
- [ ] Doctor faqat o'z stavkalarini ko'ra oladi
- [ ] Shifokor daromad hisoboti ishlaydi (Reference: `Klinika.md` 7.1)
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
- [ ] Commission calculation time < 500ms

---

## 13. RISKLAR VA YECHIMLAR (Reference: `Klinika.md` 8)

| Risk | Ehtimollik | Ta'sir | Yechim |
|------|------------|--------|--------|
| Stavka qiymati noto'g'ri kiritilishi | O'rta | Yuqori | Validation + Decimal type |
| Duplicate stavka | O'rta | O'rta | Unique constraint (service_id + user_id) |
| Cascade delete muammolari | O'rta | O'rta | Cascade delete + warning logs |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |
| Data privacy concerns | Past | Yuqori | Data encryption + access control (Reference: `Klinika.md` 8.1) |
| Commission calculation slow | Past | O'rta | Caching + optimized queries |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Tiered commission rates | 🟡 Medium | Phase 3 |
| Commission statistics dashboard | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Bulk import/export | 🟢 Low | Phase 3 |
| ServiceUser change history | 🟢 Low | Phase 4 |
| Minimum guaranteed commission | 🟢 Low | Phase 4 |
| Team-based commission | 🟢 Low | Phase 4 |
| Commission approval workflow | 🟢 Low | Phase 4 |

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
**Reference Documents:** `klinika_prisma.txt`, `Klinika.md` (Sections 3.4, 4.3, 5.1, 5.2, 6.1, 7.1, 8.1, 9.1, 9.2)

---

## 📋 PHASE 2B - YAKUNLANDI! 🎉

| # | Model | Flow | RFC | Status |
|---|-------|------|-----|--------|
| 14 | `Payment` | ✅ | ✅ RFC-014 | ✅ Complete |
| 15 | `ClientPaid` | ✅ | ✅ RFC-015 | ✅ Complete |
| 16 | `OtherPaidGroup` | ✅ | ✅ RFC-016 | ✅ Complete |
| 17 | `OtherPaid` | ✅ | ✅ RFC-017 | ✅ Complete |
| 18 | `ServiceUser` | ✅ | ✅ **RFC-018** | ✅ **Complete** |

**Phase 2B: 100% Complete** 🎉

---

## 📊 LOYIHA UMUMIY HOLATI

| Phase | Modellar | Flow | RFC | % Complete |
|-------|----------|------|-----|------------|
| **Phase 1** (Foundation) | 8 ta | ✅ 8/8 | ✅ 8/8 | 🟢 100% |
| **Phase 2A** (Core Entities) | 5 ta | ✅ 5/5 | ✅ 5/5 | 🟢 100% |
| **Phase 2B** (Finance) | 5 ta | ✅ 5/5 | ✅ 5/5 | 🟢 100% |
| **JAMI** | **18 ta** | ✅ **18/18** | ✅ **18/18** | 🟢 **100%** |

---