# 📄 FAYL: `03-location-region.md`

```markdown
# 03. Viloyatlar Boshqaruvi (LocRegion Management)

---

## 📋 UMUMIY MA'LUMOT

| Maydon | Qiymat |
|--------|--------|
| **Flow ID** | 03 |
| **Phase** | 1 - Foundation |
| **Model** | `LocRegion` |
| **Status** | Draft |
| **Yaratilgan Sana** | 2024-01-15 |
| **Oxirgi Yangilanish** | 2024-01-15 |
| **Mas'ul** | Senior Backend Developer |
| **Bog'liq Model** | Yo'q (Mustaqil klassifikator) |

---

## 🎯 MAQSAD

O'zbekiston Respublikasi viloyatlarini tizimda saqlash va boshqarish. Mijozlarni hududiy joylashuvi bo'yicha klassifikatsiya qilish uchun reference ma'lumotlar bazasini yaratish.

---

## 👥 MAS'UL ROLLAR

| Rol | Create | Read | Update | Delete | Tavsif |
|-----|--------|------|--------|--------|--------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | To'liq huquq - barcha operatsiyalar |
| **Doctor** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish (mijoz ro'yxatga olishda) |
| **Nurse** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish |
| **Receptionist** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish (mijoz ro'yxatga olishda) |
| **Accountant** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish (hisobotlar uchun) |

---

## 📊 PRISMA MODEL

### To'liq Model Schema

```prisma
model LocRegion {
  id           Int          @id @default(autoincrement())
  name         String       @db.VarChar(100)
  status       RecordStatus @default(ACTIVE)
  created_at   Timestamptz  @default(now())
  updated_at   Timestamptz  @updatedAt
  deleted_at   Timestamptz?
  registered_by Int?        @map("registered_by")
  modified_by  Int?         @map("modified_by")

  // Relations
  register_user User?       @relation("fk_loc_region_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_loc_region_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  clients      Client[]     @relation("fk_client_region")
  districts    LocDistrict[] @relation("fk_loc_district_region")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("loc_regions")
}
```

### Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Mijoz va tumanlar bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Viloyat nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Toshkent viloyati", "Samarqand viloyati" |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi viloyat yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi |

### Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv viloyatlar) |
| `@@index([name])` | name | Viloyat nomi bo'yicha qidiruvni tezlashtirish (search/dropdown) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan viloyatlarni ajratish) |

### Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_loc_region_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_loc_region_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_client_region` | Client | 1:N | SetNull | Cascade | Viloyat o'chirilganda mijozlarning region_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanadi |
| `fk_loc_district_region` | LocDistrict | 1:N | SetNull | Cascade | Viloyat o'chirilganda tumanlarning region_id NULL ga o'zgaradi. Tuman ma'lumoti saqlanadi |

---

## 🔄 FLOW DIAGRAM

### 1. Viloyat Yaratish Flow (Admin tomonidan)

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API Layer
    participant VAL as Validation
    participant DB as Database
    
    A->>API: POST /api/locations/regions
    API->>VAL: Validate Input
    VAL-->>API: Validation Result
    alt Valid
        API->>DB: Check Unique Name
        DB-->>API: Name Available
        API->>DB: INSERT LocRegion
        DB-->>API: Region ID
        API-->>A: 201 Created
    else Invalid
        VAL-->>API: Error Details
        API-->>A: 400 Bad Request
    end
```

### 2. Viloyat Ro'yxatini Olish Flow

```mermaid
sequenceDiagram
    participant U as User (Any Role)
    participant API as API Layer
    participant DB as Database
    
    U->>API: GET /api/locations/regions
    API->>DB: SELECT WHERE deleted_at IS NULL
    DB-->>API: Regions Array
    API-->>U: 200 OK + Data
```

### 3. Viloyat Yangilash Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API Layer
    participant DB as Database
    
    A->>API: PUT /api/locations/regions/:id
    API->>DB: Check Region Exists
    DB-->>API: Region Found
    API->>DB: Check Unique Name
    DB-->>API: Name Available
    API->>DB: UPDATE LocRegion
    DB-->>API: Rows Affected
    API-->>A: 200 OK
```

### 4. Viloyat O'chirish (Soft Delete) Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API Layer
    participant DB as Database
    
    A->>API: DELETE /api/locations/regions/:id
    API->>DB: Check Region Exists
    DB-->>API: Region Found
    API->>DB: Check Relations (Clients, Districts)
    DB-->>API: Relation Count
    API->>DB: UPDATE status=INACTIVE, deleted_at=now()
    DB-->>API: Success
    API-->>A: 200 OK
```

---

## 📝 BOSQICHMA-BOSQICH JARAYON

### BOSQICH 1: Viloyat Yaratish

#### 1.1. Input Ma'lumotlari

```typescript
interface CreateRegionDto {
  name: string;       // 3-100 belgi, unikal
  status?: string;    // ACTIVE/INACTIVE/ARCHIVED
}
```

#### 1.2. Validatsiya Qoidalari

```typescript
// Name validatsiya
{
  minLength: 3,
  maxLength: 100,
  pattern: /^[a-zA-Z\u0400-\u04FF\s'-]+$/,  // Lotin, Kirill, space, ', -
  unique: true,
  required: true
}

// Status validatsiya
{
  enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  default: 'ACTIVE',
  required: false
}
```

#### 1.3. Biznes Logika

```typescript
// location.service.ts
async createRegion( CreateRegionDto, userId: number): Promise<LocRegion> {
  // 1. Name unikal ekanligini tekshirish
  const existing = await this.prisma.locRegion.findFirst({
    where: {
      name: data.name,
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('LOC_001');
  }
  
  // 2. Viloyat yaratish
  const region = await this.prisma.locRegion.create({
     {
      name: data.name,
      status: data.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return region;
}
```

#### 1.4. Database Query

```prisma
INSERT INTO loc_regions (
  name,
  status,
  created_at,
  updated_at,
  registered_by
) VALUES (
  'Toshkent viloyati',
  'ACTIVE',
  NOW(),
  NOW(),
  1
);
```

---

### BOSQICH 2: Viloyat Ro'yxatini Olish

#### 2.1. Query Parametrlari

```typescript
interface GetRegionsQuery {
  page?: number;        // Default: 1
  limit?: number;       // Default: 100 (klassifikator uchun ko'p)
  status?: string;      // Filter by status
  search?: string;      // Search by name
  sortBy?: string;      // Default: name
  sortOrder?: string;   // Default: asc
}
```

#### 2.2. Biznes Logika

```typescript
async findAll(query: GetRegionsQuery): Promise<PaginatedResult<LocRegion>> {
  const where: any = { deleted_at: null };
  
  // Status filter
  if (query.status) {
    where.status = query.status;
  }
  
  // Search filter
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
    this.prisma.locRegion.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { 
            clients: true,
            districts: true
          }
        }
      }
    }),
    this.prisma.locRegion.count({ where })
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

#### 2.3. Database Query

```prisma
SELECT 
  id,
  name,
  status,
  created_at,
  updated_at,
  deleted_at,
  registered_by,
  modified_by
FROM loc_regions
WHERE deleted_at IS NULL
  AND status = 'ACTIVE'
ORDER BY name ASC
LIMIT 100 OFFSET 0;
```

---

### BOSQICH 3: Viloyat Yangilash

#### 3.1. Input Ma'lumotlari

```typescript
interface UpdateRegionDto {
  name?: string;
  status?: string;
}
```

#### 3.2. Biznes Logika

```typescript
async updateRegion(id: number,  UpdateRegionDto, userId: number): Promise<LocRegion> {
  // 1. Viloyat mavjudligini tekshirish
  const region = await this.prisma.locRegion.findUnique({
    where: { id }
  });
  
  if (!region || region.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (data.name && data.name !== region.name) {
    const existing = await this.prisma.locRegion.findFirst({
      where: {
        name: data.name,
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('LOC_001');
    }
  }
  
  // 3. Viloyat yangilash
  const updated = await this.prisma.locRegion.update({
    where: { id },
     {
      ...data,
      updated_at: new Date(),
      modified_by: userId
    }
  });
  
  return updated;
}
```

#### 3.3. Database Query

```prisma
UPDATE loc_regions
SET 
  name = 'Toshkent viloyati (Updated)',
  status = 'ACTIVE',
  updated_at = NOW(),
  modified_by = 1
WHERE id = 1
  AND deleted_at IS NULL;
```

---

### BOSQICH 4: Viloyat O'chirish (Soft Delete)

#### 4.1. Biznes Logika

```typescript
async removeRegion(id: number, userId: number): Promise<LocRegion> {
  // 1. Viloyat mavjudligini tekshirish
  const region = await this.prisma.locRegion.findUnique({
    where: { id }
  });
  
  if (!region || region.deleted_at) {
    throw new NotFoundException('LOC_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const clientCount = await this.prisma.client.count({
    where: { region_id: id, deleted_at: null }
  });
  
  const districtCount = await this.prisma.locDistrict.count({
    where: { region_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (clientCount > 0 || districtCount > 0) {
    this.logger.warn(
      `Region ${id} has ${clientCount} clients and ${districtCount} districts. 
       Their region_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.locRegion.update({
    where: { id },
     {
      status: 'INACTIVE',
      deleted_at: new Date()
    }
  });
}
```

#### 4.2. Database Query

```prisma
UPDATE loc_regions
SET 
  status = 'INACTIVE',
  deleted_at = NOW()
WHERE id = 1;

-- Mijozlarning region_id null qilish (SetNull cascade)
UPDATE clients
SET region_id = NULL
WHERE region_id = 1;

-- Tumanlarning region_id null qilish (SetNull cascade)
UPDATE loc_districts
SET region_id = NULL
WHERE region_id = 1;
```

---

## 🔌 API ENDPOINT'LAR

### 1. Viloyat Yaratish

| Parametr | Qiymat |
|----------|--------|
| **Method** | POST |
| **Endpoint** | `/api/v1/locations/regions` |
| **Auth** | ✅ JWT Required |
| **Rol** | Admin |
| **Content-Type** | application/json |

**Request Body:**
```json
{
  "name": "Toshkent viloyati",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Viloyat muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "Toshkent viloyati",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null
  }
}
```

---

### 2. Viloyat Ro'yxatini Olish

| Parametr | Qiymat |
|----------|--------|
| **Method** | GET |
| **Endpoint** | `/api/v1/locations/regions` |
| **Auth** | ✅ JWT Required |
| **Rol** | Barchasi |

**Query Params:**
```
GET /api/v1/locations/regions?page=1&limit=100&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Andijon viloyati",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 150, "districts": 14 }
    },
    {
      "id": 2,
      "name": "Buxoro viloyati",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 120, "districts": 11 }
    },
    {
      "id": 3,
      "name": "Toshkent viloyati",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 500, "districts": 15 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 14,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3. Bitta Viloyat Ma'lumotlarini Olish

| Parametr | Qiymat |
|----------|--------|
| **Method** | GET |
| **Endpoint** | `/api/v1/locations/regions/:id` |
| **Auth** | ✅ JWT Required |
| **Rol** | Barchasi |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Toshkent viloyati",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null,
    "districts": [
      { "id": 1, "name": "Bo'ka tumani" },
      { "id": 2, "name": "O'rtachirchiq tumani" }
    ],
    "_count": { "clients": 500, "districts": 15 }
  }
}
```

---

### 4. Viloyat Yangilash

| Parametr | Qiymat |
|----------|--------|
| **Method** | PUT |
| **Endpoint** | `/api/v1/locations/regions/:id` |
| **Auth** | ✅ JWT Required |
| **Rol** | Admin |

**Request Body:**
```json
{
  "name": "Toshkent viloyati (Updated)",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Viloyat muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "Toshkent viloyati (Updated)",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T12:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": 1
  }
}
```

---

### 5. Viloyat O'chirish (Soft Delete)

| Parametr | Qiymat |
|----------|--------|
| **Method** | DELETE |
| **Endpoint** | `/api/v1/locations/regions/:id` |
| **Auth** | ✅ JWT Required |
| **Rol** | Admin |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Viloyat muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "Toshkent viloyati",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

---

## ⚠️ XATOLIKLAR VA HANDLING

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `LOC_001` | 409 Conflict | Viloyat nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `LOC_002` | 400 Bad Request | Viloyat nomi juda qisqa | Validation failed (min 3) | Kamida 3 belgi kiriting |
| `LOC_003` | 404 Not Found | Viloyat topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `LOC_004` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `LOC_005` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |

---

## 📦 SEED DATA (BOSHLANG'ICH MA'LUMOTLAR)

```typescript
// seed/location-region.seed.ts
export async function seedLocRegions(prisma: PrismaClient) {
  const regions = [
    "Toshkent shahar",
    "Toshkent viloyati",
    "Samarqand viloyati",
    "Buxoro viloyati",
    "Xorazm viloyati",
    "Farg'ona viloyati",
    "Namangan viloyati",
    "Andijon viloyati",
    "Qashqadaryo viloyati",
    "Surxondaryo viloyati",
    "Jizzax viloyati",
    "Sirdaryo viloyati",
    "Navoiy viloyati",
    "Qoraqalpog'iston Respublikasi"
  ];

  for (const name of regions) {
    await prisma.locRegion.upsert({
      where: { name },
      update: {},
      create: {
        name,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ LocRegions seeded successfully');
}
```

### Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat viloyatlar
npm run seed:regions
```

---

## 🔐 XAVFSIZLIK TALABLARI

### 1. Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi
- ✅ Token expiry: 24 soat

### 2. Avtorizatsiya (RBAC)
| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /locations/regions | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /locations/regions | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /locations/regions/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /locations/regions/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /locations/regions/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3. Audit
- ✅ `created_at` - Yaratilgan vaqt
- ✅ `updated_at` - Oxirgi o'zgarish
- ✅ `deleted_at` - Soft delete vaqti
- ✅ `registered_by` - Kim yaratdi (User ID)
- ✅ `modified_by` - Kim o'zgartirdi (User ID)

---

## 📝 ESLATMALAR

1. **Viloyatlar kam o'zgaradi** - Seed data tizim o'rnatilganda avtomatik yuklanadi
2. **Cache qilish tavsiya etiladi** - Redis cache, TTL: 1 soat
3. **Soft Delete** - Viloyat o'chirilganda `deleted_at` set bo'ladi, fizik delete qilinmaydi
4. **Cascade Rules** - Viloyat o'chirilganda, bog'liq mijoz va tumanlarning region_id NULL ga o'zgaradi (SetNull)
5. **Unikal nom** - Viloyat nomi unikal bo'lishi shart (case-insensitive)
6. **O'zbekiston standart** - 14 ta viloyat + 1 ta poytaxt = 15 ta region
7. **Klassifikator** - Bu reference ma'lumot, tez-tez o'zgartirilmaydi

---

## ✅ QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

- [ ] Viloyat nomi unikal bo'lishi
- [ ] Viloyat nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin viloyat yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar viloyat ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi
- [ ] Cascade rules ishlaydi (SetNull)

---

**Hujjat Versiyasi:** 1.0
**Status:** Draft
**Tasdiqlagan:** _______________
**Sana:** _______________
