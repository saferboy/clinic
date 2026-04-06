import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetMonthlyReportDto } from './dto/get-monthly-report.dto';
import { ExportMonthlyReportDto } from './dto/export-monthly-report.dto';
import * as ExcelJS from 'exceljs';

/**
 * Oylik hisobot interfeyslari
 */
export interface MonthlyVisitStats {
  totalVisits: number;
  completedVisits: number;
  scheduledVisits: number;
  cancelledVisits: number;
  noShowVisits: number;
  averageVisitsPerDay: number;
}

export interface MonthlyFinancialStats {
  totalIncome: number;
  totalPayment: number;
  totalPrepaid: number;
  totalOutcome: number;
  averageCheck: number;
  totalDebt: number;
  profit: number;
}

export interface DoctorLoadStats {
  doctorId: number;
  doctorName: string;
  visitCount: number;
  totalAmount: number;
  commission: number;
  averagePerVisit: number;
}

export interface RoomUsage {
  roomId: number;
  roomName: string;
  usageCount: number;
  totalMinutes: number;
  occupancyRate: number;
}

export interface RoomOccupancyStats {
  totalRooms: number;
  totalUsage: number;
  averageOccupancyRate: number;
  roomUsage: RoomUsage[];
}

export interface SourceStats {
  sourceId: number;
  sourceName: string;
  count: number;
  percentage: number;
}

export interface GenderStats {
  gender: string;
  count: number;
  percentage: number;
}

export interface NewClientStats {
  totalNewClients: number;
  totalActiveClients: number;
  retentionRate: number;
  bySource: SourceStats[];
  byGender: GenderStats[];
}

export interface ServiceStats {
  serviceId: number;
  serviceName: string;
  count: number;
  totalAmount: number;
  percentage: number;
  averagePrice: number;
}

export interface DebtorStats {
  clientId: number;
  clientName: string;
  phone: string;
  debtAmount: number;
  daysOverdue: number;
  visitCount: number;
}

export interface DebtAgeStats {
  age: string;
  amount: number;
  percentage: number;
}

export interface DebtStats {
  totalDebt: number;
  overdueDebt: number;
  debtRate: number;
  topDebtors: DebtorStats[];
  debtByAge: DebtAgeStats[];
}

export interface MonthlyComparison {
  previousMonth: number;
  previousYear: number;
  visitChange: ChangeMetric;
  incomeChange: ChangeMetric;
  clientChange: ChangeMetric;
}

export interface ChangeMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  period: {
    from: Date;
    to: Date;
  };
  visitStats: MonthlyVisitStats;
  financialStats: MonthlyFinancialStats;
  doctorLoadStats: DoctorLoadStats[];
  roomOccupancyStats: RoomOccupancyStats;
  newClientStats: NewClientStats;
  serviceStats: ServiceStats[];
  debtStats: DebtStats;
  comparison?: MonthlyComparison;
}

@Injectable()
export class MonthlyReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Oylik hisobotni olish
   */
  async getMonthlyReport(dto: GetMonthlyReportDto): Promise<MonthlyReport> {
    const now = new Date();
    const month = dto.month || now.getMonth() + 1;
    const year = dto.year || now.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = endDate.getDate();

    const [
      visitStats,
      financialStats,
      doctorLoadStats,
      roomOccupancyStats,
      newClientStats,
      serviceStats,
      debtStats,
    ] = await Promise.all([
      this.getMonthlyVisitStats(startDate, endDate, daysInMonth),
      this.getMonthlyFinancialStats(startDate, endDate),
      this.getMonthlyDoctorLoadStats(startDate, endDate),
      this.getMonthlyRoomOccupancyStats(startDate, endDate, daysInMonth),
      this.getMonthlyNewClientStats(startDate, endDate),
      this.getMonthlyServiceStats(startDate, endDate),
      this.getMonthlyDebtStats(startDate, endDate),
    ]);

    let comparison: MonthlyComparison | undefined;
    if (dto.compare) {
      comparison = await this.getMonthlyComparison(month, year);
    }

    return {
      month,
      year,
      period: { from: startDate, to: endDate },
      visitStats,
      financialStats,
      doctorLoadStats,
      roomOccupancyStats,
      newClientStats,
      serviceStats,
      debtStats,
      comparison,
    };
  }

  /**
   * Oylik visit statistikasi
   */
  private async getMonthlyVisitStats(
    startDate: Date,
    endDate: Date,
    daysInMonth: number,
  ): Promise<MonthlyVisitStats> {
    const totalVisits = await this.prisma.visit.count({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
    });

    const visitsByStatus = await this.prisma.visit.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
    });

    const stats: MonthlyVisitStats = {
      totalVisits,
      completedVisits: 0,
      scheduledVisits: 0,
      cancelledVisits: 0,
      noShowVisits: 0,
      averageVisitsPerDay: 0,
    };

    visitsByStatus.forEach((item) => {
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

    stats.averageVisitsPerDay =
      daysInMonth > 0
        ? Math.round((totalVisits / daysInMonth) * 10) / 10
        : 0;

    return stats;
  }

  /**
   * Oylik moliyaviy statistika
   */
  private async getMonthlyFinancialStats(
    startDate: Date,
    endDate: Date,
  ): Promise<MonthlyFinancialStats> {
    const paymentStats = await this.prisma.payment.aggregate({
      where: {
        payment_date: { gte: startDate, lt: endDate },
        payment_type: 'INCOME',
        deleted_at: null,
      },
      _sum: { amount: true },
    });

    const prepaidStats = await this.prisma.clientPaid.aggregate({
      where: {
        payment_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      _sum: { amount: true },
    });

    const outcomeStats = await this.prisma.otherPaid.aggregate({
      where: {
        payment_date: { gte: startDate, lt: endDate },
        type: 'OUTCOME',
        deleted_at: null,
      },
      _sum: { amount: true },
    });

    const visitStats = await this.prisma.visit.aggregate({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      _sum: {
        total_amount: true,
        paid_amount: true,
        debt_amount: true,
      },
      _count: { id: true },
    });

    const totalIncome =
      (paymentStats._sum.amount?.toNumber() || 0) +
      (prepaidStats._sum.amount?.toNumber() || 0);
    const totalPayment = paymentStats._sum.amount?.toNumber() || 0;
    const totalPrepaid = prepaidStats._sum.amount?.toNumber() || 0;
    const totalOutcome = outcomeStats._sum.amount?.toNumber() || 0;
    const averageCheck =
      visitStats._count.id > 0
        ? Math.round(
            ((visitStats._sum.total_amount?.toNumber() || 0) /
              visitStats._count.id) *
              100,
          ) / 100
        : 0;
    const totalDebt = visitStats._sum.debt_amount?.toNumber() || 0;
    const profit = totalIncome - totalOutcome;

    return {
      totalIncome,
      totalPayment,
      totalPrepaid,
      totalOutcome,
      averageCheck,
      totalDebt,
      profit,
    };
  }

  /**
   * Shifokor yuklamasi
   */
  private async getMonthlyDoctorLoadStats(
    startDate: Date,
    endDate: Date,
  ): Promise<DoctorLoadStats[]> {
    const doctorVisits = await this.prisma.visit.groupBy({
      by: ['doctor_id'],
      _count: { id: true },
      _sum: { total_amount: true },
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
        doctor_id: { not: null },
      },
    });

    const stats = await Promise.all(
      doctorVisits.map(async (item) => {
        const doctor = await this.prisma.user.findUnique({
          where: { id: item.doctor_id! },
          select: { id: true, full_name: true },
        });

        const commission = await this.calculateDoctorCommission(
          item.doctor_id!,
          startDate,
          endDate,
        );

        const averagePerVisit =
          item._count.id > 0
            ? Math.round(
                ((item._sum.total_amount?.toNumber() || 0) /
                  item._count.id) *
                  100,
              ) / 100
            : 0;

        return {
          doctorId: item.doctor_id!,
          doctorName: doctor?.full_name || 'Noma\'lum',
          visitCount: item._count.id,
          totalAmount: item._sum.total_amount?.toNumber() || 0,
          commission,
          averagePerVisit,
        };
      }),
    );

    return stats.sort((a, b) => b.visitCount - a.visitCount);
  }

  private async calculateDoctorCommission(
    doctorId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const visitServices = await this.prisma.visitService.findMany({
      where: {
        visit: {
          doctor_id: doctorId,
          visit_date: { gte: startDate, lt: endDate },
          deleted_at: null,
        },
        deleted_at: null,
      },
      include: { service: true },
    });

    let totalCommission = 0;

    for (const vs of visitServices) {
      const serviceUser = await this.prisma.serviceUser.findFirst({
        where: {
          service_id: vs.service_id,
          user_id: doctorId,
          status: 'ACTIVE',
          deleted_at: null,
        },
      });

      if (serviceUser) {
        if (serviceUser.type === 'FIXED') {
          totalCommission += serviceUser.value.toNumber() * vs.quantity;
        } else if (serviceUser.type === 'PERCENT') {
          totalCommission +=
            (vs.service?.price.toNumber() || 0) *
            (serviceUser.value.toNumber() / 100) *
            vs.quantity;
        }
      }
    }

    return totalCommission;
  }

  /**
   * Xona bandligi
   */
  private async getMonthlyRoomOccupancyStats(
    startDate: Date,
    endDate: Date,
    daysInMonth: number,
  ): Promise<RoomOccupancyStats> {
    const totalRooms = await this.prisma.room.count({
      where: { record_status: 'ACTIVE', deleted_at: null },
    });

    const roomUsage = await this.prisma.visitRoom.groupBy({
      by: ['room_id'],
      _count: { id: true },
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
    });

    const totalUsage = roomUsage.reduce((sum, item) => sum + item._count.id, 0);
    const averageOccupancyRate =
      totalRooms > 0
        ? Math.round((totalUsage / (totalRooms * daysInMonth)) * 100 * 10) / 10
        : 0;

    const roomUsageDetails = await Promise.all(
      roomUsage.map(async (item) => {
        const room = await this.prisma.room.findUnique({
          where: { id: item.room_id! },
          select: { id: true, name: true },
        });

        return {
          roomId: item.room_id!,
          roomName: room?.name || 'Noma\'lum',
          usageCount: item._count.id,
          totalMinutes: 0,
          occupancyRate: 0,
        };
      }),
    );

    return {
      totalRooms,
      totalUsage,
      averageOccupancyRate,
      roomUsage: roomUsageDetails.sort((a, b) => b.usageCount - a.usageCount),
    };
  }

  /**
   * Yangi mijozlar
   */
  private async getMonthlyNewClientStats(
    startDate: Date,
    endDate: Date,
  ): Promise<NewClientStats> {
    const totalNewClients = await this.prisma.client.count({
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
    });

    const totalActiveClients = await this.prisma.client.count({
      where: { deleted_at: null, status: 'ACTIVE' },
    });

    const bySource = await this.prisma.client.groupBy({
      by: ['source_id'],
      _count: { id: true },
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
        source_id: { not: null },
      },
    });

    const byGender = await this.prisma.client.groupBy({
      by: ['gender'],
      _count: { id: true },
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
    });

    const sourceDetails = await Promise.all(
      bySource.map(async (item) => {
        const source = await this.prisma.source.findUnique({
          where: { id: item.source_id! },
          select: { id: true, name: true },
        });

        const percentage =
          totalNewClients > 0
            ? Math.round((item._count.id / totalNewClients) * 100 * 10) / 10
            : 0;

        return {
          sourceId: item.source_id!,
          sourceName: source?.name || 'Noma\'lum',
          count: item._count.id,
          percentage,
        };
      }),
    );

    const genderDetails = byGender.map((item) => {
      const percentage =
        totalNewClients > 0
          ? Math.round((item._count.id / totalNewClients) * 100 * 10) / 10
          : 0;

      return {
        gender: item.gender,
        count: item._count.id,
        percentage,
      };
    });

    const retentionRate = await this.calculateRetentionRate(startDate, endDate);

    return {
      totalNewClients,
      totalActiveClients,
      retentionRate,
      bySource: sourceDetails.sort((a, b) => b.count - a.count),
      byGender: genderDetails.sort((a, b) => b.count - a.count),
    };
  }

  private async calculateRetentionRate(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const previousMonthStart = new Date(startDate);
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    const previousMonthEnd = new Date(startDate);
    previousMonthEnd.setDate(0);

    const previousClients = await this.prisma.client.findMany({
      where: {
        created_at: { gte: previousMonthStart, lt: previousMonthEnd },
        deleted_at: null,
      },
      select: { id: true },
    });

    const returnedClients = await this.prisma.visit.count({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        client_id: { in: previousClients.map((c) => c.id) },
        deleted_at: null,
      },
      // distinct: ['client_id'],
    });

    return previousClients.length > 0
      ? Math.round((returnedClients / previousClients.length) * 100 * 10) / 10
      : 0;
  }

  /**
   * Xizmatlar statistikasi
   */
  private async getMonthlyServiceStats(
    startDate: Date,
    endDate: Date,
  ): Promise<ServiceStats[]> {
    const serviceStats = await this.prisma.visitService.groupBy({
      by: ['service_id'],
      _count: { id: true },
      _sum: { total: true },
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
    });

    const totalAmount = serviceStats.reduce(
      (sum, item) => sum + (item._sum.total?.toNumber() || 0),
      0,
    );

    const stats = await Promise.all(
      serviceStats.map(async (item) => {
        const service = await this.prisma.service.findUnique({
          where: { id: item.service_id! },
          select: { id: true, name: true, price: true },
        });

        const percentage =
          totalAmount > 0
            ? Math.round(
                ((item._sum.total?.toNumber() || 0) / totalAmount) * 100 * 10,
              ) / 10
            : 0;

        const averagePrice =
          item._count.id > 0
            ? Math.round(
                ((item._sum.total?.toNumber() || 0) / item._count.id) * 100,
              ) / 100
            : 0;

        return {
          serviceId: item.service_id!,
          serviceName: service?.name || 'Noma\'lum',
          count: item._count.id,
          totalAmount: item._sum.total?.toNumber() || 0,
          percentage,
          averagePrice,
        };
      }),
    );

    return stats.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  /**
   * Qarzdorlik statistikasi
   */
  private async getMonthlyDebtStats(
    startDate: Date,
    endDate: Date,
  ): Promise<DebtStats> {
    const debtStats = await this.prisma.visit.aggregate({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
        debt_amount: { gt: 0 },
      },
      _sum: { debt_amount: true },
      _count: { id: true },
    });

    const totalAmount = await this.prisma.visit.aggregate({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      _sum: { total_amount: true },
    });

    const totalDebt = debtStats._sum.debt_amount?.toNumber() || 0;
    const debtRate =
      (totalAmount._sum.total_amount?.toNumber() || 0) > 0
        ? Math.round(
            (totalDebt / (totalAmount._sum.total_amount?.toNumber() || 0)) *
              100 *
              10,
          ) / 10
        : 0;

    const topDebtors = await this.getTopDebtors(startDate, endDate);
    const debtByAge = await this.getDebtByAge(startDate, endDate);
    const overdueDebt = await this.calculateOverdueDebt(endDate);

    return {
      totalDebt,
      overdueDebt,
      debtRate,
      topDebtors,
      debtByAge,
    };
  }

  private async getTopDebtors(
    startDate: Date,
    endDate: Date,
  ): Promise<DebtorStats[]> {
    const debtVisits = await this.prisma.visit.findMany({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
        debt_amount: { gt: 0 },
      },
      include: {
        client: { select: { id: true, full_name: true, phone: true } },
      },
    });

    const clientMap = new Map<
      number,
      {
        totalDebt: number;
        visitCount: number;
        client: { id: number; full_name: string; phone: string };
        oldestDate: Date;
      }
    >();

    for (const visit of debtVisits) {
      if (!visit.client_id) continue;

      const existing = clientMap.get(visit.client_id);
      if (existing) {
        existing.totalDebt += visit.debt_amount.toNumber();
        existing.visitCount += 1;
        if (visit.visit_date < existing.oldestDate) {
          existing.oldestDate = visit.visit_date;
        }
      } else {
        if (!visit.client) continue;
        clientMap.set(visit.client_id, {
          totalDebt: visit.debt_amount.toNumber(),
          visitCount: 1,
          client: visit.client,
          oldestDate: visit.visit_date,
        });
      }
    }

    const now = new Date();

    return Array.from(clientMap.values())
      .map((data) => ({
        clientId: data.client.id,
        clientName: data.client?.full_name || 'Noma\'lum',
        phone: data.client?.phone || '',
        debtAmount: data.totalDebt,
        visitCount: data.visitCount,
        daysOverdue: Math.floor(
          (now.getTime() - data.oldestDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      }))
      .sort((a, b) => b.debtAmount - a.debtAmount)
      .slice(0, 10);
  }

  private async getDebtByAge(
    startDate: Date,
    endDate: Date,
  ): Promise<DebtAgeStats[]> {
    const debtVisits = await this.prisma.visit.findMany({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
        debt_amount: { gt: 0 },
      },
    });

    const now = new Date();
    const aging = [
      { age: '0-30 kun', minDays: 0, maxDays: 30, amount: 0 },
      { age: '31-60 kun', minDays: 31, maxDays: 60, amount: 0 },
      { age: '61-90 kun', minDays: 61, maxDays: 90, amount: 0 },
      { age: '90+ kun', minDays: 91, maxDays: 9999, amount: 0 },
    ];

    const totalDebt = debtVisits.reduce(
      (sum, v) => sum + v.debt_amount.toNumber(),
      0,
    );

    for (const visit of debtVisits) {
      const daysOverdue = Math.floor(
        (now.getTime() - visit.visit_date.getTime()) / (1000 * 60 * 60 * 24),
      );
      const ageGroup = aging.find(
        (a) => daysOverdue >= a.minDays && daysOverdue <= a.maxDays,
      );
      if (ageGroup) {
        ageGroup.amount += visit.debt_amount.toNumber();
      }
    }

    return aging.map((a) => ({
      age: a.age,
      amount: a.amount,
      percentage:
        totalDebt > 0 ? Math.round((a.amount / totalDebt) * 100 * 10) / 10 : 0,
    }));
  }

  private async calculateOverdueDebt(endDate: Date): Promise<number> {
    const debtVisits = await this.prisma.visit.findMany({
      where: {
        visit_date: { lte: endDate },
        deleted_at: null,
        debt_amount: { gt: 0 },
      },
    });

    const now = new Date();
    return debtVisits
      .filter((v) => {
        const daysOverdue = Math.floor(
          (now.getTime() - v.visit_date.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysOverdue > 30;
      })
      .reduce((sum, v) => sum + v.debt_amount.toNumber(), 0);
  }

  /**
   * Oylik solishtirma
   */
  private async getMonthlyComparison(
    month: number,
    year: number,
  ): Promise<MonthlyComparison> {
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;

    const currentReport = await this.getMonthlyReport({ month, year });
    const previousReport = await this.getMonthlyReport({
      month: previousMonth,
      year: previousYear,
    });

    return {
      previousMonth,
      previousYear,
      visitChange: this.calculateChange(
        currentReport.visitStats.totalVisits,
        previousReport.visitStats.totalVisits,
      ),
      incomeChange: this.calculateChange(
        currentReport.financialStats.totalIncome,
        previousReport.financialStats.totalIncome,
      ),
      clientChange: this.calculateChange(
        currentReport.newClientStats.totalNewClients,
        previousReport.newClientStats.totalNewClients,
      ),
    };
  }

  private calculateChange(current: number, previous: number): ChangeMetric {
    const change = current - previous;
    const changePercent =
      previous > 0 ? Math.round((change / previous) * 100 * 100) / 100 : 0;

    return { current, previous, change, changePercent };
  }

  /**
   * Export Excel
   */
  async exportMonthlyReport(dto: ExportMonthlyReportDto): Promise<Buffer> {
    const report = await this.getMonthlyReport({
      month: dto.month,
      year: dto.year,
    });

    if (dto.format === 'excel') {
      return this.generateExcel(report, dto.includeDetails);
    }

    throw new BadRequestException('RPT_006');
  }

  private async generateExcel(
    report: MonthlyReport,
    includeDetails?: boolean,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const summarySheet = workbook.addWorksheet('Umumiy');
    summarySheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
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
      { metric: 'Retention Rate', value: `${report.newClientStats.retentionRate}%` },
    ]);

    const doctorSheet = workbook.addWorksheet('Shifokorlar');
    doctorSheet.columns = [
      { header: 'Shifokor', key: 'name', width: 25 },
      { header: 'Visit Soni', key: 'visits', width: 15 },
      { header: 'Summa', key: 'amount', width: 20 },
      { header: 'Komissiya', key: 'commission', width: 20 },
      { header: 'O\'rtacha', key: 'average', width: 15 },
    ];
    doctorSheet.addRows(
      report.doctorLoadStats.map((d) => ({
        name: d.doctorName,
        visits: d.visitCount,
        amount: d.totalAmount,
        commission: d.commission,
        average: d.averagePerVisit,
      })),
    );

    const serviceSheet = workbook.addWorksheet('Xizmatlar');
    serviceSheet.columns = [
      { header: 'Xizmat', key: 'name', width: 30 },
      { header: 'Soni', key: 'count', width: 15 },
      { header: 'Summa', key: 'amount', width: 20 },
      { header: 'Ulush', key: 'percentage', width: 15 },
    ];
    serviceSheet.addRows(
      report.serviceStats.map((s) => ({
        name: s.serviceName,
        count: s.count,
        amount: s.totalAmount,
        percentage: `${s.percentage}%`,
      })),
    );

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }
}
