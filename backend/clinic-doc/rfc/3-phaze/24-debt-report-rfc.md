# 📋 RFC-024: Qarzdorlik Hisoboti Boshqaruvi (Debt Report Management)

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-024 |
| **Nomi** | Debt Report Management |
| **Phase** | 3 - Reports & Analytics |
| **Model** | `Report` (Virtual - mavjud ma'lumotlardan hosil qilinadi) |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Finance) |
| **Bog'liq RFC** | RFC-009 (Client), RFC-013 (Visit), RFC-014 (Payment), RFC-015 (ClientPaid) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.5, 5.2, 6.1, 7.1, 7.2, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC klinikadagi qarzdorliklarni kuzatish, tahlil qilish va hisobot qilish uchun to'liq texnik specifikatsiyani taqdim etadi. Mijozlar qarzdorligini aniqlash, muddati o'tgan qarzlarni monitoring qilish, qarzdorlik yoshi bo'yicha tahlil va to'lov undirish jarayonlarini boshqarish. Moliyaviy yo'qotishlarni kamaytirish va naqd oqimini yaxshilash uchun asos yaratish (Reference: `Klinika.md` 3.5, 7.1, 7.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Qarzdorlik hisobotini olish | ❌ To'lov undirish avtomatizatsiyasi |
| ✅ Qarz yoshi (aging) tahlili | ❌ Yuridik choralar |
| ✅ Qarzдор mijozlar ro'yxati | ❌ Frontend implementatsiya |
| ✅ Follow-up boshqaruvi | ❌ SMS/Email integratsiyasi |
| ✅ Qarzdorlik trendi | |
| ✅ Undirish statistikasi | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 3.5, 7.1, 7.2)
- Qarzdorlikni kamaytirish va naqd oqimini yaxshilash
- Muddati o'tgan qarzlarni erta aniqlash
- Qarzдор mijozlar bilan ishlashni tizimli yo'lga qo'yish
- Moliyaviy yo'qotishlarni minimallashtirish
- Undirish choralarining samaradorligini kuzatish
- Kredit siyosatini optimallashtirish
- Mijozlar to'lov intizomini yaxshilash

---

## 2. PRISMA MODEL

### 2.1 Ma'lumotlar Manbalari (Reference: `klinika_prisma.txt`)

Debt Report alohida jadvalda saqlanmaydi. U quyidagi jadvallardan real-time hosil qilinadi:

```
┌─────────────────────────────────────────────────────────────┐
│              DEBT REPORT DATA SOURCES                       │
├─────────────────────────────────────────────────────────────┤
│  Visit          → Qarzдор visitlar (debt_amount > 0)        │
│  Client         → Mijoz ma'lumotlari                        │
│  Payment        → To'lovlar                                 │
│  ClientPaid     → Oldindan to'lovlar                        │
│  DebtFollowup   → Undirish choralari (kelajakda)            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Report Tuzilishi

```typescript
interface DebtReport {
  period: {
    from: Date;
    to: Date;
  };
  summary: DebtSummary;
  aging: DebtAging[];
  topDebtors: TopDebtor[];
  trendData: DebtTrendData[];
  collectionStats: CollectionStats;
}

interface DebtSummary {
  totalDebt: number;           // Umumiy qarzdorlik
  totalClients: number;        // Qarzдор mijozlar soni
  averageDebt: number;         // O'rtacha qarz summasi
  debtRate: number;            // Qarzdorlik foizi
  overdueDebt: number;         // Muddati o'tgan qarz
  overdueClients: number;      // Muddati o'tgan qarzдор mijozlar
}

interface DebtAging {
  ageRange: string;            // "0-30 kun", "31-60 kun", etc.
  minDays: number;
  maxDays: number;
  amount: number;
  count: number;
  percentage: number;
}

interface TopDebtor {
  clientId: number;
  clientName: string;
  phone: string;
  totalDebt: number;
  visitCount: number;
  oldestDebtDate: Date;
  daysOverdue: number;
}

interface DebtTrendData {
  date: Date;
  debtAmount: number;
  collectedAmount: number;
  netDebt: number;
}

interface CollectionStats {
  totalCollected: number;
  collectionRate: number;
  followupCount: number;
  smsSent: number;
  callsMade: number;
}
```

### 2.3 Model Maydonlari Tafsiloti

#### Visit Model (Debt uchun asosiy)

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `debt_amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Qarz summasi**. total_amount - paid_amount. Qarzdorlik hisoboti uchun asosiy maydon (Reference: `Klinika.md` 3.5) |
| `total_amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Jami summa**. Barcha xizmatlar yig'indisi |
| `paid_amount` | Decimal | ✅ | 0 | DECIMAL(15,2) | **To'langan summa**. Qancha to'lov amalga oshirilgan |
| `client_id` | Int | ✅ | - | INTEGER | **Foreign Key**. Client jadvaliga bog'lanish. Qaysi mijoz qarzdor ekanligi |
| `visit_date` | Timestamptz | ✅ | now() | TIMESTAMPTZ | **Qabul sanasi**. Qarz yoshi hisoblash uchun asos |

#### Client Model

| Maydon | Tip | Majburiy | Default | DB Tip | Izoh/Tavsif |
|--------|-----|----------|---------|--------|-------------|
| `balance` | Decimal | ✅ | 0 | DECIMAL(15,2) | **Hisob balansi**. Musbat = oldindan to'lov, Manfiy = qarz (Reference: `Klinika.md` 3.2) |
| `phone` | String | ✅ | - | VARCHAR(20) | **Telefon raqam**. +998 formatida. Undirish uchun aloqa ma'lumoti |
| `full_name` | String | ✅ | - | VARCHAR(100) | **F.I.O**. Mijozning to'liq ismi |

### 2.4 Indexlar (Reference: `klinika_prisma.txt`)

#### Visit Indexlar (Debt uchun)
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([client_id])` | client_id | Mijoz bo'yicha filter qilishni tezlashtirish |
| `@@index([visit_date])` | visit_date | Sana bo'yicha filter qilishni tezlashtirish |
| `@@index([status])` | status | Visit statusi bo'yicha filter |
| `@@index([client_id, visit_date])` | client_id, visit_date | Qo'shma index - mijoz va sana bo'yicha |

#### Client Indexlar
| Index | Maydon(lar) | Maqsad |
|-------|-------------|--------|
| `@@index([phone])` | phone | Telefon bo'yicha qidiruv |
| `@@index([status])` | status | Status bo'yicha filter |

### 2.5 Qarz Hisoblash Formulasi

```typescript
// Visit darajasida
debt_amount = total_amount - paid_amount

// Mijoz darajasida
totalDebt = SUM(visit.debt_amount) WHERE debt_amount > 0
client.balance = (ClientPaid + Payment INCOME) - Visit debt_amount

// Qarz yoshi (days overdue)
daysOverdue = FLOOR((NOW() - visit.visit_date) / 86400000)
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | GET | `/api/v1/reports/debt` | ✅ JWT | Admin, Accountant | Qarzdorlik hisobotini olish |
| 2 | GET | `/api/v1/reports/debt/clients` | ✅ JWT | Admin, Accountant, Receptionist | Qarzдор mijozlar ro'yxati |
| 3 | GET | `/api/v1/reports/debt/aging` | ✅ JWT | Admin, Accountant | Qarz yoshi (aging) hisoboti |
| 4 | POST | `/api/v1/reports/debt/:clientId/followup` | ✅ JWT | Admin, Accountant, Receptionist | Follow-up yaratish |
| 5 | POST | `/api/v1/reports/debt/export` | ✅ JWT | Admin, Accountant | Qarzdorlik hisoboti export |

---

### 3.2 GET /api/v1/reports/debt

**Tavsif:** Qarzdorlik hisobotini olish (Admin, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi (YYYY-MM-DD) |
| `end_date` | date | ✅ | - | Tugash sanasi (YYYY-MM-DD) |

**Request Example:**
```http
GET /api/v1/reports/debt?start_date=2024-01-01&end_date=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "summary": {
      "totalDebt": 75000000,
      "totalClients": 30,
      "averageDebt": 2500000,
      "debtRate": 16.7,
      "overdueDebt": 25000000,
      "overdueClients": 10
    },
    "aging": [
      {
        "ageRange": "0-30 kun",
        "minDays": 0,
        "maxDays": 30,
        "amount": 30000000,
        "count": 15,
        "percentage": 40.0
      },
      {
        "ageRange": "31-60 kun",
        "minDays": 31,
        "maxDays": 60,
        "amount": 20000000,
        "count": 8,
        "percentage": 26.7
      },
      {
        "ageRange": "61-90 kun",
        "minDays": 61,
        "maxDays": 90,
        "amount": 15000000,
        "count": 5,
        "percentage": 20.0
      },
      {
        "ageRange": "90+ kun",
        "minDays": 91,
        "maxDays": 9999,
        "amount": 10000000,
        "count": 2,
        "percentage": 13.3
      }
    ],
    "topDebtors": [
      {
        "clientId": 1,
        "clientName": "John Doe",
        "phone": "+998901234567",
        "totalDebt": 5000000,
        "visitCount": 5,
        "oldestDebtDate": "2023-10-01T10:00:00.000Z",
        "daysOverdue": 107
      }
    ],
    "trendData": [...],
    "collectionStats": {
      "totalCollected": 50000000,
      "collectionRate": 66.7,
      "followupCount": 45,
      "smsSent": 30,
      "callsMade": 15
    }
  },
  "generatedAt": "2024-02-01T10:00:00.000Z",
  "cached": true
}
```

**Service Layer Implementation:**
```typescript
// debt-report.service.ts
async getDebtReport(
  startDate: Date,
  endDate: Date,
  currentUserId: number,
  currentUserRole: string
): Promise<DebtReport> {
  // 1. RBAC tekshiruvi (Reference: Klinika.md 6.1)
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
    throw new ForbiddenException('DR_001');
  }

  // 2. Qarzдор visitlarni olish
  const debtVisits = await this.prisma.visit.findMany({
    where: {
      debt_amount: { gt: 0 },
      visit_date: {
        gte: startDate,
        lt: endDate
      },
      deleted_at: null
    },
    include: {
      client: {
        select: {
          id: true,
          full_name: true,
          phone: true
        }
      }
    }
  });

  // 3. Umumiy statistika hisoblash
  const summary = await this.calculateDebtSummary(debtVisits, startDate, endDate);

  // 4. Qarz yoshi (aging) hisoblash
  const aging = await this.calculateDebtAging(debtVisits);

  // 5. Eng ko'p qarzдор mijozlar
  const topDebtors = await this.getTopDebtors(debtVisits);

  // 6. Vaqt bo'yicha trend
  const trendData = await this.getDebtTrend(debtVisits, startDate, endDate);

  // 7. Undirish statistikasi
  const collectionStats = await this.getCollectionStats(startDate, endDate);

  return {
    period: {
      from: startDate,
      to: endDate
    },
    summary,
    aging,
    topDebtors,
    trendData,
    collectionStats
  };
}

// Umumiy qarzdorlik statistikasi
private async calculateDebtSummary(
  debtVisits: any[],
  startDate: Date,
  endDate: Date
): Promise<DebtSummary> {
  // Umumiy qarzdorlik
  const totalDebt = debtVisits.reduce((sum, v) => sum + v.debt_amount.toNumber(), 0);
  
  // Qarzдор mijozlar soni (unikal)
  const uniqueClients = new Set(debtVisits.map(v => v.client_id));
  const totalClients = uniqueClients.size;
  
  // O'rtacha qarz
  const averageDebt = totalClients > 0 
    ? Math.round((totalDebt / totalClients) * 100) / 100
    : 0;
  
  // Jami visitlar va to'lovlar
  const allVisits = await this.prisma.visit.aggregate({
    where: {
      visit_date: {
        gte: startDate,
        lt: endDate
      },
      deleted_at: null
    },
    _sum: {
      total_amount: true,
      debt_amount: true
    }
  });
  
  // Qarzdorlik foizi
  const totalAmount = allVisits._sum.total_amount?.toNumber() || 0;
  const debtRate = totalAmount > 0
    ? Math.round((totalDebt / totalAmount) * 100 * 10) / 10
    : 0;
  
  // Muddati o'tgan qarz (30 kundan oshgan)
  const now = new Date();
  const overdueVisits = debtVisits.filter(v => {
    const daysOverdue = Math.floor((now.getTime() - v.visit_date.getTime()) / (1000 * 60 * 60 * 24));
    return daysOverdue > 30;
  });
  
  const overdueDebt = overdueVisits.reduce((sum, v) => sum + v.debt_amount.toNumber(), 0);
  const overdueClients = new Set(overdueVisits.map(v => v.client_id)).size;
  
  return {
    totalDebt,
    totalClients,
    averageDebt,
    debtRate,
    overdueDebt,
    overdueClients
  };
}

// Qarz yoshi (aging) hisoblash
private async calculateDebtAging(debtVisits: any[]): Promise<DebtAging[]> {
  const now = new Date();
  
  const aging: DebtAging[] = [
    { ageRange: '0-30 kun', minDays: 0, maxDays: 30, amount: 0, count: 0, percentage: 0 },
    { ageRange: '31-60 kun', minDays: 31, maxDays: 60, amount: 0, count: 0, percentage: 0 },
    { ageRange: '61-90 kun', minDays: 61, maxDays: 90, amount: 0, count: 0, percentage: 0 },
    { ageRange: '90+ kun', minDays: 91, maxDays: 9999, amount: 0, count: 0, percentage: 0 }
  ];
  
  const totalDebt = debtVisits.reduce((sum, v) => sum + v.debt_amount.toNumber(), 0);
  
  for (const visit of debtVisits) {
    const daysOverdue = Math.floor((now.getTime() - visit.visit_date.getTime()) / (1000 * 60 * 60 * 24));
    const debtAmount = visit.debt_amount.toNumber();
    
    const ageGroup = aging.find(a => daysOverdue >= a.minDays && daysOverdue <= a.maxDays);
    if (ageGroup) {
      ageGroup.amount += debtAmount;
      ageGroup.count += 1;
    }
  }
  
  // Percentages hisoblash
  aging.forEach(a => {
    a.percentage = totalDebt > 0
      ? Math.round((a.amount / totalDebt) * 100 * 10) / 10
      : 0;
  });
  
  return aging;
}

// Eng ko'p qarzдор mijozlar
private async getTopDebtors(debtVisits: any[], limit: number = 10): Promise<TopDebtor[]> {
  // Mijozlar bo'yicha guruhlash
  const clientDebts = new Map<number, {
    totalDebt: number;
    visitCount: number;
    oldestDate: Date;
    clientName: string;
    phone: string;
  }>();
  
  for (const visit of debtVisits) {
    if (!clientDebts.has(visit.client_id)) {
      clientDebts.set(visit.client_id, {
        totalDebt: 0,
        visitCount: 0,
        oldestDate: visit.visit_date,
        clientName: visit.client.full_name,
        phone: visit.client.phone
      });
    }
    
    const client = clientDebts.get(visit.client_id)!;
    client.totalDebt += visit.debt_amount.toNumber();
    client.visitCount += 1;
    
    if (visit.visit_date < client.oldestDate) {
      client.oldestDate = visit.visit_date;
    }
  }
  
  const now = new Date();
  
  return Array.from(clientDebts.entries())
    .map(([clientId, data]) => ({
      clientId,
      clientName: data.clientName,
      phone: data.phone,
      totalDebt: data.totalDebt,
      visitCount: data.visitCount,
      oldestDebtDate: data.oldestDate,
      daysOverdue: Math.floor((now.getTime() - data.oldestDate.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => b.totalDebt - a.totalDebt)
    .slice(0, limit);
}
```

---

### 3.3 GET /api/v1/reports/debt/clients

**Tavsif:** Qarzдор mijozlar ro'yxati (Admin, Accountant, Receptionist)

**Query Parameters:**
| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi |
| `end_date` | date | ✅ | - | Tugash sanasi |
| `page` | number | ❌ | 1 | Sahifa raqami |
| `limit` | number | ❌ | 20 | Sahifadagi elementlar soni |
| `min_debt` | number | ❌ | - | Minimal qarz summasi |
| `days_overdue` | number | ❌ | - | Minimal kun soni |
| `sort_by` | string | ❌ | debt_amount | Sort maydoni |
| `sort_order` | string | ❌ | desc | Sort tartibi |

**Request Example:**
```http
GET /api/v1/reports/debt/clients?start_date=2024-01-01&end_date=2024-01-31&page=1&limit=20&min_debt=1000000&days_overdue=30
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "totalClients": 30,
    "totalDebt": 75000000,
    "clients": [
      {
        "clientId": 1,
        "clientName": "John Doe",
        "phone": "+998901234567",
        "totalDebt": 5000000,
        "visitCount": 5,
        "oldestDebtDate": "2023-10-01T10:00:00.000Z",
        "newestDebtDate": "2024-01-15T10:00:00.000Z",
        "daysOverdue": 107,
        "lastPaymentDate": "2024-01-10T12:00:00.000Z",
        "lastPaymentAmount": 1000000,
        "contactAttempts": 3,
        "status": "CONTACTED"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 30,
      "totalPages": 2,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 3.4 POST /api/v1/reports/debt/:clientId/followup

**Tavsif:** Qarz undirish follow-up yaratish (Admin, Accountant, Receptionist)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface CreateFollowupDto {
  type: 'SMS' | 'CALL' | 'EMAIL' | 'VISIT' | 'LEGAL';
  description?: string;
  promisedAmount?: number;
  promisedDate?: Date;
  followupDate?: Date;
}
```

**Request Body Example:**
```json
{
  "type": "SMS",
  "description": "Qarzdorlik bo'yicha eslatma",
  "promisedAmount": 2000000,
  "promisedDate": "2024-02-15",
  "followupDate": "2024-02-10"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Follow-up muvaffaqiyatli yaratildi",
  "data": {
    "id": 1,
    "clientId": 1,
    "type": "SMS",
    "description": "Qarzdorlik bo'yicha eslatma",
    "promisedAmount": 2000000,
    "promisedDate": "2024-02-15",
    "followupDate": "2024-02-10",
    "status": "PENDING",
    "created_at": "2024-01-15T10:00:00.000Z",
    "created_by": 1
  }
}
```

**Service Layer Implementation:**
```typescript
async createFollowup(
  clientId: number,
  createFollowupDto: CreateFollowupDto,
  userId: number
): Promise<DebtFollowup> {
  // 1. Mijoz mavjudligini tekshirish
  const client = await this.prisma.client.findUnique({
    where: { id: clientId }
  });

  if (!client || client.deleted_at) {
    throw new NotFoundException('DR_002');
  }

  // 2. Mijozda qarz borligini tekshirish
  const debtVisits = await this.prisma.visit.findFirst({
    where: {
      client_id: clientId,
      debt_amount: { gt: 0 },
      deleted_at: null
    }
  });

  if (!debtVisits) {
    throw new BadRequestException('DR_003');
  }

  // 3. Follow-up yaratish
  const followup = await this.prisma.debtFollowup.create({
     {
      client_id: clientId,
      type: createFollowupDto.type,
      description: createFollowupDto.description,
      promised_amount: createFollowupDto.promisedAmount,
      promised_date: createFollowupDto.promisedDate,
      followup_date: createFollowupDto.followupDate,
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: userId
    }
  });

  // 4. Agar SMS/Email bo'lsa, notification yuborish
  if (createFollowupDto.type === 'SMS' || createFollowupDto.type === 'EMAIL') {
    await this.sendNotification(clientId, createFollowupDto.type);
  }

  return followup;
}
```

---

### 3.5 GET /api/v1/reports/debt/aging

**Tavsif:** Qarz yoshi (aging) hisoboti (Admin, Accountant)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "aging": [
      {
        "ageRange": "0-30 kun",
        "amount": 30000000,
        "count": 15,
        "percentage": 40.0
      },
      {
        "ageRange": "31-60 kun",
        "amount": 20000000,
        "count": 8,
        "percentage": 26.7
      },
      {
        "ageRange": "61-90 kun",
        "amount": 15000000,
        "count": 5,
        "percentage": 20.0
      },
      {
        "ageRange": "90+ kun",
        "amount": 10000000,
        "count": 2,
        "percentage": 13.3
      }
    ],
    "totalDebt": 75000000,
    "totalClients": 30
  }
}
```

---

### 3.6 POST /api/v1/reports/debt/export

**Tavsif:** Qarzdorlik hisobotini export qilish (Excel/PDF) (Admin, Accountant)

**Request Body:**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "excel",
  "includeDetails": true
}
```

**Response:** File Download
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// get-debt-report.dto.ts
import {
  IsDateString,
  IsNotEmpty
} from 'class-validator';

export class GetDebtReportDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

// get-debt-clients.dto.ts
import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsEnum
} from 'class-validator';

export class GetDebtClientsDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  min_debt?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  days_overdue?: number;

  @IsOptional()
  @IsEnum(['debt_amount', 'days_overdue', 'client_name'])
  sort_by?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: string;
}

// create-followup.dto.ts
import { IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';

export enum FollowupType {
  SMS = 'SMS',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  VISIT = 'VISIT',
  LEGAL = 'LEGAL'
}

export class CreateFollowupDto {
  @IsEnum(FollowupType)
  @IsNotEmpty()
  type: FollowupType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promisedAmount?: number;

  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @IsOptional()
  @IsDateString()
  followupDate?: string;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `start_date` | IsDateString | DR_004 | Sana formati noto'g'ri |
| `end_date` | IsDateString | DR_004 | Sana formati noto'g'ri |
| `end_date` | >= start_date | DR_004 | Tugash sana boshlanish sanadan keyin bo'lishi kerak |
| `type` | Enum | DR_006 | SMS/CALL/EMAIL/VISIT/LEGAL tanlang |
| `promisedAmount` | Min 0 | DR_007 | Summa manfiy bo'lishi mumkin emas |
| `page` | Min 1 | DR_008 | Sahifa 1 dan boshlanishi kerak |
| `limit` | Min 1, Max 100 | DR_008 | 1-100 oralig'ida |
| `min_debt` | Min 0 | DR_009 | Minimal qarz manfiy bo'lishi mumkin emas |
| `days_overdue` | Min 0 | DR_009 | Kunlar soni manfiy bo'lishi mumkin emas |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `DR_001` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `DR_002` | 404 Not Found | Mijoz topilmadi | Client ID not exists | Client ID ni tekshiring |
| `DR_003` | 400 Bad Request | Mijozda qarz yo'q | No debt for client | Qarzдорligini tekshiring |
| `DR_004` | 400 Bad Request | Sana formati noto'g'ri | Invalid date format | YYYY-MM-DD format kiriting |
| `DR_005` | 400 Bad Request | Limit noto'g'ri | Invalid limit | 1-100 oralig'ida |
| `DR_006` | 400 Bad Request | Follow-up turi noto'g'ri | Invalid followup type | SMS/CALL/EMAIL/VISIT/LEGAL tanlang |
| `DR_007` | 400 Bad Request | Summa noto'g'ri | Invalid amount | Musbat son kiriting |
| `DR_008` | 400 Bad Request | Sahifa noto'g'ri | Invalid page | 1 dan boshlang |
| `DR_009` | 400 Bad Request | Filter qiymati noto'g'ri | Invalid filter value | Musbat son kiriting |
| `DR_010` | 500 Internal Server Error | Hisobot yaratishda xatolik | Calculation error | Admin bilan bog'laning |

### 5.2 Exception Filter

```typescript
// debt-report-exception.filter.ts
@Catch()
export class DebtReportExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ForbiddenException) return 'DR_001';
    if (exception instanceof NotFoundException) return 'DR_002';
    if (exception instanceof BadRequestException) return 'DR_004';
    return 'DR_010';
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
| GET /debt | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /debt/clients | ✅ | ❌ | ❌ | ✅ | ✅ |
| GET /debt/aging | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /debt/:id/followup | ✅ | ❌ | ❌ | ✅ | ✅ |
| POST /debt/export | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Harakat | Log Qilinadi | Saqlash Muddati |
|--------|-------------|-----------------|
| Hisobot ko'rish | ✅ | 5 yil |
| Follow-up yaratish | ✅ | 5 yil |
| Export qilish | ✅ | 5 yil |
| Cache access | ✅ | 30 kun |

### 6.4 Ma'lumotlar Xavfsizligi (Reference: `Klinika.md` 8.1)
- ✅ Moliyaviy ma'lumotlar faqat Admin/Accountant uchun
- ✅ Mijoz ma'lumotlari konfidensial
- ✅ Export fayllar vaqtinchalik saqlanadi (24 soat)
- ✅ Follow-up ma'lumotlari audit qilinadi
- ✅ Telefon raqamlar himoyalangan (faqat ruxsat berilgan rollar)

---

## 7. CACHE STRATEGY (Reference: `Klinika.md` 9.1)

### 7.1 Caching Configuration

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Debt Report | Redis | 15 daqiqa | Payment create/update, Visit update |
| Debt Client List | Redis | 15 daqiqa | Payment create/update |
| Debt Aging | Redis | 30 daqiqa | Payment create/update |
| Export File | Redis | 24 soat | Automatic expiry |

### 7.2 Cache Implementation

```typescript
// Cache service
async getDebtReport(startDate: Date, endDate: Date): Promise<DebtReport> {
  const cacheKey = `debt_report:${startDate.toISOString()}:${endDate.toISOString()}`;
  
  // 1. Cache dan olish
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }
  
  this.logger.debug(`Cache miss for ${cacheKey}`);
  
  // 2. DB dan hisoblash
  const report = await this.calculateDebtReport(startDate, endDate);
  
  // 3. Cache ga saqlash (15 daqiqa)
  await this.cacheService.set(cacheKey, report, { ttl: 900 });
  
  return report;
}

// Cache invalidation
async invalidateDebtReportCache(startDate: Date, endDate: Date): Promise<void> {
  const cacheKey = `debt_report:${startDate.toISOString()}:${endDate.toISOString()}`;
  await this.cacheService.del(cacheKey);
  
  this.logger.log(`Cache invalidated for ${cacheKey}`);
}

// Event-based invalidation
@Events('payment.created')
async onPaymentCreated(event: PaymentCreatedEvent) {
  await this.invalidateDebtReportCache(event.startDate, event.endDate);
}

@Events('visit.updated')
async onVisitUpdated(event: VisitUpdatedEvent) {
  if (event.debt_amount_changed) {
    await this.invalidateDebtReportCache(event.startDate, event.endDate);
  }
}
```

---

## 8. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 8.1 Database Query Optimization

```typescript
// ✅ Yaxshi - Parallel queries
const [summary, aging, topDebtors] = await Promise.all([
  this.calculateDebtSummary(debtVisits, startDate, endDate),
  this.calculateDebtAging(debtVisits),
  this.getTopDebtors(debtVisits, limit)
]);

// ✅ Yaxshi - Faqat kerakli maydonlar
const debtVisits = await this.prisma.visit.findMany({
  select: { 
    id: true, 
    client_id: true, 
    debt_amount: true,
    visit_date: true
  },
  where: { 
    debt_amount: { gt: 0 },
    visit_date: { gte: startDate, lt: endDate },
    deleted_at: null
  }
});

// ✅ Yaxshi - Indexlardan foydalanish
const debtVisits = await this.prisma.visit.findMany({
  where: { 
    debt_amount: { gt: 0 },
    visit_date: {
      gte: startDate,
      lt: endDate
    },
    deleted_at: null
  }
  // Uses index: @@index([client_id, visit_date])
});

// ❌ Yomon - Barcha maydonlar
const debtVisits = await this.prisma.visit.findMany({
  where: { 
    debt_amount: { gt: 0 }
  }
});
```

### 8.2 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat | Measurement |
|-------------|--------|-------------|
| Report Generation Time | < 5 seconds | P95 |
| Cache Hit Rate | > 80% | Daily average |
| Export Generation Time | < 15 seconds | P95 |
| API Response Time | < 500ms (cached) | P95 |
| Concurrent Users | 50+ | Peak load |
| Data Freshness | 15 minutes | Cache TTL |

### 8.3 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
// Visit
@@index([client_id])              // Mijoz filter uchun (eng muhim)
@@index([visit_date])             // Sana filter uchun
@@index([client_id, visit_date])  // Mijoz va sana uchun (qo'shma)
@@index([status, visit_date])     // Status va sana uchun

// Client
@@index([phone])                  // Telefon qidiruv uchun
@@index([status])                 // Status filter uchun

// Payment
@@index([client_id])              // Mijoz filter uchun
@@index([payment_date])           // Sana filter uchun
@@index([client_id, payment_date]) // Mijoz va sana uchun
```

---

## 9. TEST TALABLARI

### 9.1 Unit Test Coverage (Reference: `Klinika.md` 9.1)

| Test Type | Minimum Coverage | Priority |
|-----------|-----------------|----------|
| Service Layer | 90% | 🔴 High |
| Controller Layer | 80% | 🟡 Medium |
| Cache Logic | 95% | 🔴 High |
| Integration | 70% | 🟡 Medium |

### 9.2 Test Cases

```typescript
// debt-report.service.spec.ts
describe('DebtReportService', () => {
  let service: DebtReportService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DebtReportService, PrismaService, CacheService],
    }).compile();

    service = module.get<DebtReportService>(DebtReportService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getDebtReport', () => {
    it('should return debt report from cache', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const cachedReport = { summary: { totalDebt: 75000000 } };
      
      cacheService.get = jest.fn().mockResolvedValue(cachedReport);
      
      const result = await service.getDebtReport(startDate, endDate, 1, 'Admin');
      
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate debt report if cache miss', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      cacheService.get = jest.fn().mockResolvedValue(null);
      prisma.visit.findMany = jest.fn().mockResolvedValue([]);
      cacheService.set = jest.fn().mockResolvedValue(null);
      
      const result = await service.getDebtReport(startDate, endDate, 1, 'Admin');
      
      expect(result.cached).toBe(false);
      expect(prisma.visit.findMany).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('debt_report'),
        expect.any(Object),
        { ttl: 900 }
      );
    });

    it('should throw ForbiddenException for unauthorized role', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      await expect(
        service.getDebtReport(startDate, endDate, 1, 'Doctor')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createFollowup', () => {
    it('should create followup successfully', async () => {
      const dto: CreateFollowupDto = {
        type: 'SMS',
        description: 'Test followup'
      };
      
      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.findFirst = jest.fn().mockResolvedValue({ debt_amount: 1000000 });
      prisma.debtFollowup.create = jest.fn().mockResolvedValue({ id: 1, ...dto });
      
      const result = await service.createFollowup(1, dto, 1);
      
      expect(result.id).toBe(1);
      expect(prisma.debtFollowup.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if client has no debt', async () => {
      const dto: CreateFollowupDto = {
        type: 'SMS'
      };
      
      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.findFirst = jest.fn().mockResolvedValue(null);
      
      await expect(service.createFollowup(1, dto, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

Debt Report alohida jadval emas, shuning uchun migration kerak emas. DebtFollowup jadvali kelajakda qo'shiladi.

```bash
# Hech qanday migration kerak emas (hozircha)
# Report mavjud ma'lumotlardan real-time hosil qilinadi

# Kelajakda DebtFollowup uchun:
npx prisma migrate dev --name create_debt_followup
```

### 10.2 Redis Configuration

```bash
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
DEBT_REPORT_CACHE_TTL=900  # 15 daqiqa
DEBT_AGING_CACHE_TTL=1800  # 30 daqiqa
EXPORT_CACHE_TTL=86400  # 24 soat
```

### 10.3 Deployment Checklist

- [ ] Redis server konfiguratsiyasi
- [ ] Cache service integration
- [ ] Unit test coverage 90%+
- [ ] E2E test o'tkazildi
- [ ] API documentation yangilandi
- [ ] Security audit o'tkazildi (Reference: `Klinika.md` 8)
- [ ] Performance test o'tkazildi (Reference: `Klinika.md` 9.1)
- [ ] Cache invalidation test qilindi
- [ ] Export functionality test qilindi
- [ ] RBAC test qilindi
- [ ] Large dataset test qilindi (10000+ visits)

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `24-debt-report-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| Client RFC | `RFC-009-client-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| ClientPaid RFC | `RFC-015-client-paid-management.md` | ✅ Tasdiqlandi |
| Daily Report RFC | `RFC-019-daily-report-management.md` | ✅ Tasdiqlandi |
| Monthly Report RFC | `RFC-020-monthly-report-management.md` | ✅ Tasdiqlandi |
| Doctor Performance RFC | `RFC-021-doctor-performance-management.md` | ✅ Tasdiqlandi |
| Client Report RFC | `RFC-022-client-report-management.md` | ✅ Tasdiqlandi |
| Service Report RFC | `RFC-023-service-report-management.md` | ✅ Tasdiqlandi |
| Dashboard Metrics RFC | `RFC-025-dashboard-metrics-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Umumiy qarzdorlik statistikasi to'g'ri hisoblanishi
- [ ] Qarz yoshi (aging) to'g'ri hisoblanishi
- [ ] Qarzдор mijozlar ro'yxati to'g'ri ishlashi
- [ ] Follow-up yaratish ishlashi
- [ ] Vaqt trendi to'g'ri hisoblanishi
- [ ] Undirish statistikasi to'g'ri ishlashi
- [ ] Cache strategiyasi ishlashi (15 daqiqa TTL)
- [ ] Export funksiyasi ishlashi (Excel/PDF)
- [ ] RBAC to'g'ri ishlashi (Reference: `Klinika.md` 6.1)
- [ ] Sana validatsiyasi ishlashi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytarilishi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 5 seconds (hisobot yaratish)
- [ ] API response time < 500ms (cached)
- [ ] Cache hit rate > 80%
- [ ] Export generation time < 15 seconds
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
| Performance degradation | O'rta | Yuqori | Caching + parallel queries |
| Cache inconsistency | O'rta | O'rta | Event-based invalidation |
| Large data volume | Past | O'rta | Pagination + date range limit |
| Export timeout | Past | O'rta | Background job + notification |
| RBAC bypass | Past | Yuqori | Middleware + unit tests |
| Data accuracy | O'rta | Yuqori | Validation + audit logs |
| Cache memory usage | Past | O'rta | TTL + LRU eviction |
| Privacy concerns | Past | Yuqori | Data encryption + access control |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Automated SMS reminders | 🟡 Medium | Phase 4 |
| Email notification system | 🟢 Low | Phase 4 |
| Payment plan management | 🟡 Medium | Phase 4 |
| Legal action tracking | 🟢 Low | Phase 4 |
| Debt collection agency integration | 🟢 Low | Phase 5 |
| AI-powered collection predictions | 🟢 Low | Phase 5 |
| Mobile app debt notifications | 🟢 Low | Phase 4 |
| Automatic balance updates | 🟡 Medium | Phase 4 |

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