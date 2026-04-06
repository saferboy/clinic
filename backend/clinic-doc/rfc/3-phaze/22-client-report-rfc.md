# 📋 RFC-022: Mijoz Hisoboti Boshqaruvi (Client Report Management)

---

## 📄 RFC METADATA

| Maydon | Qiymat |
|--------|--------|
| **RFC ID** | RFC-022 |
| **Nomi** | Client Report Management |
| **Phase** | 3 - Reports & Analytics |
| **Model** | `Report` (Virtual - mavjud ma'lumotlardan hosil qilinadi) |
| **Status** | Draft |
| **Yaratilgan** | 2024-01-15 |
| **Muallif** | Senior Backend Developer |
| **Tasdiqlangan** | _______________ |
| **Prioritet** | 🔴 High (Critical Path - Analytics) |
| **Bog'liq RFC** | RFC-009 (Client), RFC-013 (Visit), RFC-014 (Payment), RFC-015 (ClientPaid) |
| **Reference** | `klinika_prisma.txt`, `Klinika.md` (Sections 3.2, 5.2, 6.1, 7.1, 7.2, 8.1, 9.1) |

---

## 1. MAQSAD VA QAMROV

### 1.1 Maqsad
Ushbu RFC mijozlar faoliyatini kuzatish, tahlil qilish va hisobot qilish uchun to'liq texnik specifikatsiyani taqdim etadi. Har bir mijoz uchun tashriflar tarixi, to'lovlar, qarzdorlik, xizmatlar va boshqa metrikalarni hisoblash. Mijoz segmentatsiyasi va loyalitet dasturlari uchun asos yaratish (Reference: `Klinika.md` 7.1, 7.2).

### 1.2 Qamrov
| Doxil | Doxil Emas |
|-------|------------|
| ✅ Bitta mijoz hisobotini olish | ❌ Mijoz profilini yangilash |
| ✅ Mijozlar ro'yxati hisoboti | ❌ Frontend implementatsiya |
| ✅ Mijoz segmentatsiyasi | ❌ Mobile integratsiya |
| ✅ Mijoz hisoboti export | ❌ Avtomatik email yuborish |
| ✅ Mijoz loyalitet tahlili | |

### 1.3 Biznes Qiymati (Reference: `Klinika.md` 1.2, 7.1, 7.2)
- Mijozlar faoliyatini kuzatish va tahlil qilish
- Mijoz segmentatsiyasi va marketing strategiyasi
- Qarzdor mijozlarni aniqlash va nazorat qilish
- Mijoz loyalitetini oshirish
- Mijoz qaytish foizini (retention) kuzatish
- Mijoz manbailari samaradorligini tahlil qilish

---

## 2. MA'LUMOTLAR MODELI

### 2.1 Virtual Report Model

Client Report alohida jadvalda saqlanmaydi. U quyidagi jadvallardan real-time hosil qilinadi:

```
┌─────────────────────────────────────────────────────────────┐
│              CLIENT REPORT DATA SOURCES                     │
├─────────────────────────────────────────────────────────────┤
│  Client         → Mijoz ma'lumotlari                        │
│  Visit          → Tashriflar tarixi                         │
│  VisitService   → Ko'rsatilgan xizmatlar                    │
│  Payment        → To'lovlar                                 │
│  ClientPaid     → Oldindan to'lovlar                        │
│  ClientGroup    → Mijoz guruhi                              │
│  Source         → Mijoz manbai                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Report Tuzilishi

```typescript
interface ClientReport {
  clientId: number;
  clientInfo: ClientInfo;
  visitStats: VisitStats;
  financialStats: FinancialStats;
  serviceStats: ServiceStats;
  doctorStats: DoctorStats;
  visitHistory: VisitHistory[];
  paymentHistory: PaymentHistory[];
}

interface ClientInfo {
  fullName: string;
  phone: string;
  gender: ClientGender;
  dateOfBirth: Date | null;
  region: string | null;
  district: string | null;
  address: string | null;
  group: string | null;
  source: string | null;
  registeredAt: Date;
  lastVisitAt: Date | null;
}

interface VisitStats {
  totalVisits: number;
  completedVisits: number;
  cancelledVisits: number;
  noShowVisits: number;
  firstVisitDate: Date | null;
  lastVisitDate: Date | null;
  averageVisitsPerMonth: number;
}

interface FinancialStats {
  totalSpent: number;        // Jami sarflangan
  totalPaid: number;         // Jami to'langan
  totalDebt: number;         // Jami qarz
  totalPrepaid: number;      // Jami oldindan to'lov
  averageCheck: number;      // O'rtacha check
  lastPaymentDate: Date | null;
}

interface ServiceStats {
  totalServices: number;
  topServices: TopService[];
}

interface TopService {
  serviceId: number;
  serviceName: string;
  count: number;
  totalAmount: number;
}

interface DoctorStats {
  totalDoctors: number;
  topDoctors: TopDoctor[];
}

interface TopDoctor {
  doctorId: number;
  doctorName: string;
  visitCount: number;
}

interface VisitHistory {
  visitId: number;
  visitDate: Date;
  status: VisitStatus;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  doctorName: string;
  services: VisitServiceItem[];
}

interface VisitServiceItem {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
  total: number;
}

interface PaymentHistory {
  paymentId: number;
  paymentDate: Date;
  amount: number;
  paymentType: PaymentType;
  description: string | null;
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
Client, Visit,     Aggregate,      Cache Store
Payment,           Calculate       (15 min TTL)
ClientPaid         Metrics
```

---

## 3. API SPECIFIKATSIYASI

### 3.1 Endpoint'lar Ro'yxati

| # | Method | Endpoint | Auth | Rol | Tavsif |
|---|--------|----------|------|-----|--------|
| 1 | GET | `/api/v1/reports/clients/:clientId` | ✅ JWT | Admin, Doctor (o'z mijozlari), Accountant | Bitta mijoz hisobotini olish |
| 2 | GET | `/api/v1/reports/clients` | ✅ JWT | Admin, Accountant | Mijozlar ro'yxati hisoboti |
| 3 | GET | `/api/v1/reports/clients/segmentation` | ✅ JWT | Admin, Accountant | Mijoz segmentatsiyasi |
| 4 | POST | `/api/v1/reports/clients/export` | ✅ JWT | Admin, Accountant | Mijoz hisoboti export (Excel/PDF) |

---

### 3.2 GET /api/v1/reports/clients/:clientId

**Tavsif:** Bitta mijoz hisobotini olish (Admin, Doctor - o'z mijozlari, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Param | Tip | Majburiy | Tavsif |
|-------|-----|----------|--------|
| `clientId` | number | ✅ | Mijoz ID |

**Request Example:**
```http
GET /api/v1/reports/clients/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "clientId": 1,
    "clientInfo": {
      "fullName": "John Doe",
      "phone": "+998901234567",
      "gender": "MALE",
      "dateOfBirth": "1990-01-01",
      "region": "Toshkent viloyati",
      "district": "Mirobod tumani",
      "address": "Toshkent shahar",
      "group": "VIP",
      "source": "Instagram",
      "registeredAt": "2024-01-01T10:00:00.000Z",
      "lastVisitAt": "2024-01-15T10:00:00.000Z"
    },
    "visitStats": {
      "totalVisits": 15,
      "completedVisits": 14,
      "cancelledVisits": 1,
      "noShowVisits": 0,
      "firstVisitDate": "2024-01-01T10:00:00.000Z",
      "lastVisitDate": "2024-01-15T10:00:00.000Z",
      "averageVisitsPerMonth": 5.0
    },
    "financialStats": {
      "totalSpent": 4500000,
      "totalPaid": 4000000,
      "totalDebt": 500000,
      "totalPrepaid": 200000,
      "averageCheck": 300000,
      "lastPaymentDate": "2024-01-15T12:00:00.000Z"
    },
    "serviceStats": {
      "totalServices": 30,
      "topServices": [
        {
          "serviceId": 1,
          "serviceName": "Terapevt ko'rigi",
          "count": 10,
          "totalAmount": 3000000
        }
      ]
    },
    "doctorStats": {
      "totalDoctors": 3,
      "topDoctors": [
        {
          "doctorId": 2,
          "doctorName": "Dr. John Smith",
          "visitCount": 10
        }
      ]
    },
    "visitHistory": [
      {
        "visitId": 1,
        "visitDate": "2024-01-15T10:00:00.000Z",
        "status": "COMPLETED",
        "totalAmount": 300000,
        "paidAmount": 300000,
        "debtAmount": 0,
        "doctorName": "Dr. John Smith",
        "services": [
          {
            "serviceId": 1,
            "serviceName": "Terapevt ko'rigi",
            "price": 100000,
            "quantity": 1,
            "total": 100000
          }
        ]
      }
    ],
    "paymentHistory": [
      {
        "paymentId": 1,
        "paymentDate": "2024-01-15T12:00:00.000Z",
        "amount": 300000,
        "paymentType": "INCOME",
        "description": "Naqd to'lov"
      }
    ]
  },
  "generatedAt": "2024-02-01T10:00:00.000Z",
  "cached": true
}
```

**Service Layer Implementation:**
```typescript
// client-report.service.ts
async getClientReport(
  clientId: number,
  currentUserId: number,
  currentUserRole: string
): Promise<ClientReport> {
  // 1. RBAC tekshiruvi (Reference: Klinika.md 6.1)
  if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
    // Doctor faqat o'z mijozlarini ko'ra oladi
    if (currentUserRole === 'Doctor') {
      const hasVisit = await this.prisma.visit.findFirst({
        where: {
          client_id: clientId,
          doctor_id: currentUserId,
          deleted_at: null
        }
      });
      
      if (!hasVisit) {
        throw new ForbiddenException('CR_001');
      }
    } else {
      throw new ForbiddenException('CR_001');
    }
  }

  // 2. Mijoz ma'lumotlarini olish
  const client = await this.prisma.client.findUnique({
    where: { id: clientId },
    include: {
      group: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      region: { select: { id: true, name: true } },
      district: { select: { id: true, name: true } }
    }
  });

  if (!client || client.deleted_at) {
    throw new NotFoundException('CR_002');
  }

  // 3. Visit statistikasini hisoblash
  const visitStats = await this.calculateVisitStats(clientId);

  // 4. Moliyaviy statistikasini hisoblash
  const financialStats = await this.calculateFinancialStats(clientId);

  // 5. Xizmat statistikasini hisoblash
  const serviceStats = await this.calculateServiceStats(clientId);

  // 6. Shifokor statistikasini hisoblash
  const doctorStats = await this.calculateDoctorStats(clientId);

  // 7. Visit tarixini olish
  const visitHistory = await this.getVisitHistory(clientId);

  // 8. To'lov tarixini olish
  const paymentHistory = await this.getPaymentHistory(clientId);

  // 9. Mijoz ma'lumotlarini formatlash
  const clientInfo: ClientInfo = {
    fullName: client.full_name,
    phone: client.phone,
    gender: client.gender,
    dateOfBirth: client.date_of_birth,
    region: client.region?.name || null,
    district: client.district?.name || null,
    address: client.address,
    group: client.group?.name || null,
    source: client.source?.name || null,
    registeredAt: client.created_at,
    lastVisitAt: visitStats.lastVisitDate
  };

  return {
    clientId,
    clientInfo,
    visitStats,
    financialStats,
    serviceStats,
    doctorStats,
    visitHistory,
    paymentHistory
  };
}

// Visit statistikasini hisoblash
private async calculateVisitStats(clientId: number): Promise<VisitStats> {
  const visits = await this.prisma.visit.findMany({
    where: {
      client_id: clientId,
      deleted_at: null
    },
    select: {
      id: true,
      status: true,
      visit_date: true,
      created_at: true
    },
    orderBy: {
      visit_date: 'asc'
    }
  });

  const totalVisits = visits.length;
  const completedVisits = visits.filter(v => 
    v.status === 'COMPLETED' || v.status === 'DONE'
  ).length;
  const cancelledVisits = visits.filter(v => v.status === 'CANCELLED').length;
  const noShowVisits = visits.filter(v => v.status === 'NO_SHOW').length;

  const firstVisitDate = visits.length > 0 ? visits[0].visit_date : null;
  const lastVisitDate = visits.length > 0 ? visits[visits.length - 1].visit_date : null;

  // O'rtacha visitlar soni oyiga
  let averageVisitsPerMonth = 0;
  if (firstVisitDate && lastVisitDate) {
    const monthsDiff = Math.max(1, Math.ceil(
      (lastVisitDate.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));
    averageVisitsPerMonth = Math.round((totalVisits / monthsDiff) * 10) / 10;
  }

  return {
    totalVisits,
    completedVisits,
    cancelledVisits,
    noShowVisits,
    firstVisitDate,
    lastVisitDate,
    averageVisitsPerMonth
  };
}

// Moliyaviy statistikasini hisoblash
private async calculateFinancialStats(clientId: number): Promise<FinancialStats> {
  // Visitlardan jami summa
  const visitStats = await this.prisma.visit.aggregate({
    where: {
      client_id: clientId,
      deleted_at: null
    },
    _sum: {
      total_amount: true,
      paid_amount: true,
      debt_amount: true
    },
    _count: {
      id: true
    }
  });

  // ClientPaid yig'indisi
  const prepaidStats = await this.prisma.clientPaid.aggregate({
    where: {
      client_id: clientId,
      deleted_at: null
    },
    _sum: {
      amount: true
    }
  });

  // Payment yig'indisi
  const paymentStats = await this.prisma.payment.aggregate({
    where: {
      client_id: clientId,
      payment_type: 'INCOME',
      deleted_at: null
    },
    _sum: {
      amount: true
    },
    _max: {
      payment_date: true
    }
  });

  const totalSpent = visitStats._sum.total_amount || 0;
  const totalPaid = (visitStats._sum.paid_amount || 0) + (paymentStats._sum.amount || 0);
  const totalDebt = visitStats._sum.debt_amount || 0;
  const totalPrepaid = prepaidStats._sum.amount || 0;
  const averageCheck = visitStats._count.id > 0
    ? Math.round((totalSpent / visitStats._count.id) * 100) / 100
    : 0;

  return {
    totalSpent,
    totalPaid,
    totalDebt,
    totalPrepaid,
    averageCheck,
    lastPaymentDate: paymentStats._max.payment_date
  };
}
```

---

### 3.3 GET /api/v1/reports/clients

**Tavsif:** Mijozlar ro'yxati hisoboti (Admin, Accountant)

**Query Parameters:**
| Param | Tip | Majburiy | Default | Tavsif |
|-------|-----|----------|---------|--------|
| `start_date` | date | ✅ | - | Boshlanish sanasi (YYYY-MM-DD) |
| `end_date` | date | ✅ | - | Tugash sanasi (YYYY-MM-DD) |
| `group_id` | number | ❌ | - | Guruh bo'yicha filter |
| `source_id` | number | ❌ | - | Manba bo'yicha filter |
| `has_debt` | boolean | ❌ | false | Qarzдор mijozlar |
| `min_balance` | number | ❌ | - | Minimal balance |
| `page` | number | ❌ | 1 | Sahifa raqami |
| `limit` | number | ❌ | 20 | Sahifadagi elementlar soni |

**Request Example:**
```http
GET /api/v1/reports/clients?start_date=2024-01-01&end_date=2024-01-31&group_id=1&has_debt=true
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
    "totalClients": 150,
    "activeClients": 140,
    "newClients": 25,
    "clientsWithDebt": 30,
    "clients": [
      {
        "clientId": 1,
        "fullName": "John Doe",
        "phone": "+998901234567",
        "group": "VIP",
        "source": "Instagram",
        "totalVisits": 15,
        "lastVisitDate": "2024-01-15T10:00:00.000Z",
        "totalSpent": 4500000,
        "totalDebt": 500000,
        "balance": 200000,
        "registeredAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Service Layer Implementation:**
```typescript
async getClientListReport(
  startDate: Date,
  endDate: Date,
  filters: ClientListFilters,
  page: number = 1,
  limit: number = 20
): Promise<ClientListReport> {
  // 1. Mijozlarni olish
  const clients = await this.prisma.client.findMany({
    where: {
      deleted_at: null,
      created_at: {
        gte: startDate,
        lt: endDate
      },
      ...(filters.group_id && { group_id: filters.group_id }),
      ...(filters.source_id && { source_id: filters.source_id }),
      ...(filters.min_balance !== undefined && {
        balance: { gte: filters.min_balance }
      }),
      ...(filters.has_debt && {
        visits: {
          some: {
            debt_amount: { gt: 0 },
            deleted_at: null
          }
        }
      })
    },
    include: {
      group: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      _count: {
        select: {
          visits: {
            where: {
              deleted_at: null,
              visit_date: {
                gte: startDate,
                lt: endDate
              }
            }
          }
        }
      },
      visits: {
        where: {
          deleted_at: null
        },
        orderBy: {
          visit_date: 'desc'
        },
        take: 1,
        select: {
          visit_date: true
        }
      }
    },
    skip: (page - 1) * limit,
    take: limit
  });

  // 2. Moliyaviy ma'lumotlarni hisoblash
  const clientsWithFinancials = await Promise.all(
    clients.map(async (client) => {
      const financialStats = await this.calculateFinancialStats(client.id);
      
      return {
        clientId: client.id,
        fullName: client.full_name,
        phone: client.phone,
        group: client.group?.name || null,
        source: client.source?.name || null,
        totalVisits: client._count.visits,
        lastVisitDate: client.visits[0]?.visit_date || null,
        totalSpent: financialStats.totalSpent,
        totalDebt: financialStats.totalDebt,
        balance: client.balance.toNumber(),
        registeredAt: client.created_at
      };
    })
  );

  // 3. Statistika hisoblash
  const totalClients = await this.prisma.client.count({
    where: {
      deleted_at: null,
      created_at: {
        gte: startDate,
        lt: endDate
      }
    }
  });

  const activeClients = await this.prisma.client.count({
    where: {
      deleted_at: null,
      status: 'ACTIVE',
      created_at: {
        gte: startDate,
        lt: endDate
      }
    }
  });

  const newClients = clients.length;
  const clientsWithDebt = clientsWithFinancials.filter(c => c.totalDebt > 0).length;

  return {
    period: {
      from: startDate,
      to: endDate
    },
    totalClients,
    activeClients,
    newClients,
    clientsWithDebt,
    clients: clientsWithFinancials,
    pagination: {
      page,
      limit,
      total: totalClients,
      totalPages: Math.ceil(totalClients / limit),
      hasNextPage: page * limit < totalClients,
      hasPrevPage: page > 1
    }
  };
}
```

---

### 3.4 GET /api/v1/reports/clients/segmentation

**Tavsif:** Mijoz segmentatsiyasi (Admin, Accountant)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalClients": 500,
    "byGroup": [
      {
        "groupId": 1,
        "groupName": "VIP",
        "count": 50,
        "percentage": 10.0
      },
      {
        "groupId": 2,
        "groupName": "Oddiy",
        "count": 400,
        "percentage": 80.0
      }
    ],
    "bySource": [
      {
        "sourceId": 1,
        "sourceName": "Instagram",
        "count": 200,
        "percentage": 40.0
      },
      {
        "sourceId": 2,
        "sourceName": "Telegram",
        "count": 150,
        "percentage": 30.0
      }
    ],
    "byLoyalty": [
      {
        "name": "Yangi (0-3 oy)",
        "count": 100,
        "percentage": 20.0
      },
      {
        "name": "Doimiy (3-12 oy)",
        "count": 200,
        "percentage": 40.0
      },
      {
        "name": "Sodiq (1+ yil)",
        "count": 150,
        "percentage": 30.0
      },
      {
        "name": "Yo'qolgan (6+ oy)",
        "count": 50,
        "percentage": 10.0
      }
    ]
  }
}
```

**Service Layer Implementation:**
```typescript
async getClientSegmentation(): Promise<ClientSegmentation> {
  // 1. Barcha aktiv mijozlarni olish
  const clients = await this.prisma.client.findMany({
    where: {
      deleted_at: null,
      status: 'ACTIVE'
    },
    select: {
      id: true,
      full_name: true,
      group_id: true,
      source_id: true,
      created_at: true
    }
  });

  // 2. Guruh bo'yicha segmentatsiya
  const byGroup = await this.prisma.client.groupBy({
    by: ['group_id'],
    _count: {
      id: true
    },
    where: {
      deleted_at: null,
      status: 'ACTIVE',
      group_id: { not: null }
    }
  });

  // 3. Manba bo'yicha segmentatsiya
  const bySource = await this.prisma.client.groupBy({
    by: ['source_id'],
    _count: {
      id: true
    },
    where: {
      deleted_at: null,
      status: 'ACTIVE',
      source_id: { not: null }
    }
  });

  // 4. Loyalitet darajasi bo'yicha segmentatsiya
  const byLoyalty = await this.calculateLoyaltySegments(clients);

  // 5. Guruh nomlarini olish
  const groupDetails = await Promise.all(
    byGroup.map(async (item) => {
      const group = await this.prisma.clientGroup.findUnique({
        where: { id: item.group_id! },
        select: { id: true, name: true }
      });

      return {
        groupId: item.group_id!,
        groupName: group?.name || 'Noma\'lum',
        count: item._count.id,
        percentage: Math.round((item._count.id / clients.length) * 100 * 10) / 10
      };
    })
  );

  // 6. Manba nomlarini olish
  const sourceDetails = await Promise.all(
    bySource.map(async (item) => {
      const source = await this.prisma.source.findUnique({
        where: { id: item.source_id! },
        select: { id: true, name: true }
      });

      return {
        sourceId: item.source_id!,
        sourceName: source?.name || 'Noma\'lum',
        count: item._count.id,
        percentage: Math.round((item._count.id / clients.length) * 100 * 10) / 10
      };
    })
  );

  return {
    totalClients: clients.length,
    byGroup: groupDetails,
    bySource: sourceDetails,
    byLoyalty
  };
}

// Loyalitet segmentlarini hisoblash
private async calculateLoyaltySegments(clients: Client[]): Promise<LoyaltySegment[]> {
  const segments: LoyaltySegment[] = [
    { name: 'Yangi (0-3 oy)', count: 0, percentage: 0 },
    { name: 'Doimiy (3-12 oy)', count: 0, percentage: 0 },
    { name: 'Sodiq (1+ yil)', count: 0, percentage: 0 },
    { name: 'Yo'qolgan (6+ oy)', count: 0, percentage: 0 }
  ];

  const now = new Date();

  for (const client of clients) {
    // Oxirgi visitni olish
    const lastVisit = await this.prisma.visit.findFirst({
      where: {
        client_id: client.id,
        deleted_at: null
      },
      orderBy: {
        visit_date: 'desc'
      },
      select: {
        visit_date: true
      }
    });

    const monthsSinceLastVisit = lastVisit
      ? Math.floor((now.getTime() - lastVisit.visit_date.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 999;

    const monthsSinceRegistration = Math.floor(
      (now.getTime() - client.created_at.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsSinceLastVisit > 6) {
      segments[3].count++;
    } else if (monthsSinceRegistration <= 3) {
      segments[0].count++;
    } else if (monthsSinceRegistration <= 12) {
      segments[1].count++;
    } else {
      segments[2].count++;
    }
  }

  // Percentages hisoblash
  segments.forEach(segment => {
    segment.percentage = Math.round((segment.count / clients.length) * 100 * 10) / 10;
  });

  return segments;
}
```

---

### 3.5 POST /api/v1/reports/clients/export

**Tavsif:** Mijoz hisobotini export qilish (Excel/PDF) (Admin, Accountant)

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface ExportClientReportDto {
  clientId?: number;    // Mijoz ID (agar bitta mijoz bo'lsa)
  start_date?: Date;    // Boshlanish sanasi (ro'yxat uchun)
  end_date?: Date;      // Tugash sanasi (ro'yxat uchun)
  format: 'excel' | 'pdf';  // Export formati
  includeHistory?: boolean; // Tarixni qo'shish
}
```

**Request Body Example:**
```json
{
  "clientId": 1,
  "format": "excel",
  "includeHistory": true
}
```

**Response:** File Download
- Excel: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- PDF: `application/pdf`

**Service Layer Implementation:**
```typescript
async exportClientReport(exportDto: ExportClientReportDto, userId: number): Promise<Buffer> {
  // 1. Hisobot ma'lumotlarini olish
  let report: any;
  
  if (exportDto.clientId) {
    // Bitta mijoz hisoboti
    report = await this.getClientReport(exportDto.clientId, userId, 'Admin');
  } else {
    // Mijozlar ro'yxati
    report = await this.getClientListReport(
      exportDto.start_date!,
      exportDto.end_date!,
      {},
      1,
      100
    );
  }
  
  // 2. Formatga qarab export qilish
  if (exportDto.format === 'excel') {
    return this.generateExcel(report, exportDto.includeHistory);
  } else if (exportDto.format === 'pdf') {
    return this.generatePDF(report, exportDto.includeHistory);
  }
  
  throw new BadRequestException('CR_006');
}

// Excel generatsiya
private async generateExcel(report: any, includeHistory: boolean): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.properties.created = new Date();
  workbook.properties.creator = 'Klinika CRM';
  
  if (report.clientInfo) {
    // Bitta mijoz hisoboti
    const summarySheet = workbook.addWorksheet('Umumiy');
    summarySheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 }
    ];
    summarySheet.addRows([
      { metric: 'Mijoz', value: report.clientInfo.fullName },
      { metric: 'Telefon', value: report.clientInfo.phone },
      { metric: 'Jami Visitlar', value: report.visitStats.totalVisits },
      { metric: 'Jami Sarflangan', value: report.financialStats.totalSpent },
      { metric: 'Jami Qarz', value: report.financialStats.totalDebt },
      { metric: 'O\'rtacha Check', value: report.financialStats.averageCheck }
    ]);
    
    if (includeHistory) {
      const visitSheet = workbook.addWorksheet('Visitlar');
      visitSheet.columns = [
        { header: 'Sana', key: 'date', width: 20 },
        { header: 'Shifokor', key: 'doctor', width: 25 },
        { header: 'Summa', key: 'amount', width: 15 },
        { header: 'Status', key: 'status', width: 15 }
      ];
      visitSheet.addRows(report.visitHistory.map(v => ({
        date: v.visitDate,
        doctor: v.doctorName,
        amount: v.totalAmount,
        status: v.status
      })));
    }
  }
  
  // Buffer ga convert
  return await workbook.xlsx.writeBuffer();
}
```

---

## 4. VALIDATSIYA QOIDALARI

### 4.1 Class Validator DTO

```typescript
// get-client-report.dto.ts
import {
  IsInt,
  Min,
  IsNotEmpty
} from 'class-validator';

export class GetClientReportDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  client_id: number;
}

// get-client-list.dto.ts
import {
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean
} from 'class-validator';

export class GetClientListDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  group_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  source_id?: number;

  @IsOptional()
  @IsBoolean()
  has_debt?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// export-client-report.dto.ts
import { IsEnum } from 'class-validator';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf'
}

export class ExportClientReportDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  clientId?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean;
}
```

### 4.2 Validatsiya Matritsasi

| Maydon | Qoida | Xatolik Kodi | Xabar |
|--------|-------|--------------|-------|
| `client_id` | IsInt | CR_002 | Mijoz ID raqam bo'lishi kerak |
| `client_id` | Min 1 | CR_002 | Mijoz ID musbat bo'lishi kerak |
| `client_id` | Must Exist | CR_002 | Mijoz topilmadi |
| `start_date` | IsDateString | CR_003 | Sana formati noto'g'ri |
| `end_date` | IsDateString | CR_003 | Sana formati noto'g'ri |
| `end_date` | >= start_date | CR_003 | Tugash sana boshlanish sanadan keyin bo'lishi kerak |
| `format` | Enum | CR_006 | excel/pdf tanlang |
| `page` | Min 1 | CR_004 | Sahifa 1 dan boshlanishi kerak |
| `limit` | Min 1, Max 100 | CR_005 | 1-100 oralig'ida |

---

## 5. XATOLIKLAR VA HANDLING

### 5.1 Xatoliklar Jadvali

| Kod | HTTP Status | Xabar | Sabab | Yechim |
|-----|-------------|-------|-------|--------|
| `CR_001` | 403 Forbidden | Ruxsat yo'q | Insufficient permissions | Rol tekshirilsin (Reference: `Klinika.md` 6.1) |
| `CR_002` | 404 Not Found | Mijoz topilmadi | Client ID not exists | Client ID ni tekshiring |
| `CR_003` | 400 Bad Request | Sana formati noto'g'ri | Invalid date format | YYYY-MM-DD format kiriting |
| `CR_004` | 400 Bad Request | Sahifa noto'g'ri | Invalid page | 1 dan boshlang |
| `CR_005` | 400 Bad Request | Limit noto'g'ri | Invalid limit | 1-100 oralig'ida |
| `CR_006` | 400 Bad Request | Export formati noto'g'ri | Invalid format | excel/pdf tanlang |
| `CR_007` | 500 Internal Server Error | Hisobot yaratishda xatolik | Calculation error | Admin bilan bog'laning |

### 5.2 Exception Filter

```typescript
// client-report-exception.filter.ts
@Catch()
export class ClientReportExceptionFilter implements ExceptionFilter {
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
    if (exception instanceof ForbiddenException) return 'CR_001';
    if (exception instanceof NotFoundException) return 'CR_002';
    if (exception instanceof BadRequestException) return 'CR_003';
    return 'CR_007';
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
| GET /clients/:id | ✅ | ✅ (o'zi) | ❌ | ✅ | ✅ |
| GET /clients | ✅ | ❌ | ❌ | ✅ | ✅ |
| GET /clients/segmentation | ✅ | ❌ | ❌ | ❌ | ✅ |
| POST /clients/export | ✅ | ❌ | ❌ | ❌ | ✅ |

### 6.3 Audit (Reference: `Klinika.md` 5.2)
| Harakat | Log Qilinadi | Saqlash Muddati |
|--------|-------------|-----------------|
| Hisobot ko'rish | ✅ | 5 yil |
| Export qilish | ✅ | 5 yil |
| Cache access | ✅ | 30 kun |

### 6.4 Ma'lumotlar Xavfsizligi (Reference: `Klinika.md` 8.1)
- ✅ Doctor faqat o'z mijozlarini ko'ra oladi
- ✅ Moliyaviy ma'lumotlar faqat Admin/Accountant uchun
- ✅ Export fayllar vaqtinchalik saqlanadi (24 soat)
- ✅ Mijoz ma'lumotlari konfidensial

---

## 7. CACHE STRATEGY (Reference: `Klinika.md` 9.1)

### 7.1 Caching Configuration

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| Client Report | Redis | 15 daqiqa | Visit create/update/delete |
| Client List | Redis | 30 daqiqa | Client create/update |
| Client Segmentation | Redis | 1 soat | Client create/update/delete |
| Export File | Redis | 24 soat | Automatic expiry |

### 7.2 Cache Implementation

```typescript
// Cache service
async getClientReport(clientId: number): Promise<ClientReport> {
  const cacheKey = `client_report:${clientId}`;
  
  // 1. Cache dan olish
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    this.logger.debug(`Cache hit for ${cacheKey}`);
    return cached;
  }
  
  this.logger.debug(`Cache miss for ${cacheKey}`);
  
  // 2. DB dan hisoblash
  const report = await this.calculateClientReport(clientId);
  
  // 3. Cache ga saqlash (15 daqiqa)
  await this.cacheService.set(cacheKey, report, { ttl: 900 });
  
  return report;
}

// Cache invalidation
async invalidateClientReportCache(clientId: number): Promise<void> {
  const cacheKey = `client_report:${clientId}`;
  await this.cacheService.del(cacheKey);
  
  this.logger.log(`Cache invalidated for ${cacheKey}`);
}

// Event-based invalidation
@Events('visit.created')
async onVisitCreated(event: VisitCreatedEvent) {
  if (event.clientId) {
    await this.invalidateClientReportCache(event.clientId);
  }
}

@Events('visit.completed')
async onVisitCompleted(event: VisitCompletedEvent) {
  if (event.clientId) {
    await this.invalidateClientReportCache(event.clientId);
  }
}

@Events('payment.created')
async onPaymentCreated(event: PaymentCreatedEvent) {
  if (event.clientId) {
    await this.invalidateClientReportCache(event.clientId);
  }
}
```

---

## 8. PERFORMANCE OPTIMALLASHTIRISH (Reference: `Klinika.md` 9.1)

### 8.1 Database Query Optimization

```typescript
// ✅ Yaxshi - Parallel queries
const [visitStats, financialStats, serviceStats] = await Promise.all([
  this.calculateVisitStats(clientId),
  this.calculateFinancialStats(clientId),
  this.calculateServiceStats(clientId)
]);

// ✅ Yaxshi - Faqat kerakli maydonlar
const visits = await this.prisma.visit.findMany({
  select: { 
    id: true, 
    status: true, 
    total_amount: true,
    visit_date: true
  },
  where: { 
    client_id: clientId,
    deleted_at: null
  },
  orderBy: {
    visit_date: 'desc'
  },
  take: 20
});

// ✅ Yaxshi - Indexlardan foydalanish
const visits = await this.prisma.visit.findMany({
  where: { 
    client_id: clientId,
    deleted_at: null
  }
  // Uses index: @@index([client_id, visit_date])
});

// ❌ Yomon - Barcha maydonlar
const visits = await this.prisma.visit.findMany({
  where: { 
    client_id: clientId
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
// Client
@@index([client_id])              // Mijoz filter uchun
@@index([created_at])             // Ro'yxatdan o'tgan sana uchun
@@index([status])                 // Status filter uchun
@@index([phone])                  // Telefon qidiruv uchun
@@index([group_id])               // Guruh filter uchun
@@index([source_id])              // Manba filter uchun

// Visit
@@index([client_id])              // Mijoz filter uchun (eng muhim)
@@index([visit_date])             // Sana filter uchun
@@index([client_id, visit_date])  // Mijoz va sana uchun (qo'shma)
@@index([status, visit_date])     // Status va sana uchun

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
// client-report.service.spec.ts
describe('ClientReportService', () => {
  let service: ClientReportService;
  let prisma: PrismaService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientReportService, PrismaService, CacheService],
    }).compile();

    service = module.get<ClientReportService>(ClientReportService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
  });

  describe('getClientReport', () => {
    it('should return client report from cache', async () => {
      const clientId = 1;
      const cachedReport = { clientInfo: { fullName: 'John Doe' } };
      
      cacheService.get = jest.fn().mockResolvedValue(cachedReport);
      
      const result = await service.getClientReport(clientId, 1, 'Admin');
      
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate client report if cache miss', async () => {
      const clientId = 1;
      
      cacheService.get = jest.fn().mockResolvedValue(null);
      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.findMany = jest.fn().mockResolvedValue([]);
      cacheService.set = jest.fn().mockResolvedValue(null);
      
      const result = await service.getClientReport(clientId, 1, 'Admin');
      
      expect(result.cached).toBe(false);
      expect(prisma.visit.findMany).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('client_report'),
        expect.any(Object),
        { ttl: 900 }
      );
    });

    it('should throw ForbiddenException for doctor viewing other client', async () => {
      const clientId = 1;
      
      prisma.client.findUnique = jest.fn().mockResolvedValue({ id: 1, deleted_at: null });
      prisma.visit.findFirst = jest.fn().mockResolvedValue(null);
      
      await expect(
        service.getClientReport(clientId, 2, 'Doctor')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getClientSegmentation', () => {
    it('should return client segmentation', async () => {
      prisma.client.findMany = jest.fn().mockResolvedValue([
        { id: 1, group_id: 1, source_id: 1, created_at: new Date() }
      ]);
      prisma.client.groupBy = jest.fn().mockResolvedValue([]);
      
      const result = await service.getClientSegmentation();
      
      expect(result.totalClients).toBeGreaterThan(0);
      expect(result.byGroup).toBeDefined();
      expect(result.bySource).toBeDefined();
      expect(result.byLoyalty).toBeDefined();
    });
  });

  describe('exportClientReport', () => {
    it('should generate Excel export', async () => {
      const dto: ExportClientReportDto = {
        clientId: 1,
        format: 'excel',
        includeHistory: true
      };
      
      service.getClientReport = jest.fn().mockResolvedValue({});
      
      const result = await service.exportClientReport(dto, 1);
      
      expect(result).toBeInstanceOf(Buffer);
    });
  });
});
```

---

## 10. MIGRATSIYA VA DEPLOYMENT

### 10.1 Prisma Migration

Client Report alohida jadval emas, shuning uchun migration kerak emas.

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
CLIENT_REPORT_CACHE_TTL=900  # 15 daqiqa
CLIENT_LIST_CACHE_TTL=1800  # 30 daqiqa
CLIENT_SEGMENTATION_CACHE_TTL=3600  # 1 soat
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
- [ ] Large dataset test qilindi (10000+ clients)

---

## 11. BOG'LIQ HUJJATLAR

| Hujjat | Link | Status |
|--------|------|--------|
| Flow Document | `22-client-report-management.md` | ✅ Tasdiqlandi |
| Prisma Schema | `klinika_prisma.txt` | ✅ Tasdiqlandi |
| Tech Spec | `Klinika.md` | ✅ Tasdiqlandi |
| Client RFC | `RFC-009-client-management.md` | ✅ Tasdiqlandi |
| Visit RFC | `RFC-013-visit-management.md` | ✅ Tasdiqlandi |
| Payment RFC | `RFC-014-payment-management.md` | ✅ Tasdiqlandi |
| ClientPaid RFC | `RFC-015-client-paid-management.md` | ✅ Tasdiqlandi |
| Daily Report RFC | `RFC-019-daily-report-management.md` | ✅ Tasdiqlandi |
| Monthly Report RFC | `RFC-020-monthly-report-management.md` | ✅ Tasdiqlandi |
| Doctor Performance RFC | `RFC-021-doctor-performance-management.md` | ✅ Tasdiqlandi |
| Service Report RFC | `RFC-023-service-report-management.md` | ⏳ Keyingi |

---

## 12. QABUL QILISH MEZONLARI (ACCEPTANCE CRITERIA)

### 12.1 Functional Requirements

- [ ] Mijoz ma'lumotlari to'g'ri ko'rsatilishi
- [ ] Visit statistikasi to'g'ri hisoblanishi
- [ ] Moliyaviy ko'rsatkichlar to'g'ri hisoblanishi
- [ ] Xizmat statistikasi to'g'ri hisoblanishi
- [ ] Shifokor statistikasi to'g'ri hisoblanishi
- [ ] Visit tarixi to'g'ri ko'rsatilishi
- [ ] To'lov tarixi to'g'ri ko'rsatilishi
- [ ] Mijoz segmentatsiyasi to'g'ri ishlashi
- [ ] Cache strategiyasi ishlashi (15 daqiqa TTL)
- [ ] Export funksiyasi ishlashi (Excel/PDF)
- [ ] RBAC to'g'ri ishlashi (Doctor faqat o'zi) (Reference: `Klinika.md` 6.1)
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
| Automated client reports | 🟡 Medium | Phase 4 |
| Client satisfaction survey | 🟢 Low | Phase 4 |
| Client communication history | 🟢 Low | Phase 4 |
| Birthday/Anniversary reminders | 🟢 Low | Phase 4 |
| Client loyalty program | 🟡 Medium | Phase 4 |
| AI-powered insights | 🟢 Low | Phase 5 |
| Mobile app reports | 🟢 Low | Phase 4 |
| Client referral tracking | 🟢 Low | Phase 4 |

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
**Reference Documents:** `klinika_prisma.txt`, `Klinika.md` (Sections 3.2, 5.2, 6.1, 7.1, 7.2, 8.1, 9.1)

---