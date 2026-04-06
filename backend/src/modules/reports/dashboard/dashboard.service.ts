import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetDashboardMetricsDto, DashboardPeriod } from './dto/get-dashboard-metrics.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics(dto: GetDashboardMetricsDto, currentUserId: number, currentUserRole: string) {
    const periodType = dto.period || DashboardPeriod.MONTH;
    const { from, to } = this.getDateRange(periodType, dto.from, dto.to);
    const filters = this.getRoleFilters(currentUserId, currentUserRole);

    const [kpis, charts, alerts] = await Promise.all([
      this.calculateKPIs(from, to, filters),
      this.calculateCharts(from, to, filters),
      this.calculateAlerts(from, filters),
    ]);

    return {
      period: { from, to, type: periodType },
      kpis,
      charts,
      alerts,
      lastUpdated: new Date(),
    };
  }

  private getDateRange(periodType: string, fromStr?: string, toStr?: string) {
    const now = new Date();
    let from = new Date();
    const to = now;

    switch (periodType) {
      case 'today':
        from.setHours(0, 0, 0, 0);
        break;
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        from = fromStr ? new Date(fromStr) : from;
        break;
    }

    return { from, to };
  }

  private getRoleFilters(userId: number, role: string) {
    const filters: any = {};
    if (role === 'Doctor') {
      filters.doctor_id = userId;
    }
    return filters;
  }

  private async calculateKPIs(from: Date, to: Date, filters: any) {
    const [visitStats, paymentStats, clientStats, roomStats, debtStats] = await Promise.all([
      this.getVisitStats(from, to, filters),
      this.getPaymentStats(from, to, filters),
      this.getClientStats(from, to, filters),
      this.getRoomStats(from, to, filters),
      this.getDebtStats(from, to, filters),
    ]);

    const averageCheck = visitStats.totalVisits > 0
      ? Math.round((visitStats.totalRevenue / visitStats.totalVisits) * 100) / 100
      : 0;

    const retentionRate = await this.calculateRetentionRate(from, to, filters);
    const occupancyRate = roomStats.totalRooms > 0
      ? Math.round((roomStats.occupiedRooms / roomStats.totalRooms) * 100 * 10) / 10
      : 0;

    const debtRate = visitStats.totalRevenue > 0
      ? Math.round((debtStats.totalDebt / visitStats.totalRevenue) * 100 * 10) / 10
      : 0;

    return {
      totalVisits: visitStats.totalVisits,
      completedVisits: visitStats.completedVisits,
      totalRevenue: paymentStats.totalRevenue,
      averageCheck,
      retentionRate,
      occupancyRate,
      debtRate,
      totalClients: clientStats.totalClients,
      newClients: clientStats.newClients,
      totalDoctors: clientStats.activeDoctors,
    };
  }

  private async getVisitStats(from: Date, to: Date, filters: any) {
    const totalVisits = await this.prisma.visit.count({
      where: { visit_date: { gte: from, lt: to }, deleted_at: null, ...filters },
    });

    const visitsByStatus = await this.prisma.visit.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { visit_date: { gte: from, lt: to }, deleted_at: null, ...filters },
    });

    const completedVisits = visitsByStatus
      .filter((v) => v.status === 'COMPLETED' || v.status === 'DONE')
      .reduce((sum, v) => sum + v._count.id, 0);

    const totalRevenue = (await this.prisma.visit.aggregate({
      where: { visit_date: { gte: from, lt: to }, deleted_at: null, ...filters },
      _sum: { total_amount: true },
    }))._sum.total_amount?.toNumber() || 0;

    return { totalVisits, completedVisits, totalRevenue };
  }

  private async getPaymentStats(from: Date, to: Date, filters: any) {
    const totalRevenue = (await this.prisma.payment.aggregate({
      where: { payment_date: { gte: from, lt: to }, payment_type: 'INCOME', deleted_at: null, ...filters },
      _sum: { amount: true },
    }))._sum.amount?.toNumber() || 0;

    return { totalRevenue };
  }

  private async getClientStats(from: Date, to: Date, filters: any) {
    const totalClients = await this.prisma.client.count({ where: { deleted_at: null, status: 'ACTIVE' } });
    const newClients = await this.prisma.client.count({
      where: { created_at: { gte: from, lt: to }, deleted_at: null, ...filters },
    });

    const activeDoctors = await this.prisma.user.count({
      where: { role: { name: 'Doctor' }, deleted_at: null },
    });

    return { totalClients, newClients, activeDoctors };
  }

  private async getRoomStats(from: Date, to: Date, filters: any) {
    const totalRooms = await this.prisma.room.count({ where: { record_status: 'ACTIVE', deleted_at: null } });
    const occupiedRooms = await this.prisma.visitRoom.count({
      where: { created_at: { gte: from, lt: to }, deleted_at: null },
    });

    return { totalRooms, occupiedRooms };
  }

  private async getDebtStats(from: Date, to: Date, filters: any) {
    const totalDebt = (await this.prisma.visit.aggregate({
      where: { visit_date: { gte: from, lt: to }, deleted_at: null, debt_amount: { gt: 0 }, ...filters },
      _sum: { debt_amount: true },
    }))._sum.debt_amount?.toNumber() || 0;

    return { totalDebt };
  }

  private async calculateRetentionRate(from: Date, to: Date, filters: any) {
    const previousFrom = new Date(from);
    previousFrom.setDate(previousFrom.getDate() - 30);

    const previousClients = await this.prisma.client.findMany({
      where: { created_at: { gte: previousFrom, lt: from }, deleted_at: null, ...filters },
      select: { id: true },
    });

    const returnedClients = await this.prisma.visit.count({
      where: {
        visit_date: { gte: from, lt: to },
        client_id: { in: previousClients.map((c) => c.id) },
        deleted_at: null,
        ...filters,
      },
      // distinct: ['client_id'],
    });

    return previousClients.length > 0
      ? Math.round((returnedClients / previousClients.length) * 100 * 10) / 10
      : 0;
  }

  private async calculateCharts(from: Date, to: Date, filters: any) {
    const visitTrend = await this.prisma.visit.groupBy({
      by: ['visit_date'],
      _count: { id: true },
      _sum: { total_amount: true },
      where: { visit_date: { gte: from, lt: to }, deleted_at: null, ...filters },
      orderBy: { visit_date: 'asc' },
    });

    const serviceDistribution = await this.prisma.visitService.groupBy({
      by: ['service_id'],
      _count: { id: true },
      _sum: { total: true },
      where: { created_at: { gte: from, lt: to }, deleted_at: null },
    });

    return {
      visitTrend: visitTrend.map((v) => ({
        date: v.visit_date,
        count: v._count.id,
        revenue: v._sum.total_amount?.toNumber() || 0,
      })),
      serviceDistribution: serviceDistribution.slice(0, 10).map((s) => ({
        serviceId: s.service_id!,
        count: s._count.id,
        revenue: s._sum.total?.toNumber() || 0,
      })),
    };
  }

  private async calculateAlerts(from: Date, filters: any) {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const scheduledVisits = await this.prisma.visit.count({
      where: { visit_date: { gte: todayStart, lt: todayEnd }, status: 'SCHEDULED', deleted_at: null, ...filters },
    });

    const debtClients = await this.prisma.client.count({
      where: {
        visits: { some: { debt_amount: { gt: 0 }, deleted_at: null } },
        deleted_at: null,
        ...filters,
      },
    });

    const availableRooms = await this.prisma.room.count({
      where: { status: 'AVAILABLE', record_status: 'ACTIVE', deleted_at: null },
    });

    const pendingPayments = await this.prisma.visit.count({
      where: { debt_amount: { gt: 0 }, status: 'COMPLETED', deleted_at: null, ...filters },
    });

    return { scheduledVisits, debtClients, availableRooms, pendingPayments };
  }

  async exportDashboard(dto: any): Promise<Buffer> {
    const metrics = await this.getDashboardMetrics({ period: dto.period }, 1, 'Admin');
    return this.generateExcel(metrics);
  }

  private async generateExcel(metrics: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const kpiSheet = workbook.addWorksheet('KPIs');
    kpiSheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
    ];
    kpiSheet.addRows([
      { metric: 'Jami Visitlar', value: metrics.kpis.totalVisits },
      { metric: 'Jami Kirim', value: metrics.kpis.totalRevenue },
      { metric: 'O\'rtacha Check', value: metrics.kpis.averageCheck },
      { metric: 'Mijoz Qaytish', value: `${metrics.kpis.retentionRate}%` },
      { metric: 'Xona Bandligi', value: `${metrics.kpis.occupancyRate}%` },
      { metric: 'Qarzdorlik', value: `${metrics.kpis.debtRate}%` },
    ]);

    const alertsSheet = workbook.addWorksheet('Tezkor Xabarlar');
    alertsSheet.columns = [
      { header: 'Xabar', key: 'alert', width: 30 },
      { header: 'Son', key: 'count', width: 15 },
    ];
    alertsSheet.addRows([
      { alert: 'Rejalashtirilgan Visitlar', count: metrics.alerts.scheduledVisits },
      { alert: 'Qarzдор Mijozlar', count: metrics.alerts.debtClients },
      { alert: 'Bo\'sh Xonalar', count: metrics.alerts.availableRooms },
      { alert: 'Tugallanmagan To\'lovlar', count: metrics.alerts.pendingPayments },
    ]);

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }
}
