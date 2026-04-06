# 📋 RFC-010: Xonalar Boshqaruvi (Room Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-010 |
| **Nomi** | Room Management |
| **Phase** | 2A - Core Entities |
| **Model** | `Room` |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlagan** | _______________ |
| **Prioritet** | 🟡 Medium (Core Entities) |
| **Bog'liq RFC** | RFC-002 (User), RFC-007 (Department), RFC-012 (VisitRoom) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.6, 5.2, 6.1, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinika xonalarini (kabinetlarini) boshqarish, ularning bandlik holatini kuzatish va visitlar uchun xona ajratish uchun to'liq texnik specifikatsiyani taqdim etadi. Har bir xonani bo'limga biriktirish, xona statusini real-time kuzatish va hisobotlarda xona bandligi statistikasini olish uchun reference ma'lumotlar bazasini yaratish (Reference: `Klinika.md` 3.6).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Xona yaratish (Create) | ❌ Xona bandligi real-time monitoring |
| ✅ Xona ro'yxatini olish (Read) | ❌ Frontend implementatsiya |
| ✅ Xona yangilash (Update) | ❌ IoT integratsiya (aqlli xonalar) |
| ✅ Xona o'chirish - Soft Delete | ❌ Third-party integratsiya |
| ✅ Xona status boshqaruvi | |
| ✅ Xona bandligini kuzatish | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 3.6)
- Klinika xonalarini markazlashtirilgan boshqarish
- Xona bandligini real-time kuzatish (AVAILABLE/OCCUPIED/MAINTENANCE/CLOSED)
- Visitlar uchun xona ajratish jarayonini avtomatlashtirish
- Xona ishlatish samaradorligini oshirish (occupancy rate)
- Hisobotlarda xona bandligi statistikasini olish
- Bo'limlar kesimida xona taqsimotini boshqarish
- Ta'mirlash va texnik xizmat ko'rsatish jarayonlarini kuzatish

---

## 2. PRISMA MODEL

### 2.1 To'liq Model Schema (Reference: `klinika_prisma.txt`)

```prisma
model Room {
  id            Int            @id @default(autoincrement())
  department_id Int?           @map("department_id")
  name          String         @db.VarChar(100)
  room_number   String?        @db.VarChar(20) @map("room_number")
  status        RoomStatus     @default(AVAILABLE)
  description   String?        @db.Text
  record_status RecordStatus   @default(ACTIVE)
  created_at    Timestamptz    @default(now())
  updated_at    Timestamptz    @updatedAt
  deleted_at    Timestamptz?
  registered_by Int?           @map("registered_by")
  modified_by   Int?           @map("modified_by")

  // Relations
  department    Department?    @relation("fk_room_department", fields: [department_id], references: [id], onDelete: SetNull, onUpdate: Cascade)
  register_user User?          @relation("fk_room_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?          @relation("fk_room_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  visit_rooms   VisitRoom[]    @relation("fk_visit_room_room")

  @@index([department_id])
  @@index([status])
  @@index([record_status])
  @@index([deleted_at])
  @@index([department_id, status])
  @@map("rooms")
}
```

### 2.2 Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. VisitRoom jadvali bilan bog'lanish uchun ishlatiladi |
| `department_id` | Int | ❌ | null | INTEGER | **Foreign Key**. Department jadvaliga bog'lanish. SetNull cascade - bo'lim o'chirilganda null bo'ladi. Xona qaysi bo'limga tegishli ekanligini ko'rsatadi (Reference: `Klinika.md` 3.4) |
| `name` | String | ✅ | - | VARCHAR(100) | **Xona nomi**. 3-100 belgi. Misol: "Terapiya Kabineti 1", "Operatsiya Xonasi 2". Lotin va Kirill harflari ruxsat etiladi |
| `room_number` | String | ❌ | null | VARCHAR(20) | **Xona raqami**. Binodagi fizik raqam. Misol: "101", "205A". Qidiruv va identifikatsiya uchun (Reference: `Klinika.md` 9.2) |
| `status` | Enum | ✅ | AVAILABLE | RoomStatus | **Xona holati**. AVAILABLE (bo'sh), OCCUPIED (band), MAINTENANCE (ta'mirlash), CLOSED (yopiq). Real-time bandlikni ko'rsatadi (Reference: `Klinika.md` 3.6) |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi. Xona haqida qo'shimcha ma'lumot (jihozlar, sig'im va h.k.) |
| `record_status` | Enum | ✅ | ACTIVE | RecordStatus | **Yozuv holati**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Xona ro'yxatda ko'rinishi uchun |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim (Reference: `Klinika.md` 5.2) |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi (Reference: `Klinika.md` 8.1) |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun (Reference: `Klinika.md` 5.2) |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun |

### 2.3 Enum Tuzilishi (Reference: `klinika_prisma.txt`)

#### RoomStatus Enum
```prisma
enum RoomStatus {
  AVAILABLE      // ✅ Bo'sh - foydalanishga tayyor
  OCCUPIED       // ⏸️ Band - bemor bor
  MAINTENANCE    // 🔧 Ta'mirlanmoqda
  CLOSED         // 🚫 Yopiq - foydalanish mumkin emas
}
```

| Status | Tavsif | Qachon Ishlatiladi |
|--------|--------|-------------------|
| `AVAILABLE` | Xona bo'sh, foydalanishga tayyor | Yangi xona yaratilganda default. Receptionist xonani bemorga ajratishi mumkin (Reference: `Klinika.md` 3.6) |
| `OCCUPIED` | Xona band, bemor bor | Visit boshlanganda status OCCUPIED ga o'zgaradi. VisitRoom status IN_USE bo'lganda |
| `MAINTENANCE` | Xona ta'mirlanmoqda | Jihozlar buzilganda yoki tozalash ishlarida. Foydalanish mumkin emas |
| `CLOSED` | Xona yopiq, foydalanish mumkin emas | Uzoq muddatli ta'mir yoki boshqa sabablar uchun |

#### RecordStatus Enum
```prisma
enum RecordStatus {
  ACTIVE      // ✅ Faol - xona ro'yxatda ko'rinadi
  INACTIVE    // ⏸️ Nofaol - xona vaqtincha o'chirilgan
  ARCHIVED    // 📦 Arxiv - xona tarix uchun saqlangan
}
```

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([department_id])` | department_id | Bo'lim bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Xona statusi bo'yicha filter qilishni tezlashtirish (eng ko'p ishlatiladi) |
| `@@index([record_status])` | record_status | Yozuv holati bo'yicha filter qilish |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun |
| `@@index([department_id, status])` | department_id, status | Qo'shma index - bo'lim va status bo'yicha filter (bo'sh xonalarni qidirish uchun eng muhim) |

### 2.5 Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_room_department` | Department | N:1 | SetNull | Cascade | Bo'lim o'chirilganda xonaning department_id NULL ga o'zgaradi. Xona ma'lumoti saqlanib qoladi |
| `fk_room_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_room_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanib qoladi |
| `fk_visit_room_room` | VisitRoom | 1:N | Cascade | Cascade | Xona o'chirilganda VisitRoom yozuvlari o'chiriladi (active visitlar uchun muhim) |

### 2.6 Cascade Rules Tushunchasi

```
Xona o'chirilganda (Soft Delete):
┌─────────────────────────────────────────────────┐
│ 1. Room.record_status = 'INACTIVE'             │
│ 2. Room.status = 'CLOSED'                      │
│ 3. Room.deleted_at = NOW()                     │
│ 4. VisitRoom yozuvlari tekshiriladi            │
│ 5. Active visit bo'lsa - o'chirish taqiqlanadi │
└─────────────────────────────────────────────────┘

⚠️ Muhim: Fizik delete qilinmaydi! Barcha ma'lumotlar 
saqlanib qoladi, faqat status o'zgaradi. (Reference: Klinika.md 8.1)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | POST | `/api/v1/rooms` | ✅ JWT | Admin | Yangi xona yaratish |
| 2 | GET | `/api/v1/rooms` | ✅ JWT | Barchasi | Xonalar ro'yxatini olish |
| 3 | GET | `/api/v1/rooms/available` | ✅ JWT | Admin, Receptionist, Doctor | Bo'sh xonalarni olish |
| 4 | GET | `/api/v1/rooms/:id` | ✅ JWT | Barchasi | Bitta xona ma'lumotlari |
| 5 | PUT | `/api/v1/rooms/:id` | ✅ JWT | Admin | Xona yangilash |
| 6 | PUT | `/api/v1/rooms/:id/status` | ✅ JWT | Admin, Receptionist | Xona status o'zgartirish |
| 7 | DELETE | `/api/v1/rooms/:id` | ✅ JWT | Admin | Xona o'chirish (soft) |

---

### 3.2 POST /api/v1/rooms

**Tavsif:** Admin tomonidan yangi xona yaratish

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateRoomDto {
  name: string;         // 3-100 belgi
  room_number?: string; // 0-20 belgi
  department_id?: number; // Mavjud Department ID
  status?: RoomStatus;  // AVAILABLE/OCCUPIED/MAINTENANCE/CLOSED
  description?: string; // 0-255 belgi
  record_status?: string; // ACTIVE/INACTIVE/ARCHIVED
}
```

**Request Body Example:**
```json
{
  "name": "Terapiya Kabineti 1",
  "room_number": "101",
  "department_id": 1,
  "status": "AVAILABLE",
  "description": "2 ta karavot, kompyuter",
  "record_status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Xona muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Terapiya Kabineti 1",
    "room_number": "101",
    "department": { "id": 1, "name": "Terapiya" },
    "status": "AVAILABLE",
    "description": "2 ta karavot, kompyuter",
    "record_status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**Service Layer Implementation:**
```typescript
// room.service.ts
async create(createRoomDto: CreateRoomDto, userId: number): Promise<Room> {
  // 1. Department mavjudligini tekshirish (agar kiritilgan bo'lsa)
  if (createRoomDto.department_id) {
    const department = await this.prisma.department.findUnique({
      where: { id: createRoomDto.department_id }
    });
    if (!department || department.deleted_at) {
      throw new NotFoundException('ROOM_001');
    }
  }

  // 2. Name unikal ekanligini tekshirish (bo'lim ichida)
  const existing = await this.prisma.room.findFirst({
    where: {
      name: createRoomDto.name,
      department_id: createRoomDto.department_id || null,
      deleted_at: null
    }
  });

  if (existing) {
    throw new ConflictException('ROOM_002');
  }

  // 3. Room number unikal ekanligini tekshirish (agar kiritilgan bo'lsa)
  if (createRoomDto.room_number) {
    const existingNumber = await this.prisma.room.findFirst({
      where: {
        room_number: createRoomDto.room_number,
        department_id: createRoomDto.department_id || null,
        deleted_at: null
      }
    });

    if (existingNumber) {
      throw new ConflictException('ROOM_003');
    }
  }

  // 4. Xona yaratish
  const room = await this.prisma.room.create({
     {
      name: createRoomDto.name,
      room_number: createRoomDto.room_number,
      department_id: createRoomDto.department_id,
      status: createRoomDto.status || 'AVAILABLE',
      description: createRoomDto.description,
      record_status: createRoomDto.record_status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    },
    include: {
      department: { select: { id: true, name: true } }
    }
  });

  return room;
}
```

---

### 3.3 GET /api/v1/rooms

**Tavsif:** Xonalar ro'yxatini olish (pagination bilan)

**Query Parameters:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 20 | Sahifadagi elementlar soni (max 100) |
| `department_id` | number | - | Bo'lim bo'yicha filter |
| `status` | RoomStatus | - | Status bo'yicha filter (AVAILABLE/OCCUPIED/etc.) |
| `record_status` | string | - | Yozuv holati bo'yicha filter |
| `search` | string | - | Nomi yoki raqami bo'yicha qidiruv |
| `sortBy` | string | name | Sort maydoni |
| `sortOrder` | string | asc | Sort tartibi (asc/desc) |

**Request Example:**
```http
GET /api/v1/rooms?page=1&limit=20&department_id=1&status=AVAILABLE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Terapiya Kabineti 1",
      "room_number": "101",
      "department": { "id": 1, "name": "Terapiya" },
      "status": "AVAILABLE",
      "record_status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visit_rooms": 0 }
    },
    {
      "id": 2,
      "name": "Terapiya Kabineti 2",
      "room_number": "102",
      "department": { "id": 1, "name": "Terapiya" },
      "status": "OCCUPIED",
      "record_status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "visit_rooms": 1 }
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
async findAll(query: GetRoomsQuery): Promise<PaginatedResult<Room>> {
  const where: any = { deleted_at: null };

  // Department filter
  if (query.department_id) {
    where.department_id = query.department_id;
  }

  // Status filter
  if (query.status) {
    where.status = query.status;
  }

  // Record Status filter
  if (query.record_status) {
    where.record_status = query.record_status;
  }

  // Search filter
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { room_number: { contains: query.search, mode: 'insensitive' } }
    ];
  }

  // Pagination (Reference: Klinika.md 9.1)
  const skip = (query.page - 1) * query.limit;
  const take = Math.min(query.limit, 100);

  // Sorting
  const orderBy = {
    [query.sortBy || 'name']: query.sortOrder || 'asc'
  };

  const [data, total] = await Promise.all([
    this.prisma.room.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        department: { select: { id: true, name: true } },
        _count: {
          select: { 
            visit_rooms: { 
              where: { 
                status: 'IN_USE',
                deleted_at: null 
              } 
            } 
          }
        }
      }
    }),
    this.prisma.room.count({ where })
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

### 3.4 GET /api/v1/rooms/available

**Tavsif:** Bo'sh xonalarni olish (Receptionist uchun)

**Query Parameters:**
| Param | Tip | Majburiy | Tavsif |
|-------|-----|----------|--------|
| `department_id` | number | ❌ | Bo'lim bo'yicha filter |
| `limit` | number | ❌ | Natijalar soni (default: 10, max: 50) |

**Request Example:**
```http
GET /api/v1/rooms/available?department_id=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Terapiya Kabineti 1",
      "room_number": "101",
      "status": "AVAILABLE"
    },
    {
      "id": 3,
      "name": "Terapiya Kabineti 3",
      "room_number": "103",
      "status": "AVAILABLE"
    }
  ]
}
```

**Service Layer Implementation:**
```typescript
async findAvailable(query: { department_id?: number; limit?: number }): Promise<Room[]> {
  const where: any = {
    status: 'AVAILABLE',
    record_status: 'ACTIVE',
    deleted_at: null
  };

  if (query.department_id) {
    where.department_id = query.department_id;
  }

  const take = Math.min(query.limit || 10, 50);

  return this.prisma.room.findMany({
    where,
    take,
    select: {
      id: true,
      name: true,
      room_number: true,
      status: true
    },
    orderBy: { name: 'asc' }
  });
}
```

---

### 3.5 PUT /api/v1/rooms/:id/status

**Tavsif:** Xona status o'zgartirish (Admin, Receptionist)

**Request Body:**
```json
{
  "status": "OCCUPIED",
  "reason": "Visit boshlandi"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Xona status muvaffaqiyatli o'zgartirildi",
  "data": {
    "id": 1,
    "name": "Terapiya Kabineti 1",
    "status": "OCCUPIED",
    "updated_at": "2024-01-15T12:00:00.000Z"
  }
}
```

**Service Layer Implementation:**
```typescript
async updateStatus(id: number, updateRoomStatusDto: UpdateRoomStatusDto, userId: number): Promise<Room> {
  // 1. Xona mavjudligini tekshirish
  const room = await this.prisma.room.findUnique({
    where: { id }
  });

  if (!room || room.deleted_at) {
    throw new NotFoundException('ROOM_004');
  }

  // 2. Status o'zgarish qoidalarini tekshirish
  const statusTransitions = {
    'AVAILABLE': ['OCCUPIED', 'MAINTENANCE', 'CLOSED'],
    'OCCUPIED': ['AVAILABLE', 'MAINTENANCE'],
    'MAINTENANCE': ['AVAILABLE', 'CLOSED'],
    'CLOSED': ['AVAILABLE', 'MAINTENANCE']
  };

  if (!statusTransitions[room.status].includes(updateRoomStatusDto.status)) {
    throw new BadRequestException('ROOM_005');
  }

  // 3. OCCUPIED ga o'zgartirishda VisitRoom tekshiruvi
  if (updateRoomStatusDto.status === 'OCCUPIED') {
    const activeVisit = await this.prisma.visitRoom.findFirst({
      where: {
        room_id: id,
        status: 'IN_USE',
        deleted_at: null
      }
    });

    if (!activeVisit) {
      this.logger.warn(`Room ${id} marked as OCCUPIED without active VisitRoom`);
    }
  }

  // 4. Status yangilash
  const updated = await this.prisma.room.update({
    where: { id },
     {
      status: updateRoomStatusDto.status,
      updated_at: new Date(),
      modified_by: userId
    },
    include: {
      department: { select: { id: true, name: true } }
    }
  });

  return updated;
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// create-room.dto.ts
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  Matches,
  Min
} from 'class-validator';

export enum RoomStatusEnum {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED'
}

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Xona nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Xona nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Xona nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin'
  })
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @Matches(/^[0-9A-Za-z]+$/, {
    message: 'Xona raqami faqat harf va raqamlardan iborat bo\'lishi kerak'
  })
  room_number?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @IsEnum(RoomStatusEnum)
  status?: RoomStatusEnum;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(RecordStatusEnum)
  record_status?: RecordStatusEnum;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `name` | Required | ROOM_010 | Xona nomi majburiy |
| `name` | MinLength 3 | ROOM_010 | Xona nomi kamida 3 belgi |
| `name` | MaxLength 100 | ROOM_010 | Xona nomi 100 belgidan oshmasin |
| `name` | Pattern | ROOM_010 | Noto'g'ri belgilar |
| `name` | Unique (department ichida) | ROOM_002 | Xona nomi allaqachon mavjud |
| `room_number` | MinLength 1 | ROOM_011 | Xona raqami kamida 1 belgi |
| `room_number` | MaxLength 20 | ROOM_011 | Xona raqami 20 belgidan oshmasin |
| `room_number` | Unique (department ichida) | ROOM_003 | Xona raqami allaqachon mavjud |
| `department_id` | IsInt | ROOM_001 | Department ID raqam bo'lishi kerak |
| `department_id` | Must Exist | ROOM_001 | Bo'lim topilmadi |
| `status` | Enum | ROOM_012 | AVAILABLE/OCCUPIED/MAINTENANCE/CLOSED |
| `record_status` | Enum | ROOM_013 | ACTIVE/INACTIVE/ARCHIVED |
| `description` | MaxLength 1000 | ROOM_014 | Tavsif 1000 belgidan oshmasin |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `ROOM_001` | 404 Not Found | Bo'lim topilmadi | Department ID not exists | Department ID ni tekshiring |
| `ROOM_002` | 409 Conflict | Xona nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `ROOM_003` | 409 Conflict | Xona raqami allaqachon mavjud | Room Number unique constraint | Boshqa raqam tanlang |
| `ROOM_004` | 404 Not Found | Xona topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `ROOM_005` | 400 Bad Request | Status o'zgarishi mumkin emas | Invalid status transition | To'g'ri status tanlang |
| `ROOM_006` | 400 Bad Request | Xonada aktiv bemor bor | Active VisitRoom exists | Visit yakunlangandan keyin o'chiring |
| `ROOM_007` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `ROOM_010` | 400 Bad Request | Xona nomi noto'g'ri | Validation failed | 3-100 belgi, to'g'ri format |
| `ROOM_011` | 400 Bad Request | Xona raqami noto'g'ri | Validation failed | 1-20 belgi, harf/raqam |
| `ROOM_012` | 400 Bad Request | Status noto'g'ri qiymat | Validation failed | AVAILABLE/OCCUPIED/MAINTENANCE/CLOSED |
| `ROOM_013` | 400 Bad Request | Record status noto'g'ri | Validation failed | ACTIVE/INACTIVE/ARCHIVED |
| `ROOM_014` | 400 Bad Request | Tavsif juda uzun | Validation failed | 1000 belgidan oshmasin |

### 5.2 Exception Filter

```typescript
// room-exception.filter.ts
@Catch()
export class RoomExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ConflictException) return 'ROOM_002';
    if (exception instanceof NotFoundException) return 'ROOM_004';
    if (exception instanceof ForbiddenException) return 'ROOM_007';
    if (exception instanceof BadRequestException) return 'ROOM_010';
    return 'ROOM_004';
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
| POST /rooms | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /rooms | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /rooms/available | ✅ | ✅ | ❌ | ✅ | ❌ |
| GET /rooms/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /rooms/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| PUT /rooms/:id/status | ✅ | ❌ | ❌ | ✅ | ❌ |
| DELETE /rooms/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Maydon | Tavsif | Avtomatik |
|--------|--------|-----------|
| `created_at` | Yaratilgan vaqt | ✅ Prisma @default(now()) |
| `updated_at` | Oxirgi o'zgarish | ✅ Prisma @updatedAt |
| `deleted_at` | Soft delete vaqti | ❌ Manual set |
| `registered_by` | Kim yaratdi (User ID) | ✅ Manual set |
| `modified_by` | Kim o'zgartirdi (User ID) | ✅ Manual set |

### 6.4 Input Sanitizatsiya

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

## 7. SEED DATA

### 7.1 Standart Xonalar

```typescript
// seed/room.seed.ts
export async function seedRooms(prisma: PrismaClient) {
  // Terapiya bo'limi xonalari
  const therapyRooms = [
    { name: 'Terapiya Kabineti 1', room_number: '101', department_id: 1, status: 'AVAILABLE' },
    { name: 'Terapiya Kabineti 2', room_number: '102', department_id: 1, status: 'AVAILABLE' },
    { name: 'Terapiya Kabineti 3', room_number: '103', department_id: 1, status: 'AVAILABLE' }
  ];

  // Xirurgiya bo'limi xonalari
  const surgeryRooms = [
    { name: 'Operatsiya Xonasi 1', room_number: '201', department_id: 2, status: 'AVAILABLE' },
    { name: 'Operatsiya Xonasi 2', room_number: '202', department_id: 2, status: 'MAINTENANCE' },
    { name: 'Post-Operatsiya Palata', room_number: '203', department_id: 2, status: 'AVAILABLE' }
  ];

  // Stomatologiya bo'limi xonalari
  const dentalRooms = [
    { name: 'Stomatologiya Kabineti 1', room_number: '301', department_id: 3, status: 'AVAILABLE' },
    { name: 'Stomatologiya Kabineti 2', room_number: '302', department_id: 3, status: 'AVAILABLE' }
  ];

  const allRooms = [...therapyRooms, ...surgeryRooms, ...dentalRooms];

  for (const room of allRooms) {
    await prisma.room.create({
       {
        ...room,
        description: 'Standart xona',
        record_status: 'ACTIVE'
      }
    });
  }

  console.log(`✅ Rooms seeded successfully (${allRooms.length} rooms)`);
}
```

### 7.2 Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat xonalar
npm run seed:rooms
```

### 7.3 Production Checklist

- [ ] Seed data production da bir marta ishga tushiriladi
- [ ] Xona ma'lumotlari tekshiriladi
- [ ] Department ID lar mavjudligi tasdiqlanadi
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
// room.service.spec.ts
describe('RoomService', () => {
  let service: RoomService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomService, PrismaService],
    }).compile();

    service = module.get<RoomService>(RoomService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new room successfully', async () => {
      const dto: CreateRoomDto = {
        name: 'Test Kabineti',
        room_number: '101',
        department_id: 1,
        status: 'AVAILABLE',
      };

      prisma.department.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.room.findFirst = jest.fn().mockResolvedValue(null);
      prisma.room.create = jest.fn().mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.name).toBe('Test Kabineti');
      expect(prisma.room.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if room name exists', async () => {
      const dto: CreateRoomDto = {
        name: 'Terapiya Kabineti 1',
        room_number: '101',
        department_id: 1,
      };

      prisma.department.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.room.findFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Terapiya Kabineti 1' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStatus', () => {
    it('should update room status successfully', async () => {
      const dto: UpdateRoomStatusDto = {
        status: 'OCCUPIED',
      };

      prisma.room.findUnique = jest.fn().mockResolvedValue({ id: 1, status: 'AVAILABLE', deleted_at: null });
      prisma.visitRoom.findFirst = jest.fn().mockResolvedValue(null);
      prisma.room.update = jest.fn().mockResolvedValue({ id: 1, status: 'OCCUPIED' });

      const result = await service.updateStatus(1, dto, 1);

      expect(result.status).toBe('OCCUPIED');
    });

    it('should throw BadRequestException on invalid status transition', async () => {
      const dto: UpdateRoomStatusDto = {
        status: 'OCCUPIED',
      };

      prisma.room.findUnique = jest.fn().mockResolvedValue({ id: 1, status: 'CLOSED', deleted_at: null });

      await expect(service.updateStatus(1, dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a room', async () => {
      prisma.room.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visitRoom.count = jest.fn().mockResolvedValue(0);
      prisma.room.update = jest.fn().mockResolvedValue({ id: 1, deleted_at: new Date() });

      const result = await service.remove(1, 1);

      expect(result.deleted_at).toBeDefined();
      expect(result.record_status).toBe('INACTIVE');
    });

    it('should throw BadRequestException if room has active visits', async () => {
      prisma.room.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visitRoom.count = jest.fn().mockResolvedValue(1);

      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
```

---

## 9. MIGRATSIYA VA DEPLOYMENT

### 9.1 Prisma Migration

```bash
# Development migration
npx prisma migrate dev --name create_room

# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 9.2 Migration SQL (PostgreSQL)

```sql
-- Create Enum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED');

-- Create Table
CREATE TABLE "rooms" (
  "id" SERIAL PRIMARY KEY,
  "department_id" INTEGER,
  "name" VARCHAR(100) NOT NULL,
  "room_number" VARCHAR(20),
  "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
  "description" TEXT,
  "record_status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ,
  "registered_by" INTEGER,
  "modified_by" INTEGER,
  
  CONSTRAINT "fk_room_department" 
    FOREIGN KEY ("department_id") 
    REFERENCES "departments"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_room_registered_by" 
    FOREIGN KEY ("registered_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  CONSTRAINT "fk_room_modified_by" 
    FOREIGN KEY ("modified_by") 
    REFERENCES "users"("id") 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
);

-- Create Indexes
CREATE INDEX "rooms_department_id_idx" ON "rooms"("department_id");
CREATE INDEX "rooms_status_idx" ON "rooms"("status");
CREATE INDEX "rooms_record_status_idx" ON "rooms"("record_status");
CREATE INDEX "rooms_deleted_at_idx" ON "rooms"("deleted_at");
CREATE INDEX "rooms_department_id_status_idx" ON "rooms"("department_id", "status");
```

### 9.3 Rollback Plan

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back "create_room"

# Manual rollback (emergency)
DROP TABLE IF EXISTS "rooms" CASCADE;
DROP TYPE IF EXISTS "RoomStatus" CASCADE;
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
@@index([department_id])           // Bo'lim filter uchun
@@index([status])                  // Status filter uchun (eng muhim)
@@index([record_status])           // Record status filter uchun
@@index([deleted_at])              // Soft delete filter uchun
@@index([department_id, status])   // Qo'shma index - bo'sh xonalarni qidirish uchun
```

### 10.2 Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Room List | Redis | 5 daqiqa | Room create/update/delete |
| Single Room | Redis | 2 daqiqa | Room update/delete |
| Available Rooms | Redis | 1 daqiqa | Room status update |
| Room by Department | Redis | 5 daqiqa | Room create/update |

### 10.3 Query Optimization

```typescript
// ✅ Yaxshi - Faqat kerakli maydonlar (dropdown uchun)
const rooms = await prisma.room.findMany({
  select: { 
    id: true, 
    name: true, 
    room_number: true,
    status: true
  },
  where: { 
    deleted_at: null, 
    record_status: 'ACTIVE',
    status: 'AVAILABLE'
  },
  take: 10
});

// ✅ Yaxshi - Qo'shma index ishlatish
const rooms = await prisma.room.findMany({
  where: { 
    department_id: 1,
    status: 'AVAILABLE',
    record_status: 'ACTIVE',
    deleted_at: null 
  }
});

// ❌ Yomon - Barcha maydonlar
const rooms = await prisma.room.findMany();
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
| Flow Document | `10-room-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Department RFC | `RFC-007-department-management.md` | ✅ Tasdiqlandi |
| VisitRoom RFC | `RFC-012-visit-room-management.md` | ⏳ Keyingi |
| Visit RFC | `RFC-013-visit-management.md` | ⏳ Keyingi |
| Service RFC | `RFC-011-service-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Xona nomi 3-100 belgi orasida bo'lishi
- [ ] Xona raqami 1-20 belgi orasida bo'lishi
- [ ] Xona nomi bo'lim ichida unikal bo'lishi
- [ ] Xona raqami bo'lim ichida unikal bo'lishi
- [ ] Status AVAILABLE/OCCUPIED/MAINTENANCE/CLOSED qiymat qabul qilishi (Reference: `Klinika.md` 3.6)
- [ ] Record Status ACTIVE/INACTIVE/ARCHIVED qiymat qabul qilishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi) (Reference: `Klinika.md` 8.1)
- [ ] Faqat Admin xona yaratish/o'zgartirish/o'chirish huquqiga ega (Reference: `Klinika.md` 6.1)
- [ ] Receptionist xona status o'zgartirish huquqiga ega
- [ ] Barcha rollar xona ro'yxatini ko'ra oladi
- [ ] Bo'sh xonalarni filterlash ishlaydi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi (Reference: `Klinika.md` 5.2)
- [ ] Cascade rules ishlaydi (SetNull)
- [ ] Aktiv visit bo'lgan xonani o'chirish taqiqlanadi
- [ ] Status transition qoidalari ishlaydi

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
| Xona nomi takrorlanishi | O'rta | Yuqori | Unique constraint + department ichida tekshirish |
| Aktiv visit bilan o'chirish | O'rta | Yuqori | VisitRoom tekshiruvi + error qaytarish |
| Status transition xatolari | O'rta | O'rta | Status transition matrix + validation |
| Performance degradation | Past | O'rta | Caching + indexing (qo'shma index) |
| Cascade delete muammolari | O'rta | O'rta | SetNull cascade + warning logs |
| Seed data xatolari | Past | Yuqori | Test environment da oldin tekshirish |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Room occupancy analytics | 🟡 Medium | Phase 3 (Reference: `Klinika.md` 7) |
| Real-time room status (WebSocket) | 🟢 Low | Phase 4 |
| Room equipment tracking | 🟢 Low | Phase 4 |
| Room booking system | 🟢 Low | Phase 4 |
| Room cleaning schedule | 🟢 Low | Phase 4 |
| Multi-branch room support | 🟢 Low | Phase 4 |
| Room photo/gallery | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |
