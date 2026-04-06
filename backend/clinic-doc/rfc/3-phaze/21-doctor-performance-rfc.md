# 📋 RFC-021: Shifokor Ish Ko'rsatkichlari Boshqaruvi (Doctor Performance Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-021 |
| **Nomi** | Doctor Performance Management |
| **Phase** | 3 - Reports & Analytics |
| **Model** | `Report` (Virtual - mavjud ma'lumotlardan hosil qilinadi) |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Analytics) |
| **Bog'liq RFC** | RFC-002 (User), RFC-013 (Visit), RFC-018 (ServiceUser) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 5.2, 6.1, 7.1, 7.2, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC shifokorlarning ish ko'rsatkichlarini kuzatish, tahlil qilish va hisobot qilish uchun to'liq texnik specifikatsiyani taqdim etadi. Har bir shifokor uchun qabul qilingan bemorlar soni, ko'rsatilgan xizmatlar, daromad, komissiya va boshqa metrikalarni hisoblash. Shifokorlar yuklamasini optimallashtirish va rag'batlantirish tizimini yaratish (Reference: `Klinika.md` 7.1, 7.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Shifokor ko'rsatkichlarini hisoblash | ❌ Shifokor baholash tizimi |
| ✅ Shifokor reytingi | ❌ Frontend implementatsiya |
| ✅ Shifokor trend tahlili | ❌ Mobile integratsiya |
| ✅ Shifokor hisoboti export | ❌ Avtomatik email yuborish |
| ✅ Vaqt metrikalari | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 7.1, 7.2)
- Shifokorlar ish samaradorligini kuzatish
- Adolatli komissiya hisoblash tizimi
- Shifokorlar yuklamasini optimallashtirish
- Rag'batlantirish tizimi uchun asos
- Mijozlar qoniqishini oshirish
- Klinika daromadini maksimallashtirish

---

## 2. MA'LUMOTLAR MODELI

### 2.1 Virtual Report Model

Doctor Performance Report alohida jadvalda saqlanmaydi. U quyidagi jadvallardan real-time hosil qilinadi:

```
┌─────────────────────────────────────────────────────────────┐
│           DOCTOR PERFORMANCE DATA SOURCES                   │
├─────────────────────────────────────────────────────────────┤
│  Visit          → Qabullar soni, statusi                    │
│  VisitService   → Ko'rsatilgan xizmatlar                    │
│  ServiceUser    → Shifokor stavkalari                       │
│  Service        → Xizmat narxlari                           │
│  User           → Shifokor ma'lumotlari                     │
│  VisitRoom      → Qabul davomiyligi                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Report Tuzilishi

```typescript
interface DoctorPerformanceMetrics {
  doctorId: number;
  doctorName: string;
  period: {
    from: Date;
    to: Date;
  };
  basicMetrics: BasicMetrics;
  financialMetrics: FinancialMetrics;
  serviceMetrics: ServiceMetrics;
  timeMetrics: TimeMetrics;
  visitStatusMetrics: VisitStatusMetrics;
}

interface BasicMetrics {
  totalVisits: number;        // Jami qabullar
  completedVisits: number;    // Yakunlangan qabullar
  cancelledVisits: number;    // Bekor qilingan
  noShowVisits: number;       // Kelmagan mijozlar
  totalPatients: number;      // Jami bemorlar (unikal)
  newPatients: number;        // Yangi bemorlar
  returningPatients: number;  // Qaytgan bemorlar
}

interface FinancialMetrics {
  totalRevenue: number;       // Jami daromad
  commission: number;         // Shifokor komissiyasi
  averageCheck: number;       // O'rtacha check
  averageCommission: number;  // O'rtacha komissiya
}

interface ServiceMetrics {
  totalServices: number;      // Jami xizmatlar
  topServices: TopService[];  // Eng ko'p xizmatlar
}

interface TimeMetrics {
  averageVisitDuration: number;  // O'rtacha qabul vaqti (daqiqa)
  workingHours: number;          // Ish soatlari
  efficiency: number;            // Samaradorlik foizi
}

interface VisitStatusMetrics {
  completionRate: number;   // Yakunlash foizi
  cancellationRate: number; // Bekor qilish foizi
  noShowRate: number;       // No-show foizi
}

interface TopService {
  serviceId: number;
  serviceName: string;
  count: number;
  revenue: number;
  commission: number;
}
```

### 2.3 Ma'lumotlar Oqimi

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Database  │ →  │  Calculator │ →  │   Report    │
│   Queries   │    │   Service   │    │   JSON      │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
Visit, VisitService,  Aggregate,      Cache Store
Service, ServiceUser  Calculate       (10 min TTL)
                      Metrics
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | GET | `/api/v1/reports/doctor-performance/:doctorId` | ✅ JWT | Admin, Doctor (faqat o'zi), Accountant | Shifokor ko'rsatkichlarini olish |
| 2 | GET | `/api/v1/reports/doctor-performance/ranking` | ✅ JWT | Admin, Accountant | Shifokorlar reytingi |
| 3 | GET | `/api/v1/reports/doctor-performance/:doctorId/trend` | ✅ JWT | Admin, Doctor (faqat o'zi), Accountant | Shifokor trend tahlili |
| 4 | POST | `/api/v1/reports/doctor-performance/export` | ✅ JWT | Admin, Accountant | Shifokor hisoboti export (Excel/PDF) |

---

### 3.2 GET /api/v1/reports/doctor-performance/:doctorId

**Tavsif:** Shifokor ko'rsatkichlarini olish (Admin, Doctor - faqat o'zi, Accountant)

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
GET /api/v1/reports/doctor-performance/2?start_date=2024-01-01&end_date=2024-01-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "doctorName": "Dr. John Smith",
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "basicMetrics": {
      "totalVisits": 150,
      "completedVisits": 135,
      "cancelledVisits": 10,
      "noShowVisits": 5,
      "totalPatients": 120,
      "newPatients": 45,
      "returningPatients": 75
    },
    "financialMetrics": {
      "totalRevenue": 45000000,
      "commission": 13500000,
      "averageCheck": 300000,
      "averageCommission": 90000
    },
    "serviceMetrics": {
      "totalServices": 300,
      "topServices": [
        {
          "serviceId": 1,
          "serviceName": "Terapevt ko'rigi",
          "count": 80,
          "revenue": 24000000,
          "commission": 7200000
        }
      ]
    },
    "timeMetrics": {
      "averageVisitDuration": 25.5,
      "workingHours": 160,
      "efficiency": 78.5
    },
    "visitStatusMetrics": {
      "completionRate": 90.0,
      "cancellationRate": 6.7,
      "noShowRate": 3.3
    }
  },
  "generatedAt": "2024-02-01T10:00:00.000Z",
  "cached": true
}
```

**Service Layer Implementation:**
```typescript
// doctor-performance.service.ts
async getDoctorPerformance(
  doctorId: number,
  startDate: Date,
  endDate: Date,
  currentUserId: number,
  currentUserRole: string
): Promise<DoctorPerformanceMetrics> {
  // 1. RBAC tekshiruvi (Reference: Klinika.md 6.1)
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant' && currentUserId !== doctorId) {
    throw new ForbiddenException('DR_001');
  }

  // 2. Shifokor mavjudligini tekshirish
  const doctor = await this.prisma.user.findUnique({
    where: { id: doctorId },
    include: { role: true }
  });

  if (!doctor || doctor.deleted_at || doctor.role?.name !== 'Doctor') {
    throw new NotFoundException('DR_002');
  }

  // 3. Visitlarni olish
  const visits = await this.prisma.visit.findMany({
    where: {
      doctor_id: doctorId,
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
          created_at: true
        }
      },
      visit_services: {
        include: {
          service: true
        }
      }
    }
  });

  // 4. Asosiy metrikalarni hisoblash
  const basicMetrics = await this.calculateBasicMetrics(visits, doctorId, startDate, endDate);
  
  // 5. Moliyaviy metrikalarni hisoblash
  const financialMetrics = await this.calculateFinancialMetrics(visits, doctorId, startDate, endDate);
  
  // 6. Xizmat metrikalarni hisoblash
  const serviceMetrics = await this.calculateServiceMetrics(visits);
  
  // 7. Vaqt metrikalarni hisoblash
  const timeMetrics = await this.calculateTimeMetrics(visits);
  
  // 8. Visit status metrikalarni hisoblash
  const visitStatusMetrics = this.calculateVisitStatusMetrics(visits);

  return {
    doctorId,
    doctorName: doctor.full_name,
    period: {
      from: startDate,
      to: endDate
    },
    basicMetrics,
    financialMetrics,
    serviceMetrics,
    timeMetrics,
    visitStatusMetrics
  };
}

// Asosiy metrikalarni hisoblash
private async calculateBasicMetrics(
  visits: Visit[],
  doctorId: number,
  startDate: Date,
  endDate: Date
): Promise<BasicMetrics> {
  const totalVisits = visits.length;
  
  const completedVisits = visits.filter(v => 
    v.status === 'COMPLETED' || v.status === 'DONE'
  ).length;
  
  const cancelledVisits = visits.filter(v => v.status === 'CANCELLED').length;
  const noShowVisits = visits.filter(v => v.status === 'NO_SHOW').length;
  
  // Unikal bemorlar
  const uniquePatients = new Set(visits.map(v => v.client_id));
  const totalPatients = uniquePatients.size;
  
  // Yangi bemorlar (shifokorda birinchi marta)
  const newPatients = await this.prisma.visit.count({
    where: {
      doctor_id: doctorId,
      client_id: {
        in: Array.from(uniquePatients)
      },
      visit_date: {
        lt: startDate
      },
      deleted_at: null
    },
    distinct: ['client_id']
  });
  
  const returningPatients = totalPatients - newPatients;

  return {
    totalVisits,
    completedVisits,
    cancelledVisits,
    noShowVisits,
    totalPatients,
    newPatients,
    returningPatients
  };
}

// Moliyaviy metrikalarni hisoblash
private async calculateFinancialMetrics(
  visits: Visit[],
  doctorId: number,
  startDate: Date,
  endDate: Date
): Promise<FinancialMetrics> {
  const totalRevenue = visits.reduce((sum, v) => sum + v.total_amount.toNumber(), 0);
  
  // Komissiyani hisoblash
  let commission = 0;
  
  for (const visit of visits) {
    for (const vs of visit.visit_services) {
      const serviceUser = await this.prisma.serviceUser.findFirst({
        where: {
          service_id: vs.service_id,
          user_id: doctorId,
          status: 'ACTIVE',
          deleted_at: null
        }
      });
      
      if (serviceUser) {
        if (serviceUser.type === 'FIXED') {
          commission += serviceUser.value.toNumber() * vs.quantity;
        } else if (serviceUser.type === 'PERCENT') {
          commission += vs.service.price.toNumber() * (serviceUser.value.toNumber() / 100) * vs.quantity;
        }
      }
    }
  }
  
  const averageCheck = visits.length > 0 
    ? Math.round((totalRevenue / visits.length) * 100) / 100
    : 0;
  
  const averageCommission = visits.length > 0
    ? Math.round((commission / visits.length) * 100) / 100
    : 0;

  return {
    totalRevenue,
    commission,
    averageCheck,
    averageCommission
  };
}
```

---

### 3.3 GET /api/v1/reports/doctor-performance/ranking

**Tavsif:** Shifokorlar reytingi (Admin, Accountant)

**Query Parameters:**
| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi |
| `end_date` | date | ✅ | - | Tugash sanasi |
| `limit` | number | ❌ | 10 | Reytingdagi shifokorlar soni |

**Request Example:**
```http
GET /api/v1/reports/doctor-performance/ranking?start_date=2024-01-01&end_date=2024-01-31&limit=10
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
    "rankings": [
      {
        "rank": 1,
        "doctorId": 2,
        "doctorName": "Dr. John Smith",
        "totalVisits": 150,
        "totalRevenue": 45000000,
        "commission": 13500000,
        "completionRate": 90.0,
        "score": 87.5
      },
      {
        "rank": 2,
        "doctorId": 3,
        "doctorName": "Dr. Jane Doe",
        "totalVisits": 140,
        "totalRevenue": 42000000,
        "commission": 12600000,
        "completionRate": 88.5,
        "score": 85.2
      }
    ]
  }
}
```

**Service Layer Implementation:**
```typescript
async getDoctorRanking(
  startDate: Date,
  endDate: Date,
  limit: number = 10,
  currentUserId: number,
  currentUserRole: string
): Promise<DoctorRanking> {
  // 1. RBAC tekshiruvi
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
    throw new ForbiddenException('DR_001');
  }

  // 2. Barcha shifokorlarni olish
  const doctors = await this.prisma.user.findMany({
    where: {
      role: {
        name: 'Doctor'
      },
      deleted_at: null
    },
    select: {
      id: true,
      full_name: true
    }
  });

  // 3. Har bir shifokor uchun metrikalarni hisoblash
  const rankings = await Promise.all(
    doctors.map(async (doctor) => {
      const performance = await this.getDoctorPerformance(
        doctor.id,
        startDate,
        endDate,
        currentUserId,
        currentUserRole
      );

      // 4. Ball hisoblash (weighted score)
      const score = this.calculateDoctorScore(performance);

      return {
        doctorId: doctor.id,
        doctorName: doctor.full_name,
        totalVisits: performance.basicMetrics.totalVisits,
        totalRevenue: performance.financialMetrics.totalRevenue,
        commission: performance.financialMetrics.commission,
        completionRate: performance.visitStatusMetrics.completionRate,
        score
      };
    })
  );

  // 5. Reyting bo'yicha sort
  rankings.sort((a, b) => b.score - a.score);

  // 6. Rank qo'shish va limit
  const rankedData = rankings.slice(0, limit).map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  return {
    period: {
      from: startDate,
      to: endDate
    },
    rankings: rankedData
  };
}

// Shifokor ballini hisoblash
private calculateDoctorScore(performance: DoctorPerformanceMetrics): number {
  // Weighted scoring system
  const weights = {
    visits: 0.3,        // Qabullar soni (30%)
    revenue: 0.3,       // Daromad (30%)
    completion: 0.2,    // Yakunlash foizi (20%)
    efficiency: 0.2     // Samaradorlik (20%)
  };

  // Normalize metrics (0-100 scale)
  const visitScore = Math.min(performance.basicMetrics.totalVisits / 10, 100);
  const revenueScore = Math.min(performance.financialMetrics.totalRevenue / 10000000, 100);
  const completionScore = performance.visitStatusMetrics.completionRate;
  const efficiencyScore = performance.timeMetrics.efficiency;

  const score = 
    (visitScore * weights.visits) +
    (revenueScore * weights.revenue) +
    (completionScore * weights.completion) +
    (efficiencyScore * weights.efficiency);

  return Math.round(score * 10) / 10;
}
```

---

### 3.4 GET /api/v1/reports/doctor-performance/:doctorId/trend

**Tavsif:** Shifokor ko'rsatkichlari trendi (Admin, Doctor - faqat o'zi, Accountant)

**Query Parameters:**
| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi |
| `end_date` | date | ✅ | - | Tugash sanasi |
| `interval` | string | ❌ | month | Intervallar (day/week/month) |

**Request Example:**
```http
GET /api/v1/reports/doctor-performance/2/trend?start_date=2024-01-01&end_date=2024-03-31&interval=month
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "interval": "month",
    "trend": [
      {
        "period": {
          "from": "2024-01-01T00:00:00.000Z",
          "to": "2024-01-31T23:59:59.999Z"
        },
        "visits": 150,
        "revenue": 45000000,
        "commission": 13500000,
        "completionRate": 90.0
      },
      {
        "period": {
          "from": "2024-02-01T00:00:00.000Z",
          "to": "2024-02-29T23:59:59.999Z"
        },
        "visits": 160,
        "revenue": 48000000,
        "commission": 14400000,
        "completionRate": 91.5
      }
    ],
    "changes": {
      "visitsChange": 6.7,
      "revenueChange": 6.7,
      "commissionChange": 6.7
    }
  }
}
```

**Service Layer Implementation:**
```typescript
async getDoctorPerformanceTrend(
  doctorId: number,
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' = 'month',
  currentUserId: number,
  currentUserRole: string
): Promise<DoctorPerformanceTrend> {
  // 1. RBAC tekshiruvi
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant' && currentUserId !== doctorId) {
    throw new ForbiddenException('DR_001');
  }

  // 2. Intervallar bo'yicha guruhlash
  const intervals = this.generateIntervals(startDate, endDate, interval);
  
  // 3. Har bir interval uchun metrikalarni hisoblash
  const trend = await Promise.all(
    intervals.map(async (interval) => {
      const performance = await this.getDoctorPerformance(
        doctorId,
        interval.from,
        interval.to,
        currentUserId,
        currentUserRole
      );

      return {
        period: interval,
        visits: performance.basicMetrics.totalVisits,
        revenue: performance.financialMetrics.totalRevenue,
        commission: performance.financialMetrics.commission,
        completionRate: performance.visitStatusMetrics.completionRate
      };
    })
  );

  // 4. O'zgarishlarni hisoblash
  const changes = this.calculateTrendChanges(trend);

  return {
    doctorId,
    interval,
    trend,
    changes
  };
}

// Trend o'zgarishlarini hisoblash
private calculateTrendChanges(trend: TrendData[]): TrendChanges {
  if (trend.length < 2) {
    return {
      visitsChange: 0,
      revenueChange: 0,
      commissionChange: 0
    };
  }

  const first = trend[0];
  const last = trend[trend.length - 1];

  return {
    visitsChange: first.visits > 0
      ? Math.round(((last.visits - first.visits) / first.visits) * 100 * 10) / 10
      : 0,
    revenueChange: first.revenue > 0
      ? Math.round(((last.revenue - first.revenue) / first.revenue) * 100 * 10) / 10
      : 0,
    commissionChange: first.commission > 0
      ? Math.round(((last.commission - first.commission) / first.commission) * 100 * 10) / 10
      : 0
  };
}
```

---

### 3.5 POST /api/v1/reports/doctor-performance/export

**Tavsif:** Shifokor hisobotini export qilish (Excel/PDF) (Admin, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface ExportDoctorPerformanceDto {
  doctorId: number;     // Shifokor ID
  start_date: Date;     // Boshlanish sanasi
  end_date: Date;       // Tugash sanasi
  format: 'excel' | 'pdf';  // Export formati
}
```

**Request Body Example:**
```json
{
  "doctorId": 2,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "format": "excel"
}
```

**Response:** File Download
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`

**Service Layer Implementation:**
```typescript
async exportDoctorPerformance(exportDto: ExportDoctorPerformanceDto, userId: number): Promise<Buffer> {
  // 1. Hisobot ma'lumotlarini olish
  const performance = await this.getDoctorPerformance(
    exportDto.doctorId,
    exportDto.start_date,
    exportDto.end_date,
    userId,
    'Admin'
  );
  
  // 2. Formatga qarab export qilish
  if (exportDto.format === 'excel') {
    return this.generateExcel(performance);
  } else if (exportDto.format === 'pdf') {
    return this.generatePDF(performance);
  }
  
  throw new BadRequestException('DR_006');
}

// Excel generatsiya
private async generateExcel(performance: DoctorPerformanceMetrics): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.properties.created = new Date();
  workbook.properties.creator = 'Klinika CRM';
  
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Umumiy');
  summarySheet.columns = [
    { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
    { header: 'Qiymat', key: 'value', width: 20 }
  ];
  summarySheet.addRows([
    { metric: 'Shifokor', value: performance.doctorName },
    { metric: 'Davr', value: `${performance.period.from} - ${performance.period.to}` },
    { metric: 'Jami Visitlar', value: performance.basicMetrics.totalVisits },
    { metric: 'Yakunlangan Visitlar', value: performance.basicMetrics.completedVisits },
    { metric: 'Jami Daromad', value: performance.financialMetrics.totalRevenue },
    { metric: 'Komissiya', value: performance.financialMetrics.commission },
    { metric: 'O\'rtacha Check', value: performance.financialMetrics.averageCheck },
    { metric: 'Yakunlash Foizi', value: `${performance.visitStatusMetrics.completionRate}%` }
  ]);
  
  // Xizmatlar sheet
  const serviceSheet = workbook.addWorksheet('Xizmatlar');
  serviceSheet.columns = [
    { header: 'Xizmat', key: 'name', width: 30 },
    { header: 'Soni', key: 'count', width: 15 },
    { header: 'Summa', key: 'revenue', width: 20 },
    { header: 'Komissiya', key: 'commission', width: 20 }
  ];
  serviceSheet.addRows(performance.serviceMetrics.topServices.map(s => ({
    name: s.serviceName,
    count: s.count,
    revenue: s.revenue,
    commission: s.commission
  })));
  
  // Buffer ga convert
  return await workbook.xlsx.writeBuffer();
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// get-doctor-performance.dto.ts
import {
  IsInt,
  Min,
  IsNotEmpty,
  IsDateString,
  IsOptional
} from 'class-validator';

export class GetDoctorPerformanceDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  doctor_id: number;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

// get-doctor-ranking.dto.ts
export class GetDoctorRankingDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// get-doctor-trend.dto.ts
import { IsEnum } from 'class-validator';

export enum TrendInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export class GetDoctorTrendDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsOptional()
  @IsEnum(TrendInterval)
  interval?: TrendInterval;
}

// export-doctor-performance.dto.ts
export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export class ExportDoctorPerformanceDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  doctorId: number;

  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `doctor_id` | IsInt | DR_002 | Shifokor ID raqam bo'lishi kerak |
| `doctor_id` | Min 1 | DR_002 | Shifokor ID musbat bo'lishi kerak |
| `doctor_id` | Must Exist | DR_002 | Shifokor topilmadi |
| `start_date` | IsDateString | DR_003 | Sana formati noto'g'ri |
| `end_date` | IsDateString | DR_003 | Sana formati noto'g'ri |
| `end_date` | >= start_date | DR_003 | Tugash sana boshlanish sanadan keyin bo'lishi kerak |
| `interval` | Enum | DR_004 | day/week/month tanlang |
| `format` | Enum | DR_006 | excel/pdf tanlang |
| `limit` | Min 1, Max 100 | DR_005 | 1-100 oralig'ida |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `DR_001` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `DR_002` | 404 Not Found | Shifokor topilmadi | Doctor ID not exists | Doctor ID ni tekshiring |
| `DR_003` | 400 Bad Request | Sana formati noto'g'ri | Invalid date format | YYYY-MM-DD format kiriting |
| `DR_004` | 400 Bad Request | Intervallar noto'g'ri | Invalid interval | day/week/month tanlang |
| `DR_005` | 400 Bad Request | Limit noto'g'ri | Invalid limit | 1-100 oralig'ida |
| `DR_006` | 400 Bad Request | Export formati noto'g'ri | Invalid format | excel/pdf tanlang |
| `DR_007` | 500 Internal Server Error | Hisobot yaratishda xatolik | Calculation error | Admin bilan bog'laning |

### 5.2 Exception Filter

```typescript
// doctor-performance-exception.filter.ts
@Catch()
export class DoctorPerformanceExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof BadRequestException) return 'DR_003';
    return 'DR_007';
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
| GET /doctor-performance/:id | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| GET /doctor-performance/ranking | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /doctor-performance/:id/trend | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| POST /doctor-performance/export | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Harakat | Log Qilinadi | Saqlash Muddati |
|--------|-------------|-----------------|
| Hisobot ko'rish | ✅ | 5 yil |
| Export qilish | ✅ | 5 yil |
| Cache access | ✅ | 30 kun |

### 6.4 Ma'lumotlar Xavfsizligi (Reference: `Klinika.md` 8.1)
- ✅ Doctor faqat o'z hisobotini ko'ra oladi
- ✅ Moliyaviy ma'lumotlar faqat Admin/Accountant uchun
- ✅ Export fayllar vaqtinchalik saqlanadi (24 soat)
- ✅ Cache ma'lumotlari shifrlangan

---

## 7. CACHE STRATEGY (Reference: `Klinika.md` 9.1)

### 7.1 Caching Configuration

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Doctor Performance | Redis | 10 daqiqa | Visit create/update/delete |
| Doctor Ranking | Redis | 30 daqiqa | Visit complete |
| Doctor Trend | Redis | 15 daqiqa | Visit create/update |
| Export File | Redis | 24 soat | Automatic expiry |

### 7.2 Cache Implementation

```typescript
// Cache service
async getDoctorPerformance(
  doctorId: number,
  startDate: Date,
  endDate: Date
): Promise<DoctorPerformanceMetrics> {
  const cacheKey = `doctor_performance:${doctorId}:${startDate.toISOString()}:${endDate.toISOString()}`;
  
  // 1. Cache dan olish
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }
  
  this.logger.debug(`Cache miss for ${cacheKey}`);
  
  // 2. DB dan hisoblash
  const performance = await this.calculateDoctorPerformance(doctorId, startDate, endDate);
  
  // 3. Cache ga saqlash (10 daqiqa)
  await this.cacheService.set(cacheKey, performance, { ttl: 600 });
  
  return performance;
}

// Cache invalidation
async invalidateDoctorPerformanceCache(doctorId: number, startDate: Date, endDate: Date): Promise<void> {
  const cacheKey = `doctor_performance:${doctorId}:${startDate.toISOString()}:${endDate.toISOString()}`;
  await this.cacheService.del(cacheKey);
  
  this.logger.log(`Cache invalidated for ${cacheKey}`);
}

// Event-based invalidation
@Events('visit.created')
async onVisitCreated(event: VisitCreatedEvent) {
  if (event.doctorId) {
    await this.invalidateDoctorPerformanceCache(event.doctorId, event.startDate, event.endDate);
  }
}

@Events('visit.completed')
async onVisitCompleted(event: VisitCompletedEvent) {
  if (event.doctorId) {
    await this.invalidateDoctorPerformanceCache(event.doctorId, event.startDate, event.endDate);
  }
}
```

---

## 8. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 8.1 Database Query Optimization

```typescript
// ✅ Yaxshi - Parallel queries
const [basicMetrics, financialMetrics, serviceMetrics] = await Promise.all([
  this.calculateBasicMetrics(visits, doctorId, startDate, endDate),
  this.calculateFinancialMetrics(visits, doctorId, startDate, endDate),
  this.calculateServiceMetrics(visits)
]);

// ✅ Yaxshi - Faqat kerakli maydonlar
const visits = await this.prisma.visit.findMany({
  select: { 
    id: true, 
    status: true, 
    total_amount: true,
    doctor_id: true,
    client_id: true,
    visit_date: true
  },
  where: { 
    doctor_id: doctorId,
    visit_date: { gte: startDate, lt: endDate },
    deleted_at: null
  }
});

// ✅ Yaxshi - Indexlardan foydalanish
const visits = await this.prisma.visit.findMany({
  where: { 
    doctor_id: doctorId,
    visit_date: {
      gte: startDate,
      lt: endDate
    },
    deleted_at: null
  }
  // Uses index: @@index([doctor_id, visit_date])
});

// ❌ Yomon - Barcha maydonlar
const visits = await this.prisma.visit.findMany({
  where: { 
    doctor_id: doctorId,
    visit_date: { gte: startDate, lt: endDate }
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
| Data Freshness | 10 minutes | Cache TTL |

### 8.3 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
// Visit
@@index([doctor_id])              // Shifokor filter uchun (eng muhim)
@@index([visit_date])             // Sana filter uchun
@@index([doctor_id, visit_date])  // Shifokor va sana uchun (qo'shma)
@@index([status, visit_date])     // Status va sana uchun
@@index([visit_date, deleted_at]) // Sana va soft delete uchun

// VisitService
@@index([visit_id])               // Visit filter uchun
@@index([service_id])             // Service filter uchun
@@index([visit_id, service_id])   // Visit va service uchun

// ServiceUser
@@index([service_id])             // Service filter uchun
@@index([user_id])                // User filter uchun
@@index([service_id, user_id])    // Service va user uchun (unique)
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
// doctor-performance.service.spec.ts
describe('DoctorPerformanceService', () => {
  let service: DoctorPerformanceService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorPerformanceService, PrismaService, CacheService],
    }).compile();

    service = module.get<DoctorPerformanceService>(DoctorPerformanceService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getDoctorPerformance', () => {
    it('should return doctor performance from cache', async () => {
      const doctorId = 2;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const cachedPerformance = { basicMetrics: { totalVisits: 150 } };
      
      cacheService.get = jest.fn().mockResolvedValue(cachedPerformance);
      
      const result = await service.getDoctorPerformance(doctorId, startDate, endDate, 2, 'Doctor');
      
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate doctor performance if cache miss', async () => {
      const doctorId = 2;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      cacheService.get = jest.fn().mockResolvedValue(null);
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, role: { name: 'Doctor' }, deleted_at: null });
      prisma.visit.findMany = jest.fn().mockResolvedValue([]);
      cacheService.set = jest.fn().mockResolvedValue(null);
      
      const result = await service.getDoctorPerformance(doctorId, startDate, endDate, 2, 'Doctor');
      
      expect(result.cached).toBe(false);
      expect(prisma.visit.findMany).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('doctor_performance'),
        expect.any(Object),
        { ttl: 600 }
      );
    });

    it('should throw ForbiddenException for other doctor', async () => {
      const doctorId = 2;
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      await expect(
        service.getDoctorPerformance(doctorId, startDate, endDate, 3, 'Doctor')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getDoctorRanking', () => {
    it('should return doctor ranking', async () => {
      prisma.user.findMany = jest.fn().mockResolvedValue([
        { id: 2, full_name: 'Dr. Smith' },
        { id: 3, full_name: 'Dr. Doe' }
      ]);
      
      service.getDoctorPerformance = jest.fn()
        .mockResolvedValueOnce({ basicMetrics: { totalVisits: 150 }, financialMetrics: { totalRevenue: 45000000, commission: 13500000 }, visitStatusMetrics: { completionRate: 90 }, timeMetrics: { efficiency: 80 } })
        .mockResolvedValueOnce({ basicMetrics: { totalVisits: 140 }, financialMetrics: { totalRevenue: 42000000, commission: 12600000 }, visitStatusMetrics: { completionRate: 88.5 }, timeMetrics: { efficiency: 75 } });
      
      const result = await service.getDoctorRanking(new Date('2024-01-01'), new Date('2024-01-31'), 10, 1, 'Admin');
      
      expect(result.rankings.length).toBe(2);
      expect(result.rankings[0].rank).toBe(1);
    });
  });

  describe('exportDoctorPerformance', () => {
    it('should generate Excel export', async () => {
      const dto: ExportDoctorPerformanceDto = {
        doctorId: 2,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        format: 'excel'
      };
      
      service.getDoctorPerformance = jest.fn().mockResolvedValue({});
      
      const result = await service.exportDoctorPerformance(dto, 1);
      
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

Doctor Performance Report alohida jadval emas, shuning uchun migration kerak emas.

```bash
# Hech qanday migration kerak emas
# Report mavjud ma'lumotlardan real-time hosil qilinadi
```

### 10.2 Redis Configuration

```bash
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
DOCTOR_PERFORMANCE_CACHE_TTL=600  # 10 daqiqa
DOCTOR_RANKING_CACHE_TTL=1800  # 30 daqiqa
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
| Flow Document | `21-doctor-performance-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| User RFC | `RFC-002-user-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| ServiceUser RFC | `RFC-018-service-user-management.md` | ✅ Tasdiqlandi |
| Daily Report RFC | `RFC-019-daily-report-management.md` | ✅ Tasdiqlandi |
| Monthly Report RFC | `RFC-020-monthly-report-management.md` | ✅ Tasdiqlandi |
| Client Report RFC | `RFC-022-client-report-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Shifokor asosiy ko'rsatkichlari to'g'ri hisoblanishi
- [ ] Moliyaviy ko'rsatkichlar to'g'ri hisoblanishi
- [ ] Xizmat metrikalari to'g'ri hisoblanishi
- [ ] Vaqt metrikalari to'g'ri hisoblanishi
- [ ] Visit status metrikalari to'g'ri hisoblanishi
- [ ] Shifokorlar reytingi to'g'ri hisoblanishi
- [ ] Trend tahlili to'g'ri ishlashi
- [ ] Cache strategiyasi ishlashi (10 daqiqa TTL)
- [ ] Export funksiyasi ishlashi (Excel/PDF)
- [ ] RBAC to'g'ri ishlashi (Doctor faqat o'zi) (Reference: `Klinika.md` 6.1)
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
| Commission calculation error | O'rta | Yuqori | Double-check + audit trail |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Automated performance reports | 🟡 Medium | Phase 4 |
| Real-time dashboard (WebSocket) | 🟡 Medium | Phase 4 |
| Doctor bonus calculation | 🟡 Medium | Phase 4 |
| Performance alerts | 🟢 Low | Phase 4 |
| Multi-clinic comparison | 🟢 Low | Phase 4 |
| AI-powered insights | 🟢 Low | Phase 5 |
| Mobile app reports | 🟢 Low | Phase 4 |
| Patient satisfaction integration | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |
| **Business Owner** | Clinic Director | __________ | _________ |

---

**RFC Versiyasi:** 1.0
**Status:** Draft
**Oxirgi Yangilanish:** 2024-01-15
**Reference Documents:** `klinika_prisma.txt`, `Klinika.md` (Sections 5.2, 6.1, 7.1, 7.2, 8.1, 9.1)

---