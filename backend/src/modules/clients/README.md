# 🏥 Client Management Module (RFC-009)

Mijozlar boshqaruv moduli - klinikaga kelgan mijozlarni (bemorlarni) ro'yxatga olish, ularning ma'lumotlarini saqlash va boshqarish.

---

## 📋 Umumiy Ma'lumot

| Maydon | Qiymat |
|--------|--------|
| **Module** | `ClientsModule` |
| **Model** | `Client` |
| **Phase** | 2A - Core Entities |
| **Status** | ✅ Completed |
| **Priority** | 🔴 High |

---

## 🎯 Maqsad

- Mijozlar bazasini shakllantirish va boshqarish (CRM)
- Mijozlarni hududiy joylashuvi bo'yicha klassifikatsiya qilish
- Mijoz manbailarini tahlil qilish (marketing analitika)
- Mijozlarni guruhlar bo'yicha segmentatsiya qilish (VIP, Korporativ, Oddiy)
- Mijoz moliyaviy holatini kuzatish (balance, debt)
- Visit va Payment jarayonlari uchun asos yaratish

---

## 📊 Model

```prisma
model Client {
  id            Int          @id @default(autoincrement())
  full_name     String       @db.VarChar(100)
  phone         String       @db.VarChar(20)
  group_id      Int?         @map("group_id")
  gender        ClientGender
  date_of_birth DateTime?    @map("date_of_birth")
  region_id     Int?         @map("region_id")
  district_id   Int?         @map("district_id")
  address       String?      @db.VarChar(255)
  balance       Decimal      @default(0) @db.Decimal(15, 2)
  description   String?      @db.Text
  source_id     Int?         @map("source_id")
  status        RecordStatus @default(ACTIVE)
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt
  deleted_at    DateTime?
  registered_by Int?         @map("registered_by")
  modified_by   Int?         @map("modified_by")
}
```

---

## 🔌 API Endpoint'lar

### 1. Mijoz Yaratish

```http
POST /api/v1/clients
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+998901234567",
  "gender": "MALE",
  "group_id": 1,
  "region_id": 1,
  "district_id": 1,
  "source_id": 1,
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
    "gender": "MALE",
    "balance": 0,
    "status": "ACTIVE",
    "group": { "id": 1, "name": "Oddiy" },
    "region": { "id": 1, "name": "Toshkent viloyati" },
    "district": { "id": 1, "name": "Chilonzor tumani" },
    "source": { "id": 1, "name": "Instagram" }
  }
}
```

---

### 2. Mijozlar Ro'yxatini Olish

```http
GET /api/v1/clients?page=1&limit=10&phone=+99890&status=ACTIVE
Authorization: Bearer <token>
```

**Query Parametrlari:**
| Param | Tip | Default | Tavsif |
|-------|-----|---------|--------|
| `page` | number | 1 | Sahifa raqami |
| `limit` | number | 10 | Sahifadagi elementlar (max 100) |
| `phone` | string | - | Telefon raqam bo'yicha filter |
| `full_name` | string | - | Ism bo'yicha qidiruv |
| `group_id` | number | - | Guruh bo'yicha filter |
| `region_id` | number | - | Viloyat bo'yicha filter |
| `district_id` | number | - | Tuman bo'yicha filter |
| `source_id` | number | - | Manba bo'yicha filter |
| `status` | string | - | Status bo'yicha filter |
| `gender` | string | - | Jinsi bo'yicha filter |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mijozlar ro'yxati muvaffaqiyatli olindi",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 3. Mijoz Qidirish

```http
GET /api/v1/clients/search?phone=+99890&full_name=John&limit=10
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mijozlar qidiruv natijalari",
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "phone": "+998901234567",
      "balance": 0,
      "status": "ACTIVE",
      "group": { "id": 1, "name": "Oddiy" }
    }
  ]
}
```

---

### 4. Bitta Mijozni Olish

```http
GET /api/v1/clients/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mijoz ma'lumotlari olindi",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "phone": "+998901234567",
    "balance": 0,
    "visits": [],
    "payments": [],
    "_count": { "visits": 5, "payments": 3 }
  }
}
```

---

### 5. Mijoz Yangilash

```http
PATCH /api/v1/clients/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe Updated",
  "address": "Yangi manzil"
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
    "status": "ACTIVE"
  }
}
```

---

### 6. Mijoz O'chirish (Soft Delete)

```http
DELETE /api/v1/clients/:id
Authorization: Bearer <token>
```

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

---

### 7. Mijoz Balance Olish

```http
GET /api/v1/clients/:id/balance
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Mijoz balance ma'lumotlari olindi",
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

---

## 🗄️ Seed Data

### 5 ta Test Mijoz Qo'shish

```bash
npm run seed:clients-only
```

**Qo'shiladigan mijozlar:**

| # | F.I.O | Telefon | Guruh | Viloyat |
|---|-------|---------|-------|---------|
| 1 | John Doe | +998901234567 | Oddiy | Toshkent |
| 2 | Jane Smith | +998909876543 | VIP | Toshkent |
| 3 | Bob Johnson | +998901112233 | Oddiy | Samarqand |
| 4 | Alice Williams | +998905554433 | Oddiy | Farg'ona |
| 5 | David Brown | +998907778899 | Korporativ | Andijon |

---

## 🛠️ Commands

```bash
# Build
npm run build

# Test
npm test -- clients.service.spec

# Seed (faqat mijozlar)
npm run seed:clients-only

# Start dev server
npm run start:dev
```

---

## ⚠️ Xatoliklar

| Kod | Status | Xabar | Sabab |
|-----|--------|-------|-------|
| `CLI_001` | 409 | Bu telefon raqam allaqachon mavjud | Phone unique |
| `CLI_002` | 404 | Mijoz guruhi topilmadi | Group not found |
| `CLI_003` | 404 | Viloyat topilmadi | Region not found |
| `CLI_004` | 404 | Tuman topilmadi | District not found |
| `CLI_005` | 404 | Manba topilmadi | Source not found |
| `CLI_006` | 400 | Telefon format noto'g'ri | Invalid phone format |
| `CLI_007` | 404 | Mijoz topilmadi | Client not found |

---

## 🔐 Xavfsizlik

- ✅ JWT Authentication
- ✅ RBAC (Admin, Doctor, Receptionist)
- ✅ Soft Delete
- ✅ Audit (registered_by, modified_by)
- ✅ Phone validation (+998 format)

---

## 📁 Fayl Strukturasi

```
src/modules/clients/
├── clients.controller.ts       # 8 ta endpoint
├── clients.service.ts          # 10 ta metod
├── clients.module.ts           # Module definition
├── clients.service.spec.ts     # Testlar
└── dto/
    ├── create-client.dto.ts    # Create DTO + Validators
    └── update-client.dto.ts    # Update DTO
```

---

## 📝 Eslatmalar

1. **Phone Format**: Barcha telefon raqamlar `+998901234567` formatda saqlanadi
2. **Balance**: Avtomatik hisoblanadi (ClientPaid + Payment - Visit debt)
3. **Soft Delete**: `deleted_at` set qilinadi, ma'lumot o'chirilmaydi
4. **Unique Constraint**: Telefon raqam unikal (deleted_at=null holatda)

---

## 🚀 Keyingi Qadamlar

- [ ] Visit module (RFC-013)
- [ ] Payment module (RFC-014)
- [ ] Client balance automatic update
- [ ] Visit va Payment history to'liq integratsiya

---

**Muallif:** Senior Backend Developer  
**Yaratilgan:** 2024-01-15  
**Oxirgi yangilanish:** 2024-01-15
