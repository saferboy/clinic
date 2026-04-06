# 📋 RFC-019: Kunlik Hisobot Boshqaruvi (Daily Report Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-019 |
| **Nomi** | Daily Report Management |
| **Phase** | 3 - Reports & Analytics |
| **Model** | `Report` (Virtual - mavjud ma'lumotlardan hosil qilinadi) |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Analytics) |
| **Bog'liq RFC** | RFC-009 (Client), RFC-011 (Service), RFC-013 (Visit), RFC-014 (Payment) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 5.2, 6.1, 7.1, 7.2, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad

Ushbu RFC klinikani kunlik operatsiyalarini kuzatish va tahlil qilish uchun kunlik hisobotlarni shakllantirish uchun to'liq texnik specifikatsiyani taqdim etadi. Kunlik visitlar soni, kirim summasi, shifokorlar yuklamasi, xona bandligi va yangi mijozlar statistikasini taqdim etish. Boshqaruv qarorlarini qabul qilish uchun tezkor ma'lumotlar bazasini yaratish (Reference: `Klinika.md` 7.1, 7.2).

### 1.2 Qamrov

| Doxil | Doxil Emas |
|-------|------------|
| ✅ Kunlik hisobot yaratish (Real-time) | ❌ Alohida jadvalda saqlash |
| ✅ Kunlik hisobotni olish (Read) | ❌ Frontend implementatsiya |
| ✅ Hisobot export (Excel/PDF) | ❌ Avtomatik email yuborish |
| ✅ Shifokor kunlik hisoboti | ❌ Oylik hisobot (bu alohida RFC) |
| ✅ Trend solishtirma (kunlar kesimida) | ❌ Real-time dashboard |
| ✅ Cache strategiyasi | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 7.1, 7.2)

- Kunlik operatsion ko'rsatkichlarni real-time kuzatish
- Boshqaruv qarorlarini ma'lumotlar asosida qabul qilish
- Shifokorlar yuklamasini optimallashtirish
- Xona bandligini nazorat qilish
- Kunlik kirim/chiqim tahlili
- Mijoz oqimini monitoring qilish
- Performance metrikalarini kuzatish

---

## 2. MA'LUMOTLAR MODELI

### 2.1 Virtual Report Model

Daily Report alohida jadvalda saqlanmaydi. U quyidagi jadvallardan real-time hosil qilinadi:

```
┌─────────────────────────────────────────────────────────────┐
│              DAILY REPORT DATA SOURCES                      │
├─────────────────────────────────────────────────────────────┤
│  Visit          → Visit soni, shifokor yuklamasi            │
│  VisitService   → Xizmatlar statistikasi                    │
│  Payment        → Kirim mablag'lari                         │
│  ClientPaid     → Oldindan to'lovlar                        │
│  OtherPaid      → Boshqa kirim/chiqimlar                    │
│  Client         → Mijozlar statistikasi                     │
│  ServiceUser    → Shifokor stavkalari                       │
│  Room           → Xona bandligi                             │
│  VisitRoom      → Xona ishlatilishi                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Report Tuzilishi

```typescript
interface DailyReport {
  date: Date;                    // Hisobot sanasi
  visitStats: VisitStats;        // Visit statistikasi
  financialStats: FinancialStats; // Moliyaviy statistika
  doctorLoadStats: DoctorLoad[];  // Shifokor yuklamasi
  roomOccupancyStats: RoomStats;  // Xona bandligi
  newClientStats: ClientStats;    // Yangi mijozlar
}

interface VisitStats {
  totalVisits: number;
  completedVisits: number;
  scheduledVisits: number;
  cancelledVisits: number;
  noShowVisits: number;
  inProgressVisits: number;
}

interface FinancialStats {
  totalIncome: number;
  totalPayment: number;
  totalPrepaid: number;
  averageCheck: number;
  totalDebt: number;
}

interface DoctorLoad {
  doctorId: number;
  doctorName: string;
  visitCount: number;
  totalAmount: number;
  commission: number;
}

interface RoomStats {
  totalRooms: number;
  usedRooms: number;
  occupancyRate: number;
  roomUsage: RoomUsage[];
}

interface ClientStats {
  totalNewClients: number;
  bySource: SourceStats[];
  byGender: GenderStats[];
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
Visit, Payment,    Aggregate,       Cache Store
Client, Room       Calculate        (5 min TTL)
                   Metrics
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | GET | `/api/v1/reports/daily` | ✅ JWT | Admin, Accountant, Receptionist | Kunlik hisobotni olish |
| 2 | POST | `/api/v1/reports/daily/export` | ✅ JWT | Admin, Accountant | Kunlik hisobot export (Excel/PDF) |
| 3 | GET | `/api/v1/reports/daily/doctor/:doctorId` | ✅ JWT | Admin, Doctor (faqat o'zi), Accountant | Shifokor kunlik hisoboti |
| 4 | GET | `/api/v1/reports/daily/trend` | ✅ JWT | Admin, Accountant | Kunlik hisobot trendi (solishtirma) |

---

### 3.2 GET /api/v1/reports/daily

**Tavsif:** Kunlik hisobotni olish (Admin, Accountant, Receptionist)

**Request Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `date` | date | ❌ | Bugun | Hisobot sanasi (YYYY-MM-DD) |

**Request Example:**

```http
GET /api/v1/reports/daily?date=2024-01-15
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "visitStats": {
      "totalVisits": 45,
      "completedVisits": 38,
      "scheduledVisits": 5,
      "cancelledVisits": 2,
      "noShowVisits": 0,
      "inProgressVisits": 0
    },
    "financialStats": {
      "totalIncome": 15000000,
      "totalPayment": 12000000,
      "totalPrepaid": 3000000,
      "averageCheck": 333333,
      "totalDebt": 2500000
    },
    "doctorLoadStats": [
      {
        "doctorId": 2,
        "doctorName": "Dr. John Smith",
        "visitCount": 15,
        "totalAmount": 5000000,
        "commission": 1500000
      },
      {
        "doctorId": 3,
        "doctorName": "Dr. Jane Doe",
        "visitCount": 12,
        "totalAmount": 4000000,
        "commission": 1200000
      }
    ],
    "roomOccupancyStats": {
      "totalRooms": 10,
      "usedRooms": 8,
      "occupancyRate": 80,
      "roomUsage": [
        {
          "roomId": 1,
          "roomName": "Terapiya Kabineti 1",
          "usageCount": 5,
          "totalMinutes": 150
        }
      ]
    },
    "newClientStats": {
      "totalNewClients": 8,
      "bySource": [
        {
          "sourceId": 1,
          "sourceName": "Instagram",
          "count": 3
        },
        {
          "sourceId": 2,
          "sourceName": "Telegram",
          "count": 2
        }
      ],
      "byGender": [
        { "gender": "MALE", "count": 5 },
        { "gender": "FEMALE", "count": 3 }
      ]
    }
  },
  "generatedAt": "2024-01-15T14:30:00.000Z",
  "cached": true
}
```

**Service Layer Implementation:**

```typescript
// daily-report.service.ts
async getDailyReport(date: Date): Promise<DailyReport> {
  const cacheKey = `daily_report:${date.toISOString().split('T')[0]}`;
  
  // 1. Cache dan olish (Reference: Klinika.md 9.1)
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }
  
  // 2. Barcha metrikalarni parallel hisoblash
  const [
    visitStats,
    financialStats,
    doctorLoadStats,
    roomOccupancyStats,
    newClientStats
  ] = await Promise.all([
    this.getVisitStats(date),
    this.getFinancialStats(date),
    this.getDoctorLoadStats(date),
    this.getRoomOccupancyStats(date),
    this.getNewClientStats(date)
  ]);
  
  const report: DailyReport = {
    date,
    visitStats,
    financialStats,
    doctorLoadStats,
    roomOccupancyStats,
    newClientStats
  };
  
  // 3. Cache ga saqlash (5 daqiqa TTL) (Reference: Klinika.md 9.1)
  await this.cacheService.set(cacheKey, report, { ttl: 300 });
  
  return { ...report, cached: false };
}

// Visit statistikasi
private async getVisitStats(date: Date): Promise<VisitStats> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const totalVisits = await this.prisma.visit.count({
    where: {
      visit_date: {
        gte: startOfDay,
        lt: endOfDay
      },
      deleted_at: null
    }
  });

  const visitsByStatus = await this.prisma.visit.groupBy({
    by: ['status'],
    _count: { id: true },
    where: {
      visit_date: {
        gte: startOfDay,
        lt: endOfDay
      },
      deleted_at: null
    }
  });

  const stats: VisitStats = {
    totalVisits,
    completedVisits: 0,
    scheduledVisits: 0,
    cancelledVisits: 0,
    noShowVisits: 0,
    inProgressVisits: 0
  };

  visitsByStatus.forEach(item => {
    switch (item.status) {
      case 'COMPLETED':
      case 'DONE':
        stats.completedVisits = item._count.id;
        break;
      case 'SCHEDULED':
        stats.scheduledVisits = item._count.id;
        break;
      case 'CANCELLED':
        stats.cancelledVisits = item._count.id;
        break;
      case 'NO_SHOW':
        stats.noShowVisits = item._count.id;
        break;
      case 'IN_PROGRESS':
        stats.inProgressVisits = item._count.id;
        break;
    }
  });

  return stats;
}

// Moliyaviy statistika
private async getFinancialStats(date: Date): Promise<FinancialStats> {
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const paymentStats = await this.prisma.payment.aggregate({
    where: {
      payment_date: {
        gte: startOfDay,
        lt: endOfDay
      },
      payment_type: 'INCOME',
      deleted_at: null
    },
    _sum: { amount: true },
    _count: { id: true }
  });

  const prepaidStats = await this.prisma.clientPaid.aggregate({
    where: {
      payment_date: {
        gte: startOfDay,
        lt: endOfDay
      },
      deleted_at: null
    },
    _sum: { amount: true }
  });

  const visitStats = await this.prisma.visit.aggregate({
    where: {
      visit_date: {
        gte: startOfDay,
        lt: endOfDay
      },
      deleted_at: null
    },
    _sum: { 
      total_amount: true,
      paid_amount: true,
      debt_amount: true
    },
    _count: { id: true }
  });

  const totalIncome = (paymentStats._sum.amount || 0) + (prepaidStats._sum.amount || 0);
  const totalPayment = paymentStats._sum.amount || 0;
  const totalPrepaid = prepaidStats._sum.amount || 0;
  const averageCheck = visitStats._count.id > 0 
    ? (visitStats._sum.total_amount || 0) / visitStats._count.id 
    : 0;
  const totalDebt = visitStats._sum.debt_amount || 0;

  return {
    totalIncome,
    totalPayment,
    totalPrepaid,
    averageCheck,
    totalDebt
  };
}
```

---

### 3.3 POST /api/v1/reports/daily/export

**Tavsif:** Kunlik hisobotni export qilish (Excel/PDF) (Admin, Accountant)

**Request Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```typescript
interface ExportDailyReportDto {
  date: Date;         // Hisobot sanasi
  format: 'excel' | 'pdf';  // Export formati
}
```

**Request Body Example:**

```json
{
  "date": "2024-01-15",
  "format": "excel"
}
```

**Response:** File Download

- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`

**Service Layer Implementation:**

```typescript
async exportDailyReport(exportDto: ExportDailyReportDto, userId: number): Promise<Buffer> {
  // 1. Hisobot ma'lumotlarini olish
  const report = await this.getDailyReport(exportDto.date);
  
  // 2. Formatga qarab export qilish
  if (exportDto.format === 'excel') {
    return this.generateExcel(report);
  } else if (exportDto.format === 'pdf') {
    return this.generatePDF(report);
  }
  
  throw new BadRequestException('RPT_006');
}

// Excel generatsiya
private async generateExcel(report: DailyReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Visit sheet
  const visitSheet = workbook.addWorksheet('Visitlar');
  visitSheet.columns = [
    { header: 'Ko\'rsatkich', key: 'metric' },
    { header: 'Qiymat', key: 'value' }
  ];
  visitSheet.addRows([
    { metric: 'Jami Visitlar', value: report.visitStats.totalVisits },
    { metric: 'Yakunlangan', value: report.visitStats.completedVisits },
    { metric: 'Rejalashtirilgan', value: report.visitStats.scheduledVisits },
    { metric: 'Bekor qilingan', value: report.visitStats.cancelledVisits }
  ]);
  
  // Moliyaviy sheet
  const financeSheet = workbook.addWorksheet('Moliya');
  financeSheet.columns = [
    { header: 'Ko\'rsatkich', key: 'metric' },
    { header: 'Summa (so\'m)', key: 'value' }
  ];
  financeSheet.addRows([
    { metric: 'Umumiy Kirim', value: report.financialStats.totalIncome },
    { metric: 'To\'lovlar', value: report.financialStats.totalPayment },
    { metric: 'Oldindan to\'lov', value: report.financialStats.totalPrepaid },
    { metric: 'O\'rtacha Check', value: report.financialStats.averageCheck },
    { metric: 'Qarz', value: report.financialStats.totalDebt }
  ]);
  
  // Buffer ga convert
  return await workbook.xlsx.writeBuffer();
}
```

---

### 3.4 GET /api/v1/reports/daily/doctor/:doctorId

**Tavsif:** Shifokor kunlik hisoboti (Admin, Doctor - faqat o'zi, Accountant)

**Query Params:**

```
GET /api/v1/reports/daily/doctor/2?date=2024-01-15
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "doctor": { "id": 2, "full_name": "Dr. John Smith" },
    "date": "2024-01-15",
    "visitCount": 15,
    "totalAmount": 5000000,
    "commission": 1500000,
    "visits": [
      {
        "visitId": 1,
        "clientName": "John Doe",
        "status": "COMPLETED",
        "totalAmount": 300000,
        "commission": 90000
      },
      {
        "visitId": 2,
        "clientName": "Jane Smith",
        "status": "COMPLETED",
        "totalAmount": 250000,
        "commission": 75000
      }
    ]
  }
}
```

**Service Layer Implementation:**

```typescript
async getDoctorDailyReport(
  doctorId: number, 
  date: Date, 
  currentUserId: number,
  currentUserRole: string
): Promise<DoctorDailyReport> {
  // 1. RBAC tekshiruvi (Reference: Klinika.md 6.1)
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant' && currentUserId !== doctorId) {
    throw new ForbiddenException('RPT_003');
  }
  
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));
  
  // 2. Doctor visitlarini olish
  const visits = await this.prisma.visit.findMany({
    where: {
      doctor_id: doctorId,
      visit_date: {
        gte: startOfDay,
        lt: endOfDay
      },
      deleted_at: null
    },
    include: {
      client: { select: { id: true, full_name: true } },
      visit_services: {
        include: {
          service: true
        }
      }
    }
  });
  
  // 3. Har bir visit uchun komissiya hisoblash
  const visitDetails = await Promise.all(
    visits.map(async (visit) => {
      let commission = 0;
      
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
      
      return {
        visitId: visit.id,
        clientName: visit.client.full_name,
        status: visit.status,
        totalAmount: visit.total_amount.toNumber(),
        commission
      };
    })
  );
  
  const totalAmount = visitDetails.reduce((sum, v) => sum + v.totalAmount, 0);
  const totalCommission = visitDetails.reduce((sum, v) => sum + v.commission, 0);
  
  // 4. Doctor ma'lumotlarini olish
  const doctor = await this.prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, full_name: true }
  });
  
  return {
    doctorId,
    doctor,
    date,
    visitCount: visits.length,
    totalAmount,
    commission: totalCommission,
    visits: visitDetails
  };
}
```

---

### 3.5 GET /api/v1/reports/daily/trend

**Tavsif:** Kunlik hisobot trendi (solishtirma) (Admin, Accountant)

**Query Params:**

```
GET /api/v1/reports/daily/trend?date=2024-01-15&compare_days=7
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currentDate": "2024-01-15",
    "previousDate": "2024-01-08",
    "visitChange": {
      "current": 45,
      "previous": 40,
      "change": 5,
      "changePercent": 12.5
    },
    "incomeChange": {
      "current": 15000000,
      "previous": 13000000,
      "change": 2000000,
      "changePercent": 15.4
    },
    "averageCheckChange": {
      "current": 333333,
      "previous": 325000,
      "change": 8333,
      "changePercent": 2.56
    }
  }
}
```

**Service Layer Implementation:**

```typescript
async getDailyTrend(date: Date, compareDays: number = 7): Promise<DailyTrend> {
  const currentDate = new Date(date);
  const previousDate = new Date(date);
  previousDate.setDate(previousDate.getDate() - compareDays);
  
  // Joriy kun hisoboti
  const currentReport = await this.getDailyReport(currentDate);
  
  // Oldingi kun hisoboti
  const previousReport = await this.getDailyReport(previousDate);
  
  // O'zgarishlarni hisoblash
  const visitChange = this.calculateChange(
    currentReport.visitStats.totalVisits,
    previousReport.visitStats.totalVisits
  );
  
  const incomeChange = this.calculateChange(
    currentReport.financialStats.totalIncome,
    previousReport.financialStats.totalIncome
  );
  
  const averageCheckChange = this.calculateChange(
    currentReport.financialStats.averageCheck,
    previousReport.financialStats.averageCheck
  );
  
  return {
    currentDate,
    previousDate,
    visitChange,
    incomeChange,
    averageCheckChange
  };
}

private calculateChange(current: number, previous: number): ChangeMetric {
  const change = current - previous;
  const changePercent = previous > 0 ? (change / previous) * 100 : 0;
  
  return {
    current,
    previous,
    change,
    changePercent: Math.round(changePercent * 100) / 100
  };
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// get-daily-report.dto.ts
import {
  IsOptional,
  IsDateString,
  MaxLength
} from 'class-validator';

export class GetDailyReportDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}

// export-daily-report.dto.ts
import {
  IsDateString,
  IsEnum,
  IsNotEmpty
} from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export class ExportDailyReportDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;
}

// get-doctor-report.dto.ts
import {
  IsInt,
  Min,
  IsOptional,
  IsDateString
} from 'class-validator';

export class GetDoctorReportDto {
  @IsInt()
  @Min(1)
  doctor_id: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}

// get-daily-trend.dto.ts
import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max
} from 'class-validator';

export class GetDailyTrendDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  compare_days?: number;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `date` | IsDateString | RPT_001 | Sana formati noto'g'ri |
| `date` | Max today | RPT_002 | Kelajak sana bo'lmasligi kerak |
| `format` | Enum | RPT_006 | excel/pdf |
| `doctor_id` | IsInt | RPT_004 | Doctor ID raqam bo'lishi kerak |
| `doctor_id` | Min 1 | RPT_004 | Doctor ID musbat bo'lishi kerak |
| `compare_days` | IsInt | RPT_007 | Kunlar soni raqam bo'lishi kerak |
| `compare_days` | Min 1, Max 30 | RPT_007 | 1-30 kun oralig'ida |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `RPT_001` | 400 Bad Request | Sana formati noto'g'ri | Invalid date format | YYYY-MM-DD format kiriting |
| `RPT_002` | 400 Bad Request | Kelajak sana bo'lmasligi kerak | Future date not allowed | O'tgan kun tanlang |
| `RPT_003` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `RPT_004` | 404 Not Found | Shifokor topilmadi | Doctor ID not exists | Doctor ID ni tekshiring |
| `RPT_005` | 404 Not Found | Hisobot ma'lumotlari topilmadi | No data for date | Boshqa sana tanlang |
| `RPT_006` | 400 Bad Request | Export formati noto'g'ri | Invalid format | excel/pdf tanlang |
| `RPT_007` | 400 Bad Request | Trend kunlari noto'g'ri | Invalid compare_days | 1-30 kun oralig'ida |
| `RPT_008` | 500 Internal Server Error | Hisobot yaratishda xatolik | Calculation error | Admin bilan bog'laning |

### 5.2 Exception Filter

```typescript
// report-exception.filter.ts
@Catch()
export class ReportExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof BadRequestException) return 'RPT_001';
    if (exception instanceof ForbiddenException) return 'RPT_003';
    if (exception instanceof NotFoundException) return 'RPT_005';
    return 'RPT_008';
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
| GET /reports/daily | ✅ | ❌ | ❌ | ✅ | ✅ |
| POST /reports/daily/export | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /reports/daily/doctor/:id | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| GET /reports/daily/trend | ✅ | ❌ | ❌ | ❌ | ✅ |

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
| Daily Report | Redis | 5 daqiqa | Visit create/update/delete |
| Doctor Stats | Redis | 10 daqiqa | Visit complete |
| Financial Stats | Redis | 5 daqiqa | Payment create/update |
| Room Occupancy | Redis | 5 daqiqa | VisitRoom create/update |
| Export File | Redis | 24 soat | Automatic expiry |

### 7.2 Cache Implementation

```typescript
// Cache service
async getDailyReport(date: Date): Promise<DailyReport> {
  const cacheKey = `daily_report:${date.toISOString().split('T')[0]}`;
  
  // 1. Cache dan olish
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }
  
  this.logger.debug(`Cache miss for ${cacheKey}`);
  
  // 2. DB dan hisoblash
  const report = await this.calculateDailyReport(date);
  
  // 3. Cache ga saqlash (5 daqiqa)
  await this.cacheService.set(cacheKey, report, { ttl: 300 });
  
  return report;
}

// Cache invalidation
async invalidateDailyReportCache(date: Date): Promise<void> {
  const cacheKey = `daily_report:${date.toISOString().split('T')[0]}`;
  await this.cacheService.del(cacheKey);
  
  this.logger.log(`Cache invalidated for ${cacheKey}`);
}

// Event-based invalidation
@Events('visit.created')
async onVisitCreated(event: VisitCreatedEvent) {
  await this.invalidateDailyReportCache(event.visitDate);
}

@Events('visit.updated')
async onVisitUpdated(event: VisitUpdatedEvent) {
  await this.invalidateDailyReportCache(event.visitDate);
}

@Events('payment.created')
async onPaymentCreated(event: PaymentCreatedEvent) {
  await this.invalidateDailyReportCache(event.paymentDate);
}
```

---

## 8. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 8.1 Database Query Optimization

```typescript
// ✅ Yaxshi - Parallel queries
const [visitStats, financialStats, doctorStats] = await Promise.all([
  this.getVisitStats(date),
  this.getFinancialStats(date),
  this.getDoctorStats(date)
]);

// ✅ Yaxshi - Faqat kerakli maydonlar
const visits = await this.prisma.visit.findMany({
  select: { 
    id: true, 
    status: true, 
    total_amount: true,
    doctor_id: true
  },
  where: { 
    visit_date: { gte: startOfDay, lt: endOfDay },
    deleted_at: null
  }
});

// ❌ Yomon - Barcha maydonlar
const visits = await this.prisma.visit.findMany({
  where: { 
    visit_date: { gte: startOfDay, lt: endOfDay }
  }
});

// ✅ Yaxshi - Indexlardan foydalanish
const visits = await this.prisma.visit.findMany({
  where: { 
    doctor_id: 2,
    visit_date: {
      gte: startOfDay,
      lt: endOfDay
    },
    deleted_at: null
  }
  // Uses index: @@index([doctor_id, visit_date])
});
```

### 8.2 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat | Measurement |
|-------------|--------|-------------|
| Report Generation Time | < 5 seconds | P95 |
| Cache Hit Rate | > 80% | Daily average |
| Export Generation Time | < 10 seconds | P95 |
| API Response Time | < 200ms (cached) | P95 |
| Concurrent Users | 50+ | Peak load |
| Data Freshness | 5 minutes | Cache TTL |

### 8.3 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
// Visit
@@index([visit_date])              // Sana filter uchun (eng muhim)
@@index([doctor_id, visit_date])   // Shifokor va sana uchun
@@index([status, visit_date])      // Status va sana uchun
@@index([visit_date, deleted_at])  // Sana va soft delete uchun

// Payment
@@index([payment_date])             // Sana filter uchun
@@index([payment_type, payment_date]) // Type va sana uchun

// Client
@@index([created_at])               // Yangi mijozlar uchun
@@index([source_id, created_at])    // Manba va sana uchun

// VisitRoom
@@index([room_id, created_at])      // Xona va sana uchun
@@index([visit_id, status])         // Visit va status uchun
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
// daily-report.service.spec.ts
describe('DailyReportService', () => {
  let service: DailyReportService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyReportService, PrismaService, CacheService],
    }).compile();

    service = module.get<DailyReportService>(DailyReportService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getDailyReport', () => {
    it('should return daily report from cache', async () => {
      const date = new Date('2024-01-15');
      const cachedReport = { visitStats: { totalVisits: 45 } };
      
      cacheService.get = jest.fn().mockResolvedValue(cachedReport);
      
      const result = await service.getDailyReport(date);
      
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate daily report if cache miss', async () => {
      const date = new Date('2024-01-15');
      
      cacheService.get = jest.fn().mockResolvedValue(null);
      prisma.visit.count = jest.fn().mockResolvedValue(45);
      cacheService.set = jest.fn().mockResolvedValue(null);
      
      const result = await service.getDailyReport(date);
      
      expect(result.cached).toBe(false);
      expect(prisma.visit.count).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('daily_report'),
        expect.any(Object),
        { ttl: 300 }
      );
    });
  });

  describe('getDoctorDailyReport', () => {
    it('should return doctor report for self', async () => {
      const doctorId = 2;
      const date = new Date('2024-01-15');
      
      prisma.visit.findMany = jest.fn().mockResolvedValue([]);
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 2, full_name: 'Dr. Smith' });
      
      const result = await service.getDoctorDailyReport(doctorId, date, 2, 'Doctor');
      
      expect(result.doctorId).toBe(2);
      expect(result.visitCount).toBe(0);
    });

    it('should throw ForbiddenException for other doctor', async () => {
      const doctorId = 2;
      const date = new Date('2024-01-15');
      
      await expect(
        service.getDoctorDailyReport(doctorId, date, 3, 'Doctor')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('exportDailyReport', () => {
    it('should generate Excel export', async () => {
      const dto: ExportDailyReportDto = {
        date: new Date('2024-01-15'),
        format: 'excel'
      };
      
      service.getDailyReport = jest.fn().mockResolvedValue({});
      
      const result = await service.exportDailyReport(dto, 1);
      
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

Daily Report alohida jadval emas, shuning uchun migration kerak emas.

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
REPORT_CACHE_TTL=300  # 5 daqiqa
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

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `19-daily-report-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| ServiceUser RFC | `RFC-018-service-user-management.md` | ✅ Tasdiqlandi |
| Monthly Report RFC | `RFC-020-monthly-report-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Kunlik visit statistikasi to'g'ri hisoblanishi
- [ ] Kunlik moliyaviy statistika to'g'ri hisoblanishi
- [ ] Shifokor yuklamasi to'g'ri hisoblanishi
- [ ] Xona bandligi to'g'ri hisoblanishi
- [ ] Yangi mijozlar statistikasi to'g'ri hisoblanishi
- [ ] Cache strategiyasi ishlashi (5 daqiqa TTL)
- [ ] Export funksiyasi ishlashi (Excel/PDF)
- [ ] RBAC to'g'ri ishlashi (Doctor faqat o'zi) (Reference: `Klinika.md` 6.1)
- [ ] Sana validatsiyasi ishlashi (kelajak sana taqiqlangan)
- [ ] Trend solishtirma ishlashi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytarilishi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 5 seconds (hisobot yaratish)
- [ ] API response time < 200ms (cached)
- [ ] Cache hit rate > 80%
- [ ] Export generation time < 10 seconds
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

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Automated email reports | 🟡 Medium | Phase 4 |
| Real-time dashboard (WebSocket) | 🟡 Medium | Phase 4 |
| Custom report builder | 🟢 Low | Phase 4 |
| Report scheduling | 🟢 Low | Phase 4 |
| Multi-clinic comparison | 🟢 Low | Phase 4 |
| AI-powered insights | 🟢 Low | Phase 5 |
| Mobile app reports | 🟢 Low | Phase 4 |

---

## 15. TASDIQLASH

| Rol | Ism | Imzo | Sana |
|-----|-----|------|------|
| **Author** | Senior Backend Developer | __________ | _________ |
| **Reviewer** | Tech Lead | __________ | _________ |
| **Approver** | Project Manager | __________ | _________ |
| **Security Audit** | Security Engineer | __________ | _________ |
| **Business Owner** | Clinic Director | __________ | _________ |
