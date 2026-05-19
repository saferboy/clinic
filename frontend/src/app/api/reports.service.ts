import { api } from './client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ---- Daily ----
export interface DailyVisitStats {
  totalVisits: number;
  completedVisits: number;
  scheduledVisits: number;
  cancelledVisits: number;
  noShowVisits: number;
  inProgressVisits: number;
}
export interface DailyFinancialStats {
  totalIncome: number;
  totalPayment: number;
  totalPrepaid: number;
  averageCheck: number;
  totalDebt: number;
}
export interface DoctorLoadStat {
  doctorId: number;
  doctorName: string;
  visitCount: number;
  totalAmount: number;
  commission: number;
}
export interface RoomUsage {
  roomId: number;
  roomName: string;
  usageCount: number;
  totalMinutes: number;
}
export interface RoomOccupancyStats {
  totalRooms: number;
  usedRooms: number;
  occupancyRate: number;
  roomUsage: RoomUsage[];
}
export interface DailyReport {
  date: string;
  visitStats: DailyVisitStats;
  financialStats: DailyFinancialStats;
  doctorLoadStats: DoctorLoadStat[];
  roomOccupancyStats: RoomOccupancyStats;
  newClientStats: { totalNewClients: number; bySource: any[]; byGender: any[] };
}

// ---- Monthly ----
export interface MonthlyFinancialStats {
  totalIncome: number;
  totalPayment: number;
  totalPrepaid: number;
  totalOutcome: number;
  averageCheck: number;
  totalDebt: number;
  profit: number;
}
export interface MonthlyReport {
  month: number;
  year: number;
  visitStats: {
    totalVisits: number;
    completedVisits: number;
    cancelledVisits: number;
    noShowVisits: number;
    averageVisitsPerDay: number;
  };
  financialStats: MonthlyFinancialStats;
  doctorLoadStats: Array<DoctorLoadStat & { averagePerVisit: number }>;
  roomOccupancyStats: {
    totalRooms: number;
    totalUsage: number;
    averageOccupancyRate: number;
    roomUsage: Array<RoomUsage & { occupancyRate: number }>;
  };
  newClientStats: {
    totalNewClients: number;
    totalActiveClients: number;
    retentionRate: number;
    bySource: Array<{ sourceId: number; sourceName: string; count: number; percentage: number }>;
    byGender: Array<{ gender: string; count: number; percentage: number }>;
  };
  serviceStats: Array<{
    serviceId: number;
    serviceName: string;
    count: number;
    totalAmount: number;
    percentage: number;
    averagePrice: number;
  }>;
  debtStats: {
    totalDebt: number;
    overdueDebt: number;
    debtRate: number;
    topDebtors: Array<{ clientId: number; clientName: string; phone: string; debtAmount: number; daysOverdue: number }>;
    debtByAge: Array<{ age: string; amount: number; percentage: number }>;
  };
  comparison?: {
    previousMonth: number;
    previousYear: number;
    visitChange: { current: number; previous: number; change: number; changePercent: number };
    incomeChange: { current: number; previous: number; change: number; changePercent: number };
  };
}

// ---- Doctor Performance ----
export interface DoctorRanking {
  doctorId: number;
  doctorName: string;
  visitCount: number;
  totalRevenue: number;
  averagePerVisit: number;
  commission: number;
  rank: number;
}

// ---- Service Report ----
export interface ServiceReport {
  period: { from: string; to: string };
  summary: {
    totalServices: number;
    totalRevenue: number;
    averagePrice: number;
    averagePerDay: number;
    uniqueServices: number;
  };
  topServices: Array<{
    serviceId: number;
    serviceName: string;
    departmentName: string;
    count: number;
    revenue: number;
    percentage: number;
    averagePrice: number;
  }>;
  byDepartment: Array<{ departmentId: number; departmentName: string; serviceCount: number; revenue: number; percentage: number }>;
}

// ---- Client Report ----
export interface ClientListReport {
  data: Array<{
    clientId: number;
    clientName: string;
    phone: string;
    totalVisits: number;
    totalSpent: number;
    lastVisitDate: string | null;
    balance: number;
    status: string;
  }>;
  total: number;
}

// ---- Debt Report ----
export interface DebtReport {
  period: { from: string; to: string };
  summary: {
    totalDebt: number;
    totalClients: number;
    averageDebt: number;
    debtRate: number;
    overdueDebt: number;
    overdueClients: number;
  };
  aging: Array<{ ageRange: string; amount: number; count: number; percentage: number }>;
  topDebtors: Array<{ clientId: number; clientName: string; phone: string; totalDebt: number; visitCount: number; daysOverdue: number }>;
  trendData: Array<{ date: string; debtAmount: number; collectedAmount: number; netDebt: number }>;
  collectionStats: { totalCollected: number; collectionRate: number };
}

// ---- Referral/Marketing Report ----
export interface ReferralReport {
  period: { from: string; to: string };
  summary: { totalReferrals: number; totalVisits: number; totalClients: number; totalRevenue: number };
  referrals: Array<{
    referralId: number;
    referralName: string;
    phone: string;
    clientCount: number;
    visitCount: number;
    totalRevenue: number;
    averageRevenue: number;
  }>;
  sourceStats: Array<{ sourceId: number; sourceName: string; clientCount: number; percentage: number }>;
}

// ---- Birthday Report ----
export interface BirthdayReport {
  daysAhead: number;
  total: number;
  todayCount: number;
  thisWeekCount: number;
  clients: Array<{
    clientId: number;
    fullName: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    daysUntilBirthday: number;
    turnsAge: number;
    birthdayDate: string;
  }>;
}

function defaultRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const end = now.toISOString().split('T')[0];
  return { start, end };
}

export const reportsApi = {
  getDaily: (date?: string) => {
    const d = date || new Date().toISOString().split('T')[0];
    return api.get<ApiResponse<DailyReport>>(`/reports/daily?date=${d}`, true);
  },

  getMonthly: (month?: number, year?: number, compare = false) => {
    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();
    return api.get<ApiResponse<MonthlyReport>>(`/reports/monthly?month=${m}&year=${y}&compare=${compare}`, true);
  },

  getDoctorRanking: (startDate?: string, endDate?: string, limit = 20) => {
    const r = defaultRange();
    const s = startDate || r.start;
    const e = endDate || r.end;
    return api.get<ApiResponse<{ rankings: DoctorRanking[] }>>(`/reports/doctor-performance/ranking?start_date=${s}&end_date=${e}&limit=${limit}`, true);
  },

  getServiceReport: (startDate?: string, endDate?: string) => {
    const r = defaultRange();
    const s = startDate || r.start;
    const e = endDate || r.end;
    return api.get<ApiResponse<ServiceReport>>(`/reports/services?start_date=${s}&end_date=${e}`, true);
  },

  getClientList: (startDate?: string, endDate?: string, page = 1, limit = 20) => {
    const r = defaultRange();
    const s = startDate || r.start;
    const e = endDate || r.end;
    return api.get<ApiResponse<ClientListReport>>(`/reports/clients?start_date=${s}&end_date=${e}&page=${page}&limit=${limit}`, true);
  },

  getDebtReport: (startDate?: string, endDate?: string) => {
    const r = defaultRange();
    const s = startDate || r.start;
    const e = endDate || r.end;
    return api.get<ApiResponse<DebtReport>>(`/reports/debt?start_date=${s}&end_date=${e}`, true);
  },

  getReferralReport: (startDate?: string, endDate?: string) => {
    const r = defaultRange();
    const s = startDate || r.start;
    const e = endDate || r.end;
    return api.get<ApiResponse<ReferralReport>>(`/reports/referrals?start_date=${s}&end_date=${e}`, true);
  },

  getBirthdayReport: (daysAhead = 30) =>
    api.get<ApiResponse<BirthdayReport>>(`/reports/birthdays?days_ahead=${daysAhead}`, true),

  exportDaily: (date: string) =>
    api.post<Blob>(`/reports/daily/export`, { date, format: 'excel', includeDetails: true }, true),

  exportMonthly: (month: number, year: number) =>
    api.post<Blob>(`/reports/monthly/export`, { month, year, format: 'excel' }, true),

  exportDebt: (startDate: string, endDate: string) =>
    api.post<Blob>(`/reports/debt/export`, { start_date: startDate, end_date: endDate, format: 'excel' }, true),
};
