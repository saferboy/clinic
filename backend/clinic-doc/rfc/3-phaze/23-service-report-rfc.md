# 📋 RFC-023: Xizmatlar Hisoboti Boshqaruvi (Service Report Management)

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-023 |
| **Nomi** | Service Report Management |
| **Phase** | 3 - Reports & Analytics |
| **Model** | `Report` (Virtual - mavjud ma'lumotlardan hosil qilinadi) |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Analytics) |
| **Bog'liq RFC** | RFC-007 (Department), RFC-011 (Service), RFC-013 (Visit), RFC-018 (ServiceUser) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.4, 5.2, 6.1, 7.1, 7.2, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad

Ushbu RFC klinikada ko'rsatilgan xizmatlar bo'yicha batafsil hisobotlar tayyorlash, tahlil qilish va statistikani shakllantirish uchun to'liq texnik specifikatsiyani taqdim etadi. Eng talabgir xizmatlar, xizmatlardan olingan daromad, bo'limlar kesimida xizmatlar va boshqa metrikalarni hisoblash. Xizmat narxlarini optimallashtirish va marketing strategiyasini rejalashtirish uchun asos yaratish (Reference: `Klinika.md` 7.1, 7.2).

### 1.2 Qamrov

| Doxil | Doxil Emas |
|-------|------------|
| ✅ Xizmatlar umumiy hisobotini olish | ❌ Xizmat narxlarini yangilash |
| ✅ Xizmatlar reytingini olish | ❌ Frontend implementatsiya |
| ✅ Bo'limlar kesimida hisobot | ❌ Mobile integratsiya |
| ✅ Shifokorlar kesimida hisobot | ❌ Avtomatik email yuborish |
| ✅ Vaqt trendi tahlili | |
| ✅ Xizmat hisoboti export | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 7.1, 7.2)

- Xizmatlar samaradorligini kuzatish va tahlil qilish
- Eng talabgir xizmatlarni aniqlash
- Bo'limlar kesimida daromad tahlili
- Xizmat narxlarini optimallashtirish
- Marketing strategiyasini rejalashtirish
- Shifokorlar bo'yicha xizmat ko'rsatish statistikasi
- Mavsumiy o'zgarishlarni kuzatish

---

## 2. MA'LUMOTLAR MODELI

### 2.1 Virtual Report Model

Service Report alohida jadvalda saqlanmaydi. U quyidagi jadvallardan real-time hosil qilinadi:

```
┌─────────────────────────────────────────────────────────────┐
│              SERVICE REPORT DATA SOURCES                    │
├─────────────────────────────────────────────────────────────┤
│  VisitService   → Ko'rsatilgan xizmatlar                    │
│  Service        → Xizmat ma'lumotlari                       │
│  Department     → Bo'lim ma'lumotlari                       │
│  Visit          → Qabul ma'lumotlari                        │
│  User           → Shifokor ma'lumotlari                     │
│  ServiceUser    → Shifokor stavkalari                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Report Tuzilishi

```typescript
interface ServiceReport {
  period: {
    from: Date;
    to: Date;
  };
  summary: ServiceSummary;
  topServices: TopServiceStats[];
  lowServices: LowServiceStats[];
  byDepartment: DepartmentServiceStats[];
  byDoctor: DoctorServiceStats[];
  trendData: ServiceTrendData[];
}

interface ServiceSummary {
  totalServices: number;         // Jami ko'rsatilgan xizmatlar
  totalRevenue: number;          // Xizmatlardan daromad
  averagePrice: number;          // O'rtacha xizmat narxi
  averagePerDay: number;         // Kunlik o'rtacha
  uniqueServices: number;        // Unikal xizmatlar soni
  totalCommission: number;       // Shifokor komissiyasi
}

interface TopServiceStats {
  serviceId: number;
  serviceName: string;
  departmentName: string;
  count: number;
  revenue: number;
  percentage: number;
  averagePrice: number;
}

interface LowServiceStats {
  serviceId: number;
  serviceName: string;
  count: number;
  lastUsedDate: Date | null;
}

interface DepartmentServiceStats {
  departmentId: number;
  departmentName: string;
  serviceCount: number;
  revenue: number;
  percentage: number;
  services: ServiceInDepartment[];
}

interface ServiceInDepartment {
  serviceId: number;
  serviceName: string;
  count: number;
  revenue: number;
}

interface DoctorServiceStats {
  doctorId: number;
  doctorName: string;
  serviceCount: number;
  revenue: number;
  commission: number;
  topServices: ServiceForDoctor[];
}

interface ServiceForDoctor {
  serviceId: number;
  serviceName: string;
  count: number;
}

interface ServiceTrendData {
  date: Date;
  serviceCount: number;
  revenue: number;
  averagePrice: number;
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
VisitService,     Aggregate,      Cache Store
Service,          Calculate       (30 min TTL)
Department        Metrics
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | GET | `/api/v1/reports/services` | ✅ JWT | Admin, Doctor (o'z xizmatlari), Accountant | Xizmatlar hisobotini olish |
| 2 | GET | `/api/v1/reports/services/ranking` | ✅ JWT | Admin, Accountant | Xizmatlar reytingi |
| 3 | GET | `/api/v1/reports/services/by-department` | ✅ JWT | Admin, Accountant | Bo'limlar kesimida xizmatlar |
| 4 | POST | `/api/v1/reports/services/export` | ✅ JWT | Admin, Accountant | Xizmat hisoboti export (Excel/PDF) |

---

### 3.2 GET /api/v1/reports/services

**Tavsif:** Xizmatlar hisobotini olish (Admin, Doctor - o'z xizmatlari, Accountant)

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
GET /api/v1/reports/services?start_date=2024-01-01&end_date=2024-01-31
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
      "totalServices": 1500,
      "totalRevenue": 450000000,
      "averagePrice": 300000,
      "averagePerDay": 48.4,
      "uniqueServices": 45,
      "totalCommission": 135000000
    },
    "topServices": [
      {
        "serviceId": 1,
        "serviceName": "Terapevt ko'rigi",
        "departmentName": "Terapiya",
        "count": 450,
        "revenue": 135000000,
        "percentage": 30.0,
        "averagePrice": 300000
      }
    ],
    "lowServices": [...],
    "byDepartment": [...],
    "byDoctor": [...],
    "trendData": [...]
  },
  "generatedAt": "2024-02-01T10:00:00.000Z",
  "cached": true
}
```

**Service Layer Implementation:**

```typescript
// service-report.service.ts
async getServiceReport(
  startDate: Date,
  endDate: Date,
  currentUserId: number,
  currentUserRole: string
): Promise<ServiceReport> {
  // 1. RBAC tekshiruvi (Reference: Klinika.md 6.1)
  if (currentUserRole === 'Doctor') {
    // Doctor faqat o'z xizmatlarini ko'ra oladi
    // Visit orqali doctor_id filter qilinadi
  } else if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
    throw new ForbiddenException('SR_001');
  }

  // 2. VisitServices ma'lumotlarini olish
  const visitServices = await this.prisma.visitService.findMany({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate
      },
      deleted_at: null,
      visit: currentUserRole === 'Doctor' ? {
        doctor_id: currentUserId,
        deleted_at: null
      } : {
        deleted_at: null
      }
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          department_id: true,
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      visit: {
        select: {
          id: true,
          doctor_id: true,
          visit_date: true,
          doctor: {
            select: {
              id: true,
              full_name: true
            }
          }
        }
      }
    }
  });

  // 3. Umumiy statistika hisoblash
  const summary = this.calculateServiceSummary(visitServices);

  // 4. Eng talabgir xizmatlar
  const topServices = await this.getTopServices(visitServices, startDate, endDate);

  // 5. Eng kam talab qilingan xizmatlar
  const lowServices = await this.getLowServices(visitServices, startDate, endDate);

  // 6. Bo'limlar kesimida
  const byDepartment = await this.getServicesByDepartment(visitServices, startDate, endDate);

  // 7. Shifokorlar kesimida
  const byDoctor = await this.getServicesByDoctor(visitServices, startDate, endDate);

  // 8. Vaqt bo'yicha trend
  const trendData = await this.getServiceTrend(visitServices, startDate, endDate);

  return {
    period: {
      from: startDate,
      to: endDate
    },
    summary,
    topServices,
    lowServices,
    byDepartment,
    byDoctor,
    trendData
  };
}

// Umumiy statistika hisoblash
private calculateServiceSummary(visitServices: any[]): ServiceSummary {
  const totalServices = visitServices.reduce((sum, vs) => sum + vs.quantity, 0);
  const totalRevenue = visitServices.reduce((sum, vs) => sum + vs.total.toNumber(), 0);
  const uniqueServices = new Set(visitServices.map(vs => vs.service_id)).size;
  
  const daysDiff = Math.max(1, Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ));
  
  const averagePerDay = Math.round((totalServices / daysDiff) * 10) / 10;
  const averagePrice = totalServices > 0 
    ? Math.round((totalRevenue / totalServices) * 100) / 100
    : 0;

  // Komissiyani hisoblash (ServiceUser orqali)
  const totalCommission = visitServices.reduce((sum, vs) => {
    // ServiceUser mavjud bo'lsa komissiya hisoblanadi
    return sum; // ServiceUser ma'lumotlari alohida olinadi
  }, 0);

  return {
    totalServices,
    totalRevenue,
    averagePrice,
    averagePerDay,
    uniqueServices,
    totalCommission
  };
}

// Eng talabgir xizmatlar
private async getTopServices(
  visitServices: any[],
  startDate: Date,
  endDate: Date
): Promise<TopServiceStats[]> {
  // Xizmatlar bo'yicha guruhlash
  const serviceStats = new Map<number, {
    count: number;
    revenue: number;
    serviceName: string;
    departmentName: string;
  }>();

  for (const vs of visitServices) {
    if (!serviceStats.has(vs.service_id)) {
      serviceStats.set(vs.service_id, {
        count: 0,
        revenue: 0,
        serviceName: vs.service.name,
        departmentName: vs.service.department?.name || 'Noma\'lum'
      });
    }

    const stat = serviceStats.get(vs.service_id)!;
    stat.count += vs.quantity;
    stat.revenue += vs.total.toNumber();
  }

  // Top 10 xizmatlar
  const topServices = Array.from(serviceStats.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([serviceId, stat]) => {
      const totalRevenueAll = visitServices
        .reduce((sum, vs) => sum + vs.total.toNumber(), 0);
      
      const percentage = totalRevenueAll > 0
        ? Math.round((stat.revenue / totalRevenueAll) * 100 * 10) / 10
        : 0;

      const averagePrice = stat.count > 0
        ? Math.round((stat.revenue / stat.count) * 100) / 100
        : 0;

      return {
        serviceId,
        serviceName: stat.serviceName,
        departmentName: stat.departmentName,
        count: stat.count,
        revenue: stat.revenue,
        percentage,
        averagePrice
      };
    });

  return topServices;
}
```

---

### 3.3 GET /api/v1/reports/services/ranking

**Tavsif:** Xizmatlar reytingi (Admin, Accountant)

**Query Parameters:**

| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi |
| `end_date` | date | ✅ | - | Tugash sanasi |
| `limit` | number | ❌ | 10 | Reytingdagi xizmatlar soni |

**Request Example:**

```http
GET /api/v1/reports/services/ranking?start_date=2024-01-01&end_date=2024-01-31&limit=10
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
        "serviceId": 1,
        "serviceName": "Terapevt ko'rigi",
        "departmentName": "Terapiya",
        "count": 450,
        "revenue": 135000000,
        "percentage": 30.0,
        "averagePrice": 300000
      },
      {
        "rank": 2,
        "serviceId": 2,
        "serviceName": "UZI tekshiruvi",
        "departmentName": "Diagnostika",
        "count": 300,
        "revenue": 90000000,
        "percentage": 20.0,
        "averagePrice": 300000
      }
    ]
  }
}
```

**Service Layer Implementation:**

```typescript
async getServiceRanking(
  startDate: Date,
  endDate: Date,
  limit: number = 10,
  currentUserId: number,
  currentUserRole: string
): Promise<ServiceRanking> {
  // 1. RBAC tekshiruvi
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
    if (currentUserRole === 'Doctor') {
      // Doctor faqat o'z xizmatlarini ko'ra oladi
    } else {
      throw new ForbiddenException('SR_001');
    }
  }

  // 2. Xizmatlar statistikasini olish
  const serviceStats = await this.prisma.visitService.groupBy({
    by: ['service_id'],
    _count: {
      id: true
    },
    _sum: {
      total: true,
      quantity: true
    },
    where: {
      created_at: {
        gte: startDate,
        lt: endDate
      },
      deleted_at: null,
      visit: currentUserRole === 'Doctor' ? {
        doctor_id: currentUserId,
        deleted_at: null
      } : {
        deleted_at: null
      }
    },
    orderBy: {
      _sum: {
        total: 'desc'
      }
    },
    take: limit
  });

  // 3. Xizmat ma'lumotlarini qo'shish
  const rankings = await Promise.all(
    serviceStats.map(async (item, index) => {
      const service = await this.prisma.service.findUnique({
        where: { id: item.service_id! },
        include: {
          department: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      const totalRevenue = serviceStats.reduce((sum, s) => 
        sum + (s._sum.total?.toNumber() || 0), 0
      );

      const percentage = totalRevenue > 0
        ? Math.round(((item._sum.total?.toNumber() || 0) / totalRevenue) * 100 * 10) / 10
        : 0;

      const averagePrice = (item._sum.quantity?.toNumber() || 0) > 0
        ? Math.round(((item._sum.total?.toNumber() || 0) / (item._sum.quantity?.toNumber() || 0)) * 100) / 100
        : 0;

      return {
        rank: index + 1,
        serviceId: item.service_id!,
        serviceName: service?.name || 'Noma\'lum',
        departmentName: service?.department?.name || 'Noma\'lum',
        count: item._sum.quantity?.toNumber() || 0,
        revenue: item._sum.total?.toNumber() || 0,
        percentage,
        averagePrice
      };
    })
  );

  return {
    period: {
      from: startDate,
      to: endDate
    },
    rankings
  };
}
```

---

### 3.4 GET /api/v1/reports/services/by-department

**Tavsif:** Bo'limlar kesimida xizmatlar (Admin, Accountant)

**Query Parameters:**

| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi |
| `end_date` | date | ✅ | - | Tugash sanasi |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01T00:00:00.000Z",
      "to": "2024-01-31T23:59:59.999Z"
    },
    "departments": [
      {
        "departmentId": 1,
        "departmentName": "Terapiya",
        "serviceCount": 500,
        "revenue": 150000000,
        "percentage": 33.3,
        "services": [
          {
            "serviceId": 1,
            "serviceName": "Terapevt ko'rigi",
            "count": 450,
            "revenue": 135000000,
            "averagePrice": 300000
          }
        ]
      }
    ],
    "totalRevenue": 450000000
  }
}
```

**Service Layer Implementation:**

```typescript
async getServicesByDepartmentReport(
  startDate: Date,
  endDate: Date,
  currentUserId: number,
  currentUserRole: string
): Promise<DepartmentServiceReport> {
  // 1. Barcha aktiv bo'limlarni olish
  const departments = await this.prisma.department.findMany({
    where: {
      status: 'ACTIVE',
      deleted_at: null
    },
    select: {
      id: true,
      name: true
    }
  });

  // 2. Har bir bo'lim uchun xizmat statistikasi
  const departmentReports = await Promise.all(
    departments.map(async (dept) => {
      const serviceStats = await this.prisma.visitService.groupBy({
        by: ['service_id'],
        _count: {
          id: true
        },
        _sum: {
          total: true,
          quantity: true
        },
        where: {
          created_at: {
            gte: startDate,
            lt: endDate
          },
          deleted_at: null,
          service: {
            department_id: dept.id
          },
          visit: currentUserRole === 'Doctor' ? {
            doctor_id: currentUserId,
            deleted_at: null
          } : {
            deleted_at: null
          }
        }
      });

      const totalServiceCount = serviceStats.reduce((sum, s) => 
        sum + (s._sum.quantity?.toNumber() || 0), 0
      );
      
      const totalRevenue = serviceStats.reduce((sum, s) => 
        sum + (s._sum.total?.toNumber() || 0), 0
      );

      const services = await Promise.all(
        serviceStats.map(async (item) => {
          const service = await this.prisma.service.findUnique({
            where: { id: item.service_id! },
            select: {
              id: true,
              name: true,
              price: true
            }
          });

          return {
            serviceId: item.service_id!,
            serviceName: service?.name || 'Noma\'lum',
            count: item._sum.quantity?.toNumber() || 0,
            revenue: item._sum.total?.toNumber() || 0,
            averagePrice: service?.price.toNumber() || 0
          };
        })
      );

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        serviceCount: totalServiceCount,
        revenue: totalRevenue,
        services: services.sort((a, b) => b.revenue - a.revenue)
      };
    })
  );

  // 3. Umumiy yig'indi
  const totalRevenue = departmentReports.reduce((sum, d) => sum + d.revenue, 0);

  return {
    period: {
      from: startDate,
      to: endDate
    },
    departments: departmentReports
      .sort((a, b) => b.revenue - a.revenue)
      .map(dept => ({
        ...dept,
        percentage: totalRevenue > 0
          ? Math.round((dept.revenue / totalRevenue) * 100 * 10) / 10
          : 0
      })),
    totalRevenue
  };
}
```

---

### 3.5 POST /api/v1/reports/services/export

**Tavsif:** Xizmat hisobotini export qilish (Excel/PDF) (Admin, Accountant)

**Request Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```typescript
interface ExportServiceReportDto {
  start_date: Date;     // Boshlanish sanasi
  end_date: Date;       // Tugash sanasi
  format: 'excel' | 'pdf';  // Export formati
  includeDetails?: boolean; // Tafsilotlarni qo'shish
}
```

**Request Body Example:**

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

**Service Layer Implementation:**

```typescript
async exportServiceReport(exportDto: ExportServiceReportDto, userId: number): Promise<Buffer> {
  // 1. Hisobot ma'lumotlarini olish
  const report = await this.getServiceReport(
    exportDto.start_date,
    exportDto.end_date,
    userId,
    'Admin'
  );
  
  // 2. Formatga qarab export qilish
  if (exportDto.format === 'excel') {
    return this.generateExcel(report, exportDto.includeDetails);
  } else if (exportDto.format === 'pdf') {
    return this.generatePDF(report, exportDto.includeDetails);
  }
  
  throw new BadRequestException('SR_006');
}

// Excel generatsiya
private async generateExcel(report: ServiceReport, includeDetails: boolean): Promise<Buffer> {
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
    { metric: 'Davr', value: `${report.period.from} - ${report.period.to}` },
    { metric: 'Jami Xizmatlar', value: report.summary.totalServices },
    { metric: 'Jami Daromad', value: report.summary.totalRevenue },
    { metric: 'O\'rtacha Narx', value: report.summary.averagePrice },
    { metric: 'Kunlik O\'rtacha', value: report.summary.averagePerDay },
    { metric: 'Unikal Xizmatlar', value: report.summary.uniqueServices }
  ]);
  
  // Top xizmatlar sheet
  const topSheet = workbook.addWorksheet('Top Xizmatlar');
  topSheet.columns = [
    { header: 'Xizmat', key: 'name', width: 30 },
    { header: 'Bo\'lim', key: 'department', width: 25 },
    { header: 'Soni', key: 'count', width: 15 },
    { header: 'Daromad', key: 'revenue', width: 20 },
    { header: 'Ulush (%)', key: 'percentage', width: 15 }
  ];
  topSheet.addRows(report.topServices.map(s => ({
    name: s.serviceName,
    department: s.departmentName,
    count: s.count,
    revenue: s.revenue,
    percentage: s.percentage
  })));
  
  // Bo'limlar sheet
  const deptSheet = workbook.addWorksheet('Bo\'limlar');
  deptSheet.columns = [
    { header: 'Bo\'lim', key: 'department', width: 25 },
    { header: 'Xizmat Soni', key: 'count', width: 15 },
    { header: 'Daromad', key: 'revenue', width: 20 },
    { header: 'Ulush (%)', key: 'percentage', width: 15 }
  ];
  deptSheet.addRows(report.byDepartment.map(d => ({
    department: d.departmentName,
    count: d.serviceCount,
    revenue: d.revenue,
    percentage: d.percentage
  })));
  
  // Buffer ga convert
  return await workbook.xlsx.writeBuffer();
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// get-service-report.dto.ts
import {
  IsDateString,
  IsNotEmpty
} from 'class-validator';

export class GetServiceReportDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

// get-service-ranking.dto.ts
import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max
} from 'class-validator';

export class GetServiceRankingDto {
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

// export-service-report.dto.ts
import { IsEnum, IsBoolean } from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export class ExportServiceReportDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `start_date` | IsDateString | SR_002 | Sana formati noto'g'ri |
| `end_date` | IsDateString | SR_002 | Sana formati noto'g'ri |
| `end_date` | >= start_date | SR_003 | Tugash sana boshlanish sanadan keyin bo'lishi kerak |
| `format` | Enum | SR_006 | excel/pdf tanlang |
| `limit` | Min 1, Max 100 | SR_005 | 1-100 oralig'ida |
| `includeDetails` | IsBoolean | SR_007 | Boolean qiymat bo'lishi kerak |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `SR_001` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `SR_002` | 400 Bad Request | Sana formati noto'g'ri | Invalid date format | YYYY-MM-DD format kiriting |
| `SR_003` | 400 Bad Request | Tugash sana boshlanish sanadan keyin bo'lishi kerak | end_date < start_date | Sanalarni tekshiring |
| `SR_004` | 404 Not Found | Xizmat topilmadi | Service ID not exists | Service ID ni tekshiring |
| `SR_005` | 400 Bad Request | Limit noto'g'ri | Invalid limit | 1-100 oralig'ida |
| `SR_006` | 400 Bad Request | Export formati noto'g'ri | Invalid format | excel/pdf tanlang |
| `SR_007` | 400 Bad Request | Tafsilot noto'g'ri | Invalid boolean | true/false tanlang |
| `SR_008` | 500 Internal Server Error | Hisobot yaratishda xatolik | Calculation error | Admin bilan bog'laning |

### 5.2 Exception Filter

```typescript
// service-report-exception.filter.ts
@Catch()
export class ServiceReportExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ForbiddenException) return 'SR_001';
    if (exception instanceof BadRequestException) return 'SR_002';
    if (exception instanceof NotFoundException) return 'SR_004';
    return 'SR_008';
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
| GET /services | ✅ | ✅ (o'zi) | ❌ | ✅ | ✅ |
| GET /services/ranking | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /services/by-department | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /services/export | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)

| Harakat | Log Qilinadi | Saqlash Muddati |
|--------|-------------|-----------------|
| Hisobot ko'rish | ✅ | 5 yil |
| Export qilish | ✅ | 5 yil |
| Cache access | ✅ | 30 kun |

### 6.4 Ma'lumotlar Xavfsizligi (Reference: `Klinika.md` 8.1)

- ✅ Doctor faqat o'z xizmatlarini ko'ra oladi
- ✅ Moliyaviy ma'lumotlar faqat Admin/Accountant uchun
- ✅ Export fayllar vaqtinchalik saqlanadi (24 soat)
- ✅ Cache ma'lumotlari shifrlangan

---

## 7. CACHE STRATEGY (Reference: `Klinika.md` 9.1)

### 7.1 Caching Configuration

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Service Report | Redis | 30 daqiqa | VisitService create/update/delete |
| Service Ranking | Redis | 1 soat | VisitService create/update |
| Department Report | Redis | 1 soat | VisitService create/update |
| Export File | Redis | 24 soat | Automatic expiry |

### 7.2 Cache Implementation

```typescript
// Cache service
async getServiceReport(startDate: Date, endDate: Date): Promise<ServiceReport> {
  const cacheKey = `service_report:${startDate.toISOString()}:${endDate.toISOString()}`;
  
  // 1. Cache dan olish
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }
  
  this.logger.debug(`Cache miss for ${cacheKey}`);
  
  // 2. DB dan hisoblash
  const report = await this.calculateServiceReport(startDate, endDate);
  
  // 3. Cache ga saqlash (30 daqiqa)
  await this.cacheService.set(cacheKey, report, { ttl: 1800 });
  
  return report;
}

// Cache invalidation
async invalidateServiceReportCache(startDate: Date, endDate: Date): Promise<void> {
  const cacheKey = `service_report:${startDate.toISOString()}:${endDate.toISOString()}`;
  await this.cacheService.del(cacheKey);
  
  this.logger.log(`Cache invalidated for ${cacheKey}`);
}

// Event-based invalidation
@Events('visitService.created')
async onVisitServiceCreated(event: VisitServiceCreatedEvent) {
  await this.invalidateServiceReportCache(event.startDate, event.endDate);
}

@Events('visitService.updated')
async onVisitServiceUpdated(event: VisitServiceUpdatedEvent) {
  await this.invalidateServiceReportCache(event.startDate, event.endDate);
}
```

---

## 8. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 8.1 Database Query Optimization

```typescript
// ✅ Yaxshi - Parallel queries
const [summary, topServices, byDepartment] = await Promise.all([
  this.calculateServiceSummary(visitServices),
  this.getTopServices(visitServices, startDate, endDate),
  this.getServicesByDepartment(visitServices, startDate, endDate)
]);

// ✅ Yaxshi - Faqat kerakli maydonlar
const visitServices = await this.prisma.visitService.findMany({
  select: { 
    id: true, 
    service_id: true, 
    quantity: true,
    total: true,
    created_at: true
  },
  where: { 
    created_at: { gte: startDate, lt: endDate },
    deleted_at: null
  }
});

// ✅ Yaxshi - Indexlardan foydalanish
const visitServices = await this.prisma.visitService.findMany({
  where: { 
    created_at: {
      gte: startDate,
      lt: endDate
    },
    deleted_at: null
  }
  // Uses index: @@index([visit_id, service_id])
});

// ❌ Yomon - Barcha maydonlar
const visitServices = await this.prisma.visitService.findMany({
  where: { 
    created_at: { gte: startDate, lt: endDate }
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
| Data Freshness | 30 minutes | Cache TTL |

### 8.3 Database Indexlar (Reference: `klinika_prisma.txt`)

```prisma
// VisitService
@@index([visit_id])              // Visit filter uchun
@@index([service_id])            // Service filter uchun
@@index([deleted_at])            // Soft delete filter uchun
@@index([visit_id, service_id])  // Visit va service uchun (qo'shma)
@@index([registered_by])         // Audit uchun
@@index([modified_by])           // Audit uchun

// Service
@@index([department_id])         // Bo'lim filter uchun
@@index([status])                // Status filter uchun
@@index([department_id, status]) // Bo'lim va status uchun

// Department
@@index([status])                // Status filter uchun
@@index([name])                  // Nom qidiruv uchun
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
// service-report.service.spec.ts
describe('ServiceReportService', () => {
  let service: ServiceReportService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceReportService, PrismaService, CacheService],
    }).compile();

    service = module.get<ServiceReportService>(ServiceReportService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getServiceReport', () => {
    it('should return service report from cache', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const cachedReport = { summary: { totalServices: 1500 } };
      
      cacheService.get = jest.fn().mockResolvedValue(cachedReport);
      
      const result = await service.getServiceReport(startDate, endDate, 1, 'Admin');
      
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate service report if cache miss', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      cacheService.get = jest.fn().mockResolvedValue(null);
      prisma.visitService.findMany = jest.fn().mockResolvedValue([]);
      cacheService.set = jest.fn().mockResolvedValue(null);
      
      const result = await service.getServiceReport(startDate, endDate, 1, 'Admin');
      
      expect(result.cached).toBe(false);
      expect(prisma.visitService.findMany).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('service_report'),
        expect.any(Object),
        { ttl: 1800 }
      );
    });

    it('should throw ForbiddenException for unauthorized role', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      
      await expect(
        service.getServiceReport(startDate, endDate, 1, 'Nurse')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getServiceRanking', () => {
    it('should return service ranking', async () => {
      prisma.visitService.groupBy = jest.fn().mockResolvedValue([
        { service_id: 1, _count: { id: 10 }, _sum: { total: 1000000, quantity: 10 } }
      ]);
      prisma.service.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        name: 'Terapevt ko\'rigi',
        department: { name: 'Terapiya' }
      });
      
      const result = await service.getServiceRanking(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
        10,
        1,
        'Admin'
      );
      
      expect(result.rankings.length).toBeGreaterThan(0);
      expect(result.rankings[0].rank).toBe(1);
    });
  });

  describe('exportServiceReport', () => {
    it('should generate Excel export', async () => {
      const dto: ExportServiceReportDto = {
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-01-31'),
        format: 'excel',
        includeDetails: true
      };
      
      service.getServiceReport = jest.fn().mockResolvedValue({});
      
      const result = await service.exportServiceReport(dto, 1);
      
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

Service Report alohida jadval emas, shuning uchun migration kerak emas.

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
SERVICE_REPORT_CACHE_TTL=1800  # 30 daqiqa
SERVICE_RANKING_CACHE_TTL=3600  # 1 soat
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
- [ ] Large dataset test qilindi (10000+ visitServices)

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `23-service-report-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| Service RFC | `RFC-011-service-management.md` | ✅ Tasdiqlandi |
| Department RFC | `RFC-007-department-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| ServiceUser RFC | `RFC-018-service-user-management.md` | ✅ Tasdiqlandi |
| Daily Report RFC | `RFC-019-daily-report-management.md` | ✅ Tasdiqlandi |
| Monthly Report RFC | `RFC-020-monthly-report-management.md` | ✅ Tasdiqlandi |
| Doctor Performance RFC | `RFC-021-doctor-performance-management.md` | ✅ Tasdiqlandi |
| Client Report RFC | `RFC-022-client-report-management.md` | ✅ Tasdiqlandi |
| Debt Report RFC | `RFC-024-debt-report-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Xizmatlar umumiy statistikasi to'g'ri hisoblanishi
- [ ] Eng talabgir xizmatlar to'g'ri aniqlanishi
- [ ] Bo'limlar kesimida statistika to'g'ri ishlashi
- [ ] Shifokorlar kesimida statistika to'g'ri ishlashi
- [ ] Vaqt trendi to'g'ri hisoblanishi
- [ ] Xizmatlar reytingi to'g'ri ishlashi
- [ ] Cache strategiyasi ishlashi (30 daqiqa TTL)
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
| Commission calculation error | O'rta | Yuqori | ServiceUser double-check |

---

## 14. KELAJAKDA QO'SHILISHI MUMKIN

| Feature | Priority | Phase |
|---------|----------|-------|
| Automated service reports | 🟡 Medium | Phase 4 |
| Service profitability analysis | 🟡 Medium | Phase 4 |
| Seasonal trend analysis | 🟢 Low | Phase 4 |
| Service comparison tool | 🟢 Low | Phase 4 |
| Price optimization recommendations | 🟢 Low | Phase 5 |
| AI-powered insights | 🟢 Low | Phase 5 |
| Mobile app reports | 🟢 Low | Phase 4 |
| Service bundle analysis | 🟢 Low | Phase 4 |

---
