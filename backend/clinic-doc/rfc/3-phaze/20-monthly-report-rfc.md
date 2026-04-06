# 📋 RFC-020: Oylik Hisobot Boshqaruvi (Monthly Report Management)

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-020 |
| **Nomi** | Monthly Report Management |
| **Phase** | 3 - Reports & Analytics |
| **Model** | `Report` (Virtual - mavjud ma'lumotlardan hosil qilinadi) |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Analytics) |
| **Bog'liq RFC** | RFC-013 (Visit), RFC-014 (Payment), RFC-019 (Daily Report) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 5.2, 6.1, 7.1, 7.2, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad

Ushbu RFC klinikani oylik operatsiyalarini kuzatish va tahlil qilish uchun oylik hisobotlarni shakllantirish uchun to'liq texnik specifikatsiyani taqdim etadi. Oylik visitlar soni, kirim summasi, shifokorlar yuklamasi, xona bandligi va yangi mijozlar statistikasini taqdim etish. Strategik boshqaruv qarorlarini qabul qilish uchun oylik ma'lumotlar bazasini yaratish (Reference: `Klinika.md` 7.1, 7.2).

### 1.2 Qamrov

| Doxil | Doxil Emas |
|-------|------------|
| ✅ Oylik hisobot yaratish (Real-time) | ❌ Alohida jadvalda saqlash |
| ✅ Oylik hisobotni olish (Read) | ❌ Frontend implementatsiya |
| ✅ Hisobot export (Excel/PDF) | ❌ Avtomatik email yuborish |
| ✅ Oylik trend tahlili | ❌ Real-time dashboard |
| ✅ Solishtirma hisobot (oylar kesimida) | ❌ Avtomatik generatsiya |
| ✅ Cache strategiyasi | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 7.1, 7.2)

- Oylik operatsion ko'rsatkichlarni kuzatish
- Strategik qarorlarni ma'lumotlar asosida qabul qilish
- Oylik moliyaviy natijalarni tahlil qilish
- Shifokorlar oylik yuklamasini optimallashtirish
- Oylik kirim/chiqim tahlili
- Mijoz oqimini oylik monitoring qilish
- Performance metrikalarini oylik kuzatish
- Budget planning uchun asos yaratish

---

## 2. MA'LUMOTLAR MODELI

### 2.1 Virtual Report Model

Monthly Report alohida jadvalda saqlanmaydi. U quyidagi jadvallardan real-time hosil qilinadi:

```
┌─────────────────────────────────────────────────────────────┐
│              MONTHLY REPORT DATA SOURCES                    │
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
interface MonthlyReport {
  month: number;                   // Oy (1-12)
  year: number;                    // Yil
  visitStats: VisitStats;          // Visit statistikasi
  financialStats: FinancialStats;  // Moliyaviy statistika
  doctorLoadStats: DoctorLoad[];   // Shifokor yuklamasi
  roomOccupancyStats: RoomStats;   // Xona bandligi
  newClientStats: ClientStats;     // Yangi mijozlar
  serviceStats: ServiceStats[];    // Xizmatlar statistikasi
  debtStats: DebtStats;            // Qarzdorlik statistikasi
  comparison?: MonthlyComparison;  // Oldingi oy bilan solishtirma
}

interface VisitStats {
  totalVisits: number;
  completedVisits: number;
  scheduledVisits: number;
  cancelledVisits: number;
  noShowVisits: number;
  averageVisitsPerDay: number;
}

interface FinancialStats {
  totalIncome: number;
  totalPayment: number;
  totalPrepaid: number;
  totalOutcome: number;
  averageCheck: number;
  totalDebt: number;
  profit: number;
}

interface DoctorLoad {
  doctorId: number;
  doctorName: string;
  visitCount: number;
  totalAmount: number;
  commission: number;
  averagePerVisit: number;
}

interface RoomStats {
  totalRooms: number;
  totalUsage: number;
  averageOccupancyRate: number;
  roomUsage: RoomUsage[];
}

interface ClientStats {
  totalNewClients: number;
  totalActiveClients: number;
  retentionRate: number;
  bySource: SourceStats[];
  byGender: GenderStats[];
}

interface ServiceStats {
  serviceId: number;
  serviceName: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

interface DebtStats {
  totalDebt: number;
  overdueDebt: number;
  debtRate: number;
  topDebtors: DebtorStats[];
}

interface MonthlyComparison {
  previousMonth: number;
  previousYear: number;
  visitChange: ChangeMetric;
  incomeChange: ChangeMetric;
  clientChange: ChangeMetric;
}

interface ChangeMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
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
Client, Room       Calculate        (30 min TTL)
                   Metrics
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | GET | `/api/v1/reports/monthly` | ✅ JWT | Admin, Accountant | Oylik hisobotni olish |
| 2 | POST | `/api/v1/reports/monthly/export` | ✅ JWT | Admin, Accountant | Oylik hisobot export (Excel/PDF) |
| 3 | GET | `/api/v1/reports/monthly/doctor/:doctorId` | ✅ JWT | Admin, Doctor (faqat o'zi), Accountant | Shifokor oylik hisoboti |
| 4 | GET | `/api/v1/reports/monthly/trend` | ✅ JWT | Admin, Accountant | Oylik hisobot trendi (solishtirma) |
| 5 | GET | `/api/v1/reports/monthly/services` | ✅ JWT | Admin, Accountant | Xizmatlar oylik statistikasi |
| 6 | GET | `/api/v1/reports/monthly/debt` | ✅ JWT | Admin, Accountant | Qarzdorlik oylik hisoboti |

---

### 3.2 GET /api/v1/reports/monthly

**Tavsif:** Oylik hisobotni olish (Admin, Accountant)

**Request Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `month` | number | ❌ | Joriy oy | Hisobot oyi (1-12) |
| `year` | number | ❌ | Joriy yil | Hisobot yili |
| `compare` | boolean | ❌ | false | Oldingi oy bilan solishtirma |

**Request Example:**

```http
GET /api/v1/reports/monthly?month=1&year=2024&compare=true
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "month": 1,
    "year": 2024,
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "visitStats": {
      "totalVisits": 1350,
      "completedVisits": 1140,
      "scheduledVisits": 150,
      "cancelledVisits": 45,
      "noShowVisits": 15,
      "averageVisitsPerDay": 43.5
    },
    "financialStats": {
      "totalIncome": 450000000,
      "totalPayment": 400000000,
      "totalPrepaid": 90000000,
      "totalOutcome": 180000000,
      "averageCheck": 333333,
      "totalDebt": 75000000,
      "profit": 270000000
    },
    "doctorLoadStats": [
      {
        "doctorId": 2,
        "doctorName": "Dr. John Smith",
        "visitCount": 450,
        "totalAmount": 150000000,
        "commission": 45000000,
        "averagePerVisit": 333333
      },
      {
        "doctorId": 3,
        "doctorName": "Dr. Jane Doe",
        "visitCount": 380,
        "totalAmount": 120000000,
        "commission": 36000000,
        "averagePerVisit": 315789
      }
    ],
    "roomOccupancyStats": {
      "totalRooms": 10,
      "totalUsage": 1200,
      "averageOccupancyRate": 75,
      "roomUsage": [
        {
          "roomId": 1,
          "roomName": "Terapiya Kabineti 1",
          "usageCount": 180,
          "totalMinutes": 5400,
          "occupancyRate": 85
        }
      ]
    },
    "newClientStats": {
      "totalNewClients": 280,
      "totalActiveClients": 1200,
      "retentionRate": 65.5,
      "bySource": [
        {
          "sourceId": 1,
          "sourceName": "Instagram",
          "count": 95,
          "percentage": 33.9
        },
        {
          "sourceId": 2,
          "sourceName": "Telegram",
          "count": 70,
          "percentage": 25.0
        }
      ],
      "byGender": [
        { "gender": "MALE", "count": 150, "percentage": 53.6 },
        { "gender": "FEMALE", "count": 130, "percentage": 46.4 }
      ]
    },
    "serviceStats": [
      {
        "serviceId": 1,
        "serviceName": "Terapevt ko'rigi",
        "count": 450,
        "totalAmount": 135000000,
        "percentage": 30.0
      },
      {
        "serviceId": 2,
        "serviceName": "UZI tekshiruvi",
        "count": 300,
        "totalAmount": 90000000,
        "percentage": 20.0
      }
    ],
    "debtStats": {
      "totalDebt": 75000000,
      "overdueDebt": 25000000,
      "debtRate": 16.7,
      "topDebtors": [
        {
          "clientId": 1,
          "clientName": "John Doe",
          "debtAmount": 5000000,
          "daysOverdue": 30
        }
      ]
    },
    "comparison": {
      "previousMonth": 12,
      "previousYear": 2023,
      "visitChange": {
        "current": 1350,
        "previous": 1200,
        "change": 150,
        "changePercent": 12.5
      },
      "incomeChange": {
        "current": 450000000,
        "previous": 400000000,
        "change": 50000000,
        "changePercent": 12.5
      },
      "clientChange": {
        "current": 280,
        "previous": 250,
        "change": 30,
        "changePercent": 12.0
      }
    }
  },
  "generatedAt": "2024-02-01T10:00:00.000Z",
  "cached": true
}
```

**Service Layer Implementation:**

```typescript
// monthly-report.service.ts
async getMonthlyReport(month: number, year: number, compare: boolean = false): Promise<MonthlyReport> {
  const cacheKey = `monthly_report:${year}-${month.toString().padStart(2, '0')}`;
  
  // 1. Cache dan olish (Reference: Klinika.md 9.1)
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }
  
  // 2. Oy boshi va oxiri sanalarini hisoblash
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  const daysInMonth = endDate.getDate();
  
  // 3. Barcha metrikalarni parallel hisoblash
  const [
    visitStats,
    financialStats,
    doctorLoadStats,
    roomOccupancyStats,
    newClientStats,
    serviceStats,
    debtStats
  ] = await Promise.all([
    this.getMonthlyVisitStats(startDate, endDate, daysInMonth),
    this.getMonthlyFinancialStats(startDate, endDate),
    this.getMonthlyDoctorLoadStats(startDate, endDate),
    this.getMonthlyRoomOccupancyStats(startDate, endDate),
    this.getMonthlyNewClientStats(startDate, endDate),
    this.getMonthlyServiceStats(startDate, endDate),
    this.getMonthlyDebtStats(startDate, endDate)
  ]);
  
  // 4. Solishtirma ma'lumotlar (agar so'ralgan bo'lsa)
  let comparison: MonthlyComparison | undefined;
  if (compare) {
    comparison = await this.getMonthlyComparison(month, year);
  }
  
  const report: MonthlyReport = {
    month,
    year,
    period: {
      from: startDate,
      to: endDate
    },
    visitStats,
    financialStats,
    doctorLoadStats,
    roomOccupancyStats,
    newClientStats,
    serviceStats,
    debtStats,
    comparison
  };
  
  // 5. Cache ga saqlash (30 daqiqa TTL) (Reference: Klinika.md 9.1)
  await this.cacheService.set(cacheKey, report, { ttl: 1800 });
  
  return { ...report, cached: false };
}

// Oylik visit statistikasi
private async getMonthlyVisitStats(
  startDate: Date, 
  endDate: Date, 
  daysInMonth: number
): Promise<VisitStats> {
  const totalVisits = await this.prisma.visit.count({
    where: {
      visit_date: {
        gte: startDate,
        lt: endDate
      },
      deleted_at: null
    }
  });

  const visitsByStatus = await this.prisma.visit.groupBy({
    by: ['status'],
    _count: { id: true },
    where: {
      visit_date: {
        gte: startDate,
        lt: endDate
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
    averageVisitsPerDay: 0
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
    }
  });

  stats.averageVisitsPerDay = daysInMonth > 0 
    ? Math.round((totalVisits / daysInMonth) * 10) / 10 
    : 0;

  return stats;
}

// Oylik moliyaviy statistika
private async getMonthlyFinancialStats(
  startDate: Date, 
  endDate: Date
): Promise<FinancialStats> {
  // Payment yig'indisi (INCOME)
  const paymentStats = await this.prisma.payment.aggregate({
    where: {
      payment_date: {
        gte: startDate,
        lt: endDate
      },
      payment_type: 'INCOME',
      deleted_at: null
    },
    _sum: { amount: true },
    _count: { id: true }
  });

  // ClientPaid yig'indisi
  const prepaidStats = await this.prisma.clientPaid.aggregate({
    where: {
      payment_date: {
        gte: startDate,
        lt: endDate
      },
      deleted_at: null
    },
    _sum: { amount: true }
  });

  // OtherPaid OUTCOME yig'indisi
  const outcomeStats = await this.prisma.otherPaid.aggregate({
    where: {
      payment_date: {
        gte: startDate,
        lt: endDate
      },
      type: 'OUTCOME',
      deleted_at: null
    },
    _sum: { amount: true }
  });

  // Visit yig'indisi
  const visitStats = await this.prisma.visit.aggregate({
    where: {
      visit_date: {
        gte: startDate,
        lt: endDate
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
  const totalOutcome = outcomeStats._sum.amount || 0;
  const averageCheck = visitStats._count.id > 0 
    ? Math.round(((visitStats._sum.total_amount || 0) / visitStats._count.id) * 100) / 100
    : 0;
  const totalDebt = visitStats._sum.debt_amount || 0;
  const profit = totalIncome - totalOutcome;

  return {
    totalIncome,
    totalPayment,
    totalPrepaid,
    totalOutcome,
    averageCheck,
    totalDebt,
    profit
  };
}

// Oylik solishtirma
private async getMonthlyComparison(
  month: number, 
  year: number
): Promise<MonthlyComparison> {
  // Oldingi oy
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  
  // Joriy oy hisoboti
  const currentReport = await this.getMonthlyReport(month, year, false);
  
  // Oldingi oy hisoboti
  const previousReport = await this.getMonthlyReport(previousMonth, previousYear, false);
  
  return {
    previousMonth,
    previousYear,
    visitChange: this.calculateChange(
      currentReport.visitStats.totalVisits,
      previousReport.visitStats.totalVisits
    ),
    incomeChange: this.calculateChange(
      currentReport.financialStats.totalIncome,
      previousReport.financialStats.totalIncome
    ),
    clientChange: this.calculateChange(
      currentReport.newClientStats.totalNewClients,
      previousReport.newClientStats.totalNewClients
    )
  };
}

private calculateChange(current: number, previous: number): ChangeMetric {
  const change = current - previous;
  const changePercent = previous > 0 
    ? Math.round((change / previous) * 100 * 100) / 100 
    : 0;
  
  return {
    current,
    previous,
    change,
    changePercent
  };
}
```

---

### 3.3 POST /api/v1/reports/monthly/export

**Tavsif:** Oylik hisobotni export qilish (Excel/PDF) (Admin, Accountant)

**Request Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```typescript
interface ExportMonthlyReportDto {
  month: number;      // Oy (1-12)
  year: number;       // Yil
  format: 'excel' | 'pdf';  // Export formati
  includeDetails?: boolean; // Tafsilotlarni qo'shish
}
```

**Request Body Example:**

```json
{
  "month": 1,
  "year": 2024,
  "format": "excel",
  "includeDetails": true
}
```

**Response:** File Download

- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`

**Service Layer Implementation:**

```typescript
async exportMonthlyReport(exportDto: ExportMonthlyReportDto, userId: number): Promise<Buffer> {
  // 1. Hisobot ma'lumotlarini olish
  const report = await this.getMonthlyReport(
    exportDto.month, 
    exportDto.year, 
    false
  );
  
  // 2. Formatga qarab export qilish
  if (exportDto.format === 'excel') {
    return this.generateExcel(report, exportDto.includeDetails);
  } else if (exportDto.format === 'pdf') {
    return this.generatePDF(report, exportDto.includeDetails);
  }
  
  throw new BadRequestException('RPT_006');
}

// Excel generatsiya
private async generateExcel(
  report: MonthlyReport, 
  includeDetails: boolean
): Promise<Buffer> {
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
    { metric: 'Oy', value: `${report.month}/${report.year}` },
    { metric: 'Jami Visitlar', value: report.visitStats.totalVisits },
    { metric: 'Yakunlangan Visitlar', value: report.visitStats.completedVisits },
    { metric: 'Umumiy Kirim', value: report.financialStats.totalIncome },
    { metric: 'Umumiy Chiqim', value: report.financialStats.totalOutcome },
    { metric: 'Foyda', value: report.financialStats.profit },
    { metric: 'O\'rtacha Check', value: report.financialStats.averageCheck },
    { metric: 'Yangi Mijozlar', value: report.newClientStats.totalNewClients },
    { metric: 'Retention Rate', value: `${report.newClientStats.retentionRate}%` }
  ]);
  
  // Shifokorlar sheet
  const doctorSheet = workbook.addWorksheet('Shifokorlar');
  doctorSheet.columns = [
    { header: 'Shifokor', key: 'name', width: 25 },
    { header: 'Visit Soni', key: 'visits', width: 15 },
    { header: 'Summa', key: 'amount', width: 20 },
    { header: 'Komissiya', key: 'commission', width: 20 },
    { header: 'O\'rtacha', key: 'average', width: 15 }
  ];
  doctorSheet.addRows(report.doctorLoadStats.map(d => ({
    name: d.doctorName,
    visits: d.visitCount,
    amount: d.totalAmount,
    commission: d.commission,
    average: d.averagePerVisit
  })));
  
  // Xizmatlar sheet
  const serviceSheet = workbook.addWorksheet('Xizmatlar');
  serviceSheet.columns = [
    { header: 'Xizmat', key: 'name', width: 30 },
    { header: 'Soni', key: 'count', width: 15 },
    { header: 'Summa', key: 'amount', width: 20 },
    { header: 'Ulush', key: 'percentage', width: 15 }
  ];
  serviceSheet.addRows(report.serviceStats.map(s => ({
    name: s.serviceName,
    count: s.count,
    amount: s.totalAmount,
    percentage: `${s.percentage}%`
  })));
  
  // Tafsilotlar (agar so'ralgan bo'lsa)
  if (includeDetails) {
    const detailSheet = workbook.addWorksheet('Tafsilotlar');
    // ... detail rows
  }
  
  // Buffer ga convert
  return await workbook.xlsx.writeBuffer();
}
```

---

### 3.4 GET /api/v1/reports/monthly/doctor/:doctorId

**Tavsif:** Shifokor oylik hisoboti (Admin, Doctor - faqat o'zi, Accountant)

**Query Params:**

```
GET /api/v1/reports/monthly/doctor/2?month=1&year=2024
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "doctorId": 2,
    "doctor": { "id": 2, "full_name": "Dr. John Smith" },
    "month": 1,
    "year": 2024,
    "visitCount": 450,
    "totalAmount": 150000000,
    "commission": 45000000,
    "averagePerVisit": 333333,
    "visits": [
      {
        "visitId": 1,
        "clientName": "John Doe",
        "status": "COMPLETED",
        "totalAmount": 300000,
        "commission": 90000,
        "visitDate": "2024-01-15T10:00:00.000Z"
      }
    ],
    "services": [
      {
        "serviceName": "Terapevt ko'rigi",
        "count": 200,
        "totalAmount": 60000000,
        "commission": 18000000
      }
    ]
  }
}
```

---

### 3.5 GET /api/v1/reports/monthly/trend

**Tavsif:** Oylik hisobot trendi (solishtirma) (Admin, Accountant)

**Query Params:**

```
GET /api/v1/reports/monthly/trend?month=1&year=2024&compare_months=6
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "currentMonth": { "month": 1, "year": 2024 },
    "compareMonths": 6,
    "trends": [
      {
        "month": 1,
        "year": 2024,
        "visits": 1350,
        "income": 450000000,
        "clients": 280
      },
      {
        "month": 12,
        "year": 2023,
        "visits": 1200,
        "income": 400000000,
        "clients": 250
      }
    ],
    "averageGrowth": {
      "visits": 8.5,
      "income": 10.2,
      "clients": 7.3
    }
  }
}
```

---

### 3.6 GET /api/v1/reports/monthly/services

**Tavsif:** Xizmatlar oylik statistikasi (Admin, Accountant)

**Query Params:**

```
GET /api/v1/reports/monthly/services?month=1&year=2024&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "month": 1,
    "year": 2024,
    "totalServices": 2500,
    "totalAmount": 750000000,
    "services": [
      {
        "serviceId": 1,
        "serviceName": "Terapevt ko'rigi",
        "count": 450,
        "totalAmount": 135000000,
        "percentage": 18.0,
        "averagePrice": 300000
      }
    ]
  }
}
```

---

### 3.7 GET /api/v1/reports/monthly/debt

**Tavsif:** Qarzdorlik oylik hisoboti (Admin, Accountant)

**Query Params:**

```
GET /api/v1/reports/monthly/debt?month=1&year=2024
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "month": 1,
    "year": 2024,
    "totalDebt": 75000000,
    "overdueDebt": 25000000,
    "debtRate": 16.7,
    "topDebtors": [
      {
        "clientId": 1,
        "clientName": "John Doe",
        "phone": "+998901234567",
        "debtAmount": 5000000,
        "daysOverdue": 30,
        "visitCount": 5
      }
    ],
    "debtByAge": [
      { "age": "0-30 kun", "amount": 50000000, "percentage": 66.7 },
      { "age": "31-60 kun", "amount": 15000000, "percentage": 20.0 },
      { "age": "60+ kun", "amount": 10000000, "percentage": 13.3 }
    ]
  }
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// get-monthly-report.dto.ts
import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean
} from 'class-validator';

export class GetMonthlyReportDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsOptional()
  year?: number;

  @IsBoolean()
  @IsOptional()
  compare?: boolean;
}

// export-monthly-report.dto.ts
import {
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsBoolean
} from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export class ExportMonthlyReportDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsNotEmpty()
  year: number;

  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @IsBoolean()
  @IsOptional()
  includeDetails?: boolean;
}

// get-monthly-trend.dto.ts
import {
  IsInt,
  Min,
  Max,
  IsNotEmpty
} from 'class-validator';

export class GetMonthlyTrendDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsNotEmpty()
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  compare_months?: number;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `month` | IsInt | RPT_009 | Oy raqam bo'lishi kerak |
| `month` | Min 1, Max 12 | RPT_009 | 1-12 oy oralig'ida |
| `year` | IsInt | RPT_010 | Yil raqam bo'lishi kerak |
| `year` | Min 2020, Max 2100 | RPT_010 | 2020-2100 yil oralig'ida |
| `format` | Enum | RPT_006 | excel/pdf |
| `compare` | IsBoolean | RPT_011 | Boolean qiymat bo'lishi kerak |
| `compare_months` | Min 1, Max 12 | RPT_012 | 1-12 oy oralig'ida |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `RPT_001` | 400 Bad Request | Sana formati noto'g'ri | Invalid date format | YYYY-MM-DD format kiriting |
| `RPT_002` | 400 Bad Request | Kelajak sana bo'lmasligi kerak | Future date not allowed | O'tgan oy tanlang |
| `RPT_003` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `RPT_004` | 404 Not Found | Shifokor topilmadi | Doctor ID not exists | Doctor ID ni tekshiring |
| `RPT_005` | 404 Not Found | Hisobot ma'lumotlari topilmadi | No data for period | Boshqa period tanlang |
| `RPT_006` | 400 Bad Request | Export formati noto'g'ri | Invalid format | excel/pdf tanlang |
| `RPT_007` | 400 Bad Request | Oy noto'g'ri | Invalid month | 1-12 oralig'ida |
| `RPT_008` | 400 Bad Request | Yil noto'g'ri | Invalid year | 2020-2100 oralig'ida |
| `RPT_009` | 500 Internal Server Error | Hisobot yaratishda xatolik | Calculation error | Admin bilan bog'laning |

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
    if (exception instanceof BadRequestException) return 'RPT_009';
    if (exception instanceof ForbiddenException) return 'RPT_003';
    if (exception instanceof NotFoundException) return 'RPT_005';
    return 'RPT_009';
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
| GET /reports/monthly | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /reports/monthly/export | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /reports/monthly/doctor/:id | ✅ | ✅ (o'zi) | ❌ | ❌ | ✅ |
| GET /reports/monthly/trend | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /reports/monthly/services | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /reports/monthly/debt | ✅ | ❌ | ❌ | ❌ | ✅ |

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
| Monthly Report | Redis | 30 daqiqa | Visit create/update/delete |
| Doctor Monthly Stats | Redis | 1 soat | Visit complete |
| Financial Monthly Stats | Redis | 30 daqiqa | Payment create/update |
| Export File | Redis | 24 soat | Automatic expiry |

### 7.2 Cache Implementation

```typescript
// Cache service
async getMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
  const cacheKey = `monthly_report:${year}-${month.toString().padStart(2, '0')}`;
  
  // 1. Cache dan olish
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }
  
  this.logger.debug(`Cache miss for ${cacheKey}`);
  
  // 2. DB dan hisoblash
  const report = await this.calculateMonthlyReport(month, year);
  
  // 3. Cache ga saqlash (30 daqiqa)
  await this.cacheService.set(cacheKey, report, { ttl: 1800 });
  
  return report;
}

// Cache invalidation
async invalidateMonthlyReportCache(month: number, year: number): Promise<void> {
  const cacheKey = `monthly_report:${year}-${month.toString().padStart(2, '0')}`;
  await this.cacheService.del(cacheKey);
  
  this.logger.log(`Cache invalidated for ${cacheKey}`);
}

// Event-based invalidation
@Events('visit.created')
async onVisitCreated(event: VisitCreatedEvent) {
  const month = event.visitDate.getMonth() + 1;
  const year = event.visitDate.getFullYear();
  await this.invalidateMonthlyReportCache(month, year);
}

@Events('payment.created')
async onPaymentCreated(event: PaymentCreatedEvent) {
  const month = event.paymentDate.getMonth() + 1;
  const year = event.paymentDate.getFullYear();
  await this.invalidateMonthlyReportCache(month, year);
}
```

---

## 8. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 8.1 Database Query Optimization

```typescript
// ✅ Yaxshi - Parallel queries
const [visitStats, financialStats, doctorStats] = await Promise.all([
  this.getMonthlyVisitStats(startDate, endDate, daysInMonth),
  this.getMonthlyFinancialStats(startDate, endDate),
  this.getMonthlyDoctorStats(startDate, endDate)
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
    visit_date: { gte: startDate, lt: endDate },
    deleted_at: null
  }
});

// ✅ Yaxshi - Indexlardan foydalanish
const visits = await this.prisma.visit.findMany({
  where: { 
    doctor_id: 2,
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
    visit_date: { gte: startDate, lt: endDate }
  }
});
```

### 8.2 Performance Talablari (Reference: `Klinika.md` 9.1)

| Ko'rsatkich | Qiymat | Measurement |
|-------------|--------|-------------|
| Report Generation Time | < 10 seconds | P95 |
| Cache Hit Rate | > 80% | Daily average |
| Export Generation Time | < 15 seconds | P95 |
| API Response Time | < 500ms (cached) | P95 |
| Concurrent Users | 50+ | Peak load |
| Data Freshness | 30 minutes | Cache TTL |

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

// VisitService
@@index([service_id, created_at])   // Xizmat va sana uchun
@@index([visit_id, service_id])     // Visit va xizmat uchun
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
// monthly-report.service.spec.ts
describe('MonthlyReportService', () => {
  let service: MonthlyReportService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthlyReportService, PrismaService, CacheService],
    }).compile();

    service = module.get<MonthlyReportService>(MonthlyReportService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getMonthlyReport', () => {
    it('should return monthly report from cache', async () => {
      const month = 1;
      const year = 2024;
      const cachedReport = { visitStats: { totalVisits: 1350 } };
      
      cacheService.get = jest.fn().mockResolvedValue(cachedReport);
      
      const result = await service.getMonthlyReport(month, year, false);
      
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate monthly report if cache miss', async () => {
      const month = 1;
      const year = 2024;
      
      cacheService.get = jest.fn().mockResolvedValue(null);
      prisma.visit.count = jest.fn().mockResolvedValue(1350);
      cacheService.set = jest.fn().mockResolvedValue(null);
      
      const result = await service.getMonthlyReport(month, year, false);
      
      expect(result.cached).toBe(false);
      expect(prisma.visit.count).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('monthly_report'),
        expect.any(Object),
        { ttl: 1800 }
      );
    });
  });

  describe('exportMonthlyReport', () => {
    it('should generate Excel export', async () => {
      const dto: ExportMonthlyReportDto = {
        month: 1,
        year: 2024,
        format: 'excel',
        includeDetails: true
      };
      
      service.getMonthlyReport = jest.fn().mockResolvedValue({});
      
      const result = await service.exportMonthlyReport(dto, 1);
      
      expect(result).toBeInstanceOf(Buffer);
    });
  });

  describe('getMonthlyComparison', () => {
    it('should return monthly comparison', async () => {
      service.getMonthlyReport = jest.fn()
        .mockResolvedValueOnce({ visitStats: { totalVisits: 1350 } })
        .mockResolvedValueOnce({ visitStats: { totalVisits: 1200 } });
      
      const result = await service['getMonthlyComparison'](1, 2024);
      
      expect(result.visitChange.change).toBe(150);
      expect(result.visitChange.changePercent).toBe(12.5);
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

Monthly Report alohida jadval emas, shuning uchun migration kerak emas.

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
MONTHLY_REPORT_CACHE_TTL=1800  # 30 daqiqa
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
| Flow Document | `20-monthly-report-management.md` | ⏳ Keyingi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| Daily Report RFC | `RFC-019-daily-report-management.md` | ✅ Tasdiqlandi |
| Doctor Performance RFC | `RFC-021-doctor-performance-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Oylik visit statistikasi to'g'ri hisoblanishi
- [ ] Oylik moliyaviy statistika to'g'ri hisoblanishi
- [ ] Shifokor yuklamasi to'g'ri hisoblanishi
- [ ] Xona bandligi to'g'ri hisoblanishi
- [ ] Yangi mijozlar statistikasi to'g'ri hisoblanishi
- [ ] Xizmatlar statistikasi to'g'ri hisoblanishi
- [ ] Qarzdorlik statistikasi to'g'ri hisoblanishi
- [ ] Cache strategiyasi ishlashi (30 daqiqa TTL)
- [ ] Export funksiyasi ishlashi (Excel/PDF)
- [ ] RBAC to'g'ri ishlashi (Doctor faqat o'zi) (Reference: `Klinika.md` 6.1)
- [ ] Oy validatsiyasi ishlashi (1-12)
- [ ] Yil validatsiyasi ishlashi (2020-2100)
- [ ] Trend solishtirma ishlashi
- [ ] Xatoliklar to'g'ri HTTP status va kod bilan qaytarilishi

### 12.2 Non-Functional Requirements (Reference: `Klinika.md` 9.1)

- [ ] API response time < 10 seconds (hisobot yaratish)
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
| Large data volume | O'rta | O'rta | Pagination + date range limit |
| Export timeout | Past | O'rta | Background job + notification |
| RBAC bypass | Past | Yuqori | Middleware + unit tests |
| Data accuracy | O'rta | Yuqori | Validation + audit logs |
| Cache memory usage | Past | O'rta | TTL + LRU eviction |
| Month boundary issues | Past | O'rta | Proper date calculation |

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
| Budget vs Actual comparison | 🟢 Low | Phase 4 |

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
