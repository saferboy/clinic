import { api } from './client';

export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';

export interface DashboardKPIs {
  totalVisits: number;
  completedVisits: number;
  totalRevenue: number;
  averageCheck: number;
  retentionRate: number;
  occupancyRate: number;
  debtRate: number;
  totalClients: number;
  newClients: number;
  totalDoctors: number;
}

export interface DashboardAlerts {
  scheduledVisits: number;
  debtClients: number;
  availableRooms: number;
  pendingPayments: number;
}

export interface VisitTrendPoint {
  date: string;
  count: number;
  revenue: number;
}

export interface DashboardMetrics {
  period: { from: string; to: string; type: string };
  kpis: DashboardKPIs;
  charts: { visitTrend: VisitTrendPoint[] };
  alerts: DashboardAlerts;
  lastUpdated: string;
}

export const dashboardApi = {
  getMetrics: (period: DashboardPeriod) =>
    api.get<any>(`/dashboard/metrics?period=${period}`, true),
};
