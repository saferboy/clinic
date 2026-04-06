# 📄 FAYL: `06-client-group-management.md`

```markdown
# 06. Mijoz Guruhlari Boshqaruvi (ClientGroup Management)

---

## 📋 UMUMIY MA'LUMOT

| Maydon | Qiymat |
|--------|--------|
| **Flow ID** | 06 |
| **Phase** | 1 - Foundation |
| **Model** | `ClientGroup` |
| **Status** | Draft |
| **Yaratilgan Sana** | 2024-01-15 |
| **Oxirgi Yangilanish** | 2024-01-15 |
| **Mas'ul** | Senior Backend Developer |
| **Bog'liq Model** | `User` (RFC-002), `Client` (Keyingi) |

---

## 🎯 MAQSAD

Mijozlarni guruhlarga ajratish va kategoriyalash. Turli mijoz segmentlari uchun maxsus shartlar, chegirmalar va xizmat ko'rsatish darajalarini belgilash. Mijozlarni segmentatsiya qilish va marketing strategiyasini rejalashtirish uchun reference ma'lumotlar bazasini yaratish.

---

## 👥 MAS'UL ROLLAR

| Rol | Create | Read | Update | Delete | Tavsif |
|-----|--------|------|--------|--------|--------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | To'liq huquq - barcha operatsiyalar |
| **Doctor** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish (mijoz ma'lumotlarida) |
| **Nurse** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish |
| **Receptionist** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish (mijoz ro'yxatga olishda) |
| **Accountant** | ❌ | ✅ | ❌ | ❌ | Faqat ko'rish (hisobotlar uchun) |

---

## 📊 PRISMA MODEL

### To'liq Model Schema

```prisma
model ClientGroup {
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
  register_user User?       @relation("fk_client_group_registered_by", fields: [registered_by], references: [id], onDelete: SetNull, onUpdate: Cascade)
  modify_user   User?       @relation("fk_client_group_modified_by", fields: [modified_by], references: [id], onDelete: SetNull, onUpdate: Cascade)

  clients      Client[]     @relation("fk_client_group")

  @@index([status])
  @@index([name])
  @@index([deleted_at])
  @@map("client_groups")
}
```

### Model Maydonlari Tafsiloti

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `id` | Int | ✅ | autoincrement | SERIAL | **Primary Key**. Unikal identifikator, avtomatik oshib boradi. Client jadvali bilan bog'lanish uchun ishlatiladi |
| `name` | String | ✅ | - | VARCHAR(100) | **Guruh nomi**. 3-100 belgi, unikal bo'lishi shart. Misol: "Oddiy", "VIP", "Korporativ" |
| `description` | String | ❌ | null | TEXT | **Qo'shimcha tavsif**. 0-255 belgi, guruh haqida qo'shimcha ma'lumot. Chegirmalar, imtiyozlar haqida yozish mumkin |
| `status` | Enum | ✅ | ACTIVE | VARCHAR | **Holat**. ACTIVE (faol), INACTIVE (nofaol), ARCHIVED (arxiv). Yangi guruh yaratilganda default ACTIVE |
| `created_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Yaratilgan vaqt**. Avtomatik to'ldiriladi, UTC timezone. Audit uchun muhim |
| `updated_at` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Oxirgi o'zgarish**. Har bir update da avtomatik yangilanadi (Prisma @updatedAt) |
| `deleted_at` | Timestamptz | ❌ | null | TIMESTAMPTZ | **Soft Delete**. NULL = aktiv, qiymat bor = o'chirilgan. Fizik delete qilinmaydi, audit saqlanadi |
| `registered_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim yaratgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |
| `modified_by` | Int | ❌ | null | INTEGER | **Foreign Key**. Kim oxirgi o'zgartirgan (User ID). SetNull cascade - user o'chirilganda null bo'ladi. Audit uchun muhim |

### Indexlar

| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([status])` | status | Status bo'yicha filter qilishni tezlashtirish (faqat aktiv guruhlar) |
| `@@index([name])` | name | Guruh nomi bo'yicha qidiruvni tezlashtirish (search/dropdown) |
| `@@index([deleted_at])` | deleted_at | Soft delete filter uchun (o'chirilgan guruhlarni ajratish) |

### Relation'lar

| Relation | Model | Type | onDelete | onUpdate | Tavsif |
|----------|-------|------|----------|----------|--------|
| `fk_client_group_registered_by` | User | N:1 | SetNull | Cascade | User o'chirilganda registered_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_client_group_modified_by` | User | N:1 | SetNull | Cascade | User o'chirilganda modified_by NULL ga o'zgaradi. Audit tarixi saqlanadi |
| `fk_client_group` | Client | 1:N | SetNull | Cascade | Guruh o'chirilganda mijozlarning group_id NULL ga o'zgaradi. Mijoz ma'lumoti saqlanadi |

---

## 🔄 FLOW DIAGRAM

### 1. Guruh Yaratish Flow (Admin tomonidan)

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API Layer
    participant VAL as Validation
    participant DB as Database
    
    A->>API: POST /api/client-groups
    API->>VAL: Validate Input
    VAL-->>API: Validation Result
    alt Valid
        API->>DB: Check Unique Name
        DB-->>API: Name Available
        API->>DB: INSERT ClientGroup
        DB-->>API: Group ID
        API-->>A: 201 Created
    else Invalid
        VAL-->>API: Error Details
        API-->>A: 400 Bad Request
    end
```

### 2. Guruh Ro'yxatini Olish Flow

```mermaid
sequenceDiagram
    participant U as User (Any Role)
    participant API as API Layer
    participant DB as Database
    
    U->>API: GET /api/client-groups
    API->>DB: SELECT WHERE deleted_at IS NULL
    DB-->>API: Groups Array
    API-->>U: 200 OK + Data
```

### 3. Guruh Yangilash Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API Layer
    participant DB as Database
    
    A->>API: PUT /api/client-groups/:id
    API->>DB: Check Group Exists
    DB-->>API: Group Found
    API->>DB: Check Unique Name
    DB-->>API: Name Available
    API->>DB: UPDATE ClientGroup
    DB-->>API: Rows Affected
    API-->>A: 200 OK
```

### 4. Guruh O'chirish (Soft Delete) Flow

```mermaid
sequenceDiagram
    participant A as Admin
    participant API as API Layer
    participant DB as Database
    
    A->>API: DELETE /api/client-groups/:id
    API->>DB: Check Group Exists
    DB-->>API: Group Found
    API->>DB: Check Relations (Clients)
    DB-->>API: Client Count
    API->>DB: UPDATE status=INACTIVE, deleted_at=now()
    DB-->>API: Success
    API-->>A: 200 OK
```

---

## 📝 BOSQICHMA-BOSQICH JARAYON

### BOSQICH 1: Guruh Yaratish

#### 1.1. Input Ma'lumotlari

```typescript
interface CreateClientGroupDto {
  name: string;       // 3-100 belgi, unikal
  description?: string;   // 0-255 belgi
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

// Description validatsiya
{
  minLength: 0,
  maxLength: 255,
  required: false
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
// client-group.service.ts
async create( CreateClientGroupDto, userId: number): Promise<ClientGroup> {
  // 1. Name unikal ekanligini tekshirish
  const existing = await this.prisma.clientGroup.findFirst({
    where: {
      name: data.name,
      deleted_at: null
    }
  });
  
  if (existing) {
    throw new ConflictException('GRP_001');
  }
  
  // 2. Guruh yaratish
  const group = await this.prisma.clientGroup.create({
     {
      name: data.name,
      description: data.description,
      status: data.status || 'ACTIVE',
      created_at: new Date(),
      updated_at: new Date(),
      registered_by: userId
    }
  });
  
  return group;
}
```

#### 1.4. Database Query

```prisma
INSERT INTO client_groups (
  name,
  description,
  status,
  created_at,
  updated_at,
  registered_by
) VALUES (
  'VIP',
  'Muhim mijozlar - 10% chegirma',
  'ACTIVE',
  NOW(),
  NOW(),
  1
);
```

---

### BOSQICH 2: Guruh Ro'yxatini Olish

#### 2.1. Query Parametrlari

```typescript
interface GetClientGroupsQuery {
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
async findAll(query: GetClientGroupsQuery): Promise<PaginatedResult<ClientGroup>> {
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
    this.prisma.clientGroup.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: { clients: true }
        }
      }
    }),
    this.prisma.clientGroup.count({ where })
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
  description,
  status,
  created_at,
  updated_at,
  deleted_at,
  registered_by,
  modified_by
FROM client_groups
WHERE deleted_at IS NULL
  AND status = 'ACTIVE'
ORDER BY name ASC
LIMIT 100 OFFSET 0;
```

---

### BOSQICH 3: Guruh Yangilash

#### 3.1. Input Ma'lumotlari

```typescript
interface UpdateClientGroupDto {
  name?: string;
  description?: string;
  status?: string;
}
```

#### 3.2. Biznes Logika

```typescript
async update(id: number,  UpdateClientGroupDto, userId: number): Promise<ClientGroup> {
  // 1. Guruh mavjudligini tekshirish
  const group = await this.prisma.clientGroup.findUnique({
    where: { id }
  });
  
  if (!group || group.deleted_at) {
    throw new NotFoundException('GRP_003');
  }
  
  // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
  if (data.name && data.name !== group.name) {
    const existing = await this.prisma.clientGroup.findFirst({
      where: {
        name: data.name,
        id: { not: id },
        deleted_at: null
      }
    });
    
    if (existing) {
      throw new ConflictException('GRP_001');
    }
  }
  
  // 3. Guruh yangilash
  const updated = await this.prisma.clientGroup.update({
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
UPDATE client_groups
SET 
  name = 'VIP (Updated)',
  description = 'Muhim mijozlar - 15% chegirma',
  status = 'ACTIVE',
  updated_at = NOW(),
  modified_by = 1
WHERE id = 1
  AND deleted_at IS NULL;
```

---

### BOSQICH 4: Guruh O'chirish (Soft Delete)

#### 4.1. Biznes Logika

```typescript
async remove(id: number, userId: number): Promise<ClientGroup> {
  // 1. Guruh mavjudligini tekshirish
  const group = await this.prisma.clientGroup.findUnique({
    where: { id }
  });
  
  if (!group || group.deleted_at) {
    throw new NotFoundException('GRP_003');
  }
  
  // 2. Bog'liq yozuvlarni tekshirish
  const clientCount = await this.prisma.client.count({
    where: { group_id: id, deleted_at: null }
  });
  
  // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
  if (clientCount > 0) {
    this.logger.warn(
      `Group ${id} has ${clientCount} clients. 
       Their group_id will be set to NULL.`
    );
  }
  
  // 4. Soft Delete (SetNull cascade avtomatik ishlaydi)
  return this.prisma.clientGroup.update({
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
UPDATE client_groups
SET 
  status = 'INACTIVE',
  deleted_at = NOW()
WHERE id = 1;

-- Mijozlarning group_id null qilish (SetNull cascade)
UPDATE clients
SET group_id = NULL
WHERE group_id = 1;
```

---

## 🔌 API ENDPOINT'LAR

### 1. Guruh Yaratish

| Parametr | Qiymat |
|----------|--------|
| **Method** | POST |
| **Endpoint** | `/api/v1/client-groups` |
| **Auth** | ✅ JWT Required |
| **Rol** | Admin |
| **Content-Type** | application/json |

**Request Body:**
```json
{
  "name": "VIP",
  "description": "Muhim mijozlar - 10% chegirma",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Guruh muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "name": "VIP",
    "description": "Muhim mijozlar - 10% chegirma",
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

### 2. Guruh Ro'yxatini Olish

| Parametr | Qiymat |
|----------|--------|
| **Method** | GET |
| **Endpoint** | `/api/v1/client-groups` |
| **Auth** | ✅ JWT Required |
| **Rol** | Barchasi |

**Query Params:**
```
GET /api/v1/client-groups?page=1&limit=100&status=ACTIVE&sortBy=name&sortOrder=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Oddiy",
      "description": "Oddiy mijozlar",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 500 }
    },
    {
      "id": 2,
      "name": "VIP",
      "description": "Muhim mijozlar - 10% chegirma",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 50 }
    },
    {
      "id": 3,
      "name": "Korporativ",
      "description": "Korporativ shartnoma asosida",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 30 }
    },
    {
      "id": 4,
      "name": "Sug'urta",
      "description": "Sug'urta kompaniyalari mijozlari",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 100 }
    },
    {
      "id": 5,
      "name": "Imtiyozli",
      "description": "Imtiyozli mijozlar - 20% chegirma",
      "status": "ACTIVE",
      "created_at": "2024-01-15T10:00:00.000Z",
      "_count": { "clients": 20 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 3. Bitta Guruh Ma'lumotlarini Olish

| Parametr | Qiymat |
|----------|--------|
| **Method** | GET |
| **Endpoint** | `/api/v1/client-groups/:id` |
| **Auth** | ✅ JWT Required |
| **Rol** | Barchasi |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "VIP",
    "description": "Muhim mijozlar - 10% chegirma",
    "status": "ACTIVE",
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "deleted_at": null,
    "registered_by": 1,
    "modified_by": null,
    "_count": { "clients": 50 }
  }
}
```

---

### 4. Guruh Yangilash

| Parametr | Qiymat |
|----------|--------|
| **Method** | PUT |
| **Endpoint** | `/api/v1/client-groups/:id` |
| **Auth** | ✅ JWT Required |
| **Rol** | Admin |

**Request Body:**
```json
{
  "name": "VIP (Updated)",
  "description": "Muhim mijozlar - 15% chegirma",
  "status": "ACTIVE"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Guruh muvaffaqiyatli yangilandi",
  "data": {
    "id": 1,
    "name": "VIP (Updated)",
    "description": "Muhim mijozlar - 15% chegirma",
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

### 5. Guruh O'chirish (Soft Delete)

| Parametr | Qiymat |
|----------|--------|
| **Method** | DELETE |
| **Endpoint** | `/api/v1/client-groups/:id` |
| **Auth** | ✅ JWT Required |
| **Rol** | Admin |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Guruh muvaffaqiyatli o'chirildi",
  "data": {
    "id": 1,
    "name": "VIP",
    "status": "INACTIVE",
    "deleted_at": "2024-01-15T14:00:00.000Z"
  }
}
```

---

## ⚠️ XATOLIKLAR VA HANDLING

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `GRP_001` | 409 Conflict | Guruh nomi allaqachon mavjud | Name unique constraint | Boshqa nom tanlang |
| `GRP_002` | 400 Bad Request | Guruh nomi juda qisqa | Validation failed (min 3) | Kamida 3 belgi kiriting |
| `GRP_003` | 404 Not Found | Guruh topilmadi | ID not exists yoki deleted | ID ni tekshiring |
| `GRP_004` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Admin roli kerak |
| `GRP_005` | 500 Internal Server Error | Tizim xatosi | Database error | Admin bilan bog'laning |

---

## 📦 SEED DATA (BOSHLANG'ICH MA'LUMOTLAR)

```typescript
// seed/client-group.seed.ts
export async function seedClientGroups(prisma: PrismaClient) {
  const groups = [
    { 
      name: "Oddiy", 
      description: "Oddiy mijozlar - standart narxlar" 
    },
    { 
      name: "VIP", 
      description: "Muhim mijozlar - 10% chegirma" 
    },
    { 
      name: "Korporativ", 
      description: "Korporativ shartnoma asosida xizmat ko'rsatish" 
    },
    { 
      name: "Sug'urta", 
      description: "Sug'urta kompaniyalari mijozlari" 
    },
    { 
      name: "Imtiyozli", 
      description: "Imtiyozli mijozlar - 20% chegirma" 
    }
  ];

  for (const group of groups) {
    await prisma.clientGroup.upsert({
      where: { name },
      update: {},
      create: {
        name: group.name,
        description: group.description,
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ ClientGroups seeded successfully (5 groups)');
}
```

### Seed Script Ishga Tushirish

```bash
# Development
npm run seed

# Production (ehtiyotkorlik bilan)
npm run seed:prod

# Faqat mijoz guruhlari
npm run seed:client-groups
```

---

## 🔐 XAVFSIZLIK TALABLARI

### 1. Autentifikatsiya
- ✅ Barcha endpoint'lar JWT token talab qiladi
- ✅ Token expiry: 24 soat

### 2. Avtorizatsiya (RBAC)
| Endpoint | Admin | Doctor | Nurse | Receptionist | Accountant |
|----------|-------|--------|-------|--------------|------------|
| POST /client-groups | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /client-groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| GET /client-groups/:id | ✅ | ✅ | ✅ | ✅ | ✅ |
| PUT /client-groups/:id | ✅ | ❌ | ❌ | ❌ | ❌ |
| DELETE /client-groups/:id | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3. Audit
- ✅ `created_at` - Yaratilgan vaqt
- ✅ `updated_at` - Oxirgi o'zgarish
- ✅ `deleted_at` - Soft delete vaqti
- ✅ `registered_by` - Kim yaratdi (User ID)
- ✅ `modified_by` - Kim o'zgartirdi (User ID)

---

## 📝 ESLATMALAR

1. **Guruhlar kam o'zgaradi** - Seed data tizim o'rnatilganda avtomatik yuklanadi
2. **Cache qilish tavsiya etiladi** - Redis cache, TTL: 1 soat
3. **Soft Delete** - Guruh o'chirilganda `deleted_at` set bo'ladi, fizik delete qilinmaydi
4. **Cascade Rules** - Guruh o'chirilganda, bog'liq mijozlarning group_id NULL ga o'zgaradi (SetNull)
5. **Unikal nom** - Guruh nomi unikal bo'lishi shart (case-insensitive)
6. **Klassifikator** - Bu reference ma'lumot, tez-tez o'zgartirilmaydi
7. **Chegirmalar** - Guruh tavsifida chegirma foizlari yozilishi mumkin (kelajakda alohida maydon qo'shish mumkin)
8. **5 ta standart guruh** - Seed data da 5 ta standart guruh mavjud

---

## ✅ QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

- [ ] Guruh nomi unikal bo'lishi
- [ ] Guruh nomi 3-100 belgi orasida bo'lishi
- [ ] Soft delete ishlaydi (deleted_at set bo'ladi)
- [ ] Faqat Admin guruh yaratish/o'zgartirish/o'chirish huquqiga ega
- [ ] Barcha rollar guruh ro'yxatini ko'ra oladi
- [ ] Pagination va search ishlaydi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytariladi
- [ ] Seed data tizim o'rnatilganda avtomatik yuklanadi (5 ta guruh)
- [ ] Audit maydonlari (registered_by, modified_by) to'ldiriladi
- [ ] Cascade rules ishlaydi (SetNull)

---

**Hujjat Versiyasi:** 1.0
**Status:** Draft
**Tasdiqlagan:** _______________
**Sana:** _______________
