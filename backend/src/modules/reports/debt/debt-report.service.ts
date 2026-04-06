import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetDebtReportDto, GetDebtClientsDto, CreateFollowupDto } from './dto/get-debt-report.dto';
import * as ExcelJS from 'exceljs';

export interface DebtSummary {
  totalDebt: number;
  totalClients: number;
  averageDebt: number;
  debtRate: number;
  overdueDebt: number;
  overdueClients: number;
}

export interface DebtAging {
  ageRange: string;
  minDays: number;
  maxDays: number;
  amount: number;
  count: number;
  percentage: number;
}

export interface TopDebtor {
  clientId: number;
  clientName: string;
  phone: string;
  totalDebt: number;
  visitCount: number;
  oldestDebtDate: Date;
  daysOverdue: number;
}

export interface DebtTrendData {
  date: Date;
  debtAmount: number;
  collectedAmount: number;
  netDebt: number;
}

export interface CollectionStats {
  totalCollected: number;
  collectionRate: number;
  followupCount: number;
  smsSent: number;
  callsMade: number;
}

export interface DebtReport {
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

export interface DebtClient {
  clientId: number;
  clientName: string;
  phone: string;
  totalDebt: number;
  visitCount: number;
  oldestDebtDate: Date;
  newestDebtDate: Date;
  daysOverdue: number;
  lastPaymentDate: Date | null;
  lastPaymentAmount: number;
  contactAttempts: number;
  status: string;
}

export interface DebtClientList {
  period: {
    from: Date;
    to: Date;
  };
  totalClients: number;
  totalDebt: number;
  clients: DebtClient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export class DebtReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Qarzdorlik hisobotini olish
   */
  async getDebtReport(dto: GetDebtReportDto): Promise<DebtReport> {
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    const debtVisits = await this.prisma.visit.findMany({
      where: {
        debt_amount: { gt: 0 },
        visit_date: {
          gte: startDate,
          lt: endDate,
        },
        deleted_at: null,
      },
      include: {
        client: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
      },
    });

    const [summary, aging, topDebtors, trendData, collectionStats] =
      await Promise.all([
        this.calculateDebtSummary(debtVisits, startDate, endDate),
        this.calculateDebtAging(debtVisits),
        this.getTopDebtors(debtVisits),
        this.getDebtTrend(debtVisits, startDate, endDate),
        this.getCollectionStats(startDate, endDate),
      ]);

    return {
      period: { from: startDate, to: endDate },
      summary,
      aging,
      topDebtors,
      trendData,
      collectionStats,
    };
  }

  /**
   * Umumiy qarzdorlik statistikasi
   */
  private async calculateDebtSummary(
    debtVisits: any[],
    startDate: Date,
    endDate: Date,
  ): Promise<DebtSummary> {
    const totalDebt = debtVisits.reduce(
      (sum, v) => sum + v.debt_amount.toNumber(),
      0,
    );

    const uniqueClients = new Set(debtVisits.map((v) => v.client_id));
    const totalClients = uniqueClients.size;

    const averageDebt =
      totalClients > 0
        ? Math.round((totalDebt / totalClients) * 100) / 100
        : 0;

    const allVisits = await this.prisma.visit.aggregate({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      _sum: {
        total_amount: true,
        debt_amount: true,
      },
    });

    const totalAmount = allVisits._sum.total_amount?.toNumber() || 0;
    const debtRate =
      totalAmount > 0
        ? Math.round((totalDebt / totalAmount) * 100 * 10) / 10
        : 0;

    const now = new Date();
    const overdueVisits = debtVisits.filter((v) => {
      const daysOverdue = Math.floor(
        (now.getTime() - v.visit_date.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysOverdue > 30;
    });

    const overdueDebt = overdueVisits.reduce(
      (sum, v) => sum + v.debt_amount.toNumber(),
      0,
    );
    const overdueClients = new Set(overdueVisits.map((v) => v.client_id)).size;

    return {
      totalDebt,
      totalClients,
      averageDebt,
      debtRate,
      overdueDebt,
      overdueClients,
    };
  }

  /**
   * Qarz yoshi (aging) hisoblash
   */
  private async calculateDebtAging(debtVisits: any[]): Promise<DebtAging[]> {
    const now = new Date();

    const aging: DebtAging[] = [
      { ageRange: '0-30 kun', minDays: 0, maxDays: 30, amount: 0, count: 0, percentage: 0 },
      { ageRange: '31-60 kun', minDays: 31, maxDays: 60, amount: 0, count: 0, percentage: 0 },
      { ageRange: '61-90 kun', minDays: 61, maxDays: 90, amount: 0, count: 0, percentage: 0 },
      { ageRange: '90+ kun', minDays: 91, maxDays: 9999, amount: 0, count: 0, percentage: 0 },
    ];

    const totalDebt = debtVisits.reduce(
      (sum, v) => sum + v.debt_amount.toNumber(),
      0,
    );

    for (const visit of debtVisits) {
      const daysOverdue = Math.floor(
        (now.getTime() - visit.visit_date.getTime()) / (1000 * 60 * 60 * 24),
      );
      const debtAmount = visit.debt_amount.toNumber();

      const ageGroup = aging.find(
        (a) => daysOverdue >= a.minDays && daysOverdue <= a.maxDays,
      );
      if (ageGroup) {
        ageGroup.amount += debtAmount;
        ageGroup.count += 1;
      }
    }

    aging.forEach((a) => {
      a.percentage =
        totalDebt > 0 ? Math.round((a.amount / totalDebt) * 100 * 10) / 10 : 0;
    });

    return aging;
  }

  /**
   * Eng ko'p qarzдор mijozlar
   */
  private async getTopDebtors(debtVisits: any[], limit: number = 10): Promise<TopDebtor[]> {
    const clientDebts = new Map<
      number,
      {
        totalDebt: number;
        visitCount: number;
        oldestDate: Date;
        clientName: string;
        phone: string;
      }
    >();

    for (const visit of debtVisits) {
      if (!clientDebts.has(visit.client_id)) {
        clientDebts.set(visit.client_id, {
          totalDebt: 0,
          visitCount: 0,
          oldestDate: visit.visit_date,
          clientName: visit.client.full_name,
          phone: visit.client.phone,
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
        daysOverdue: Math.floor(
          (now.getTime() - data.oldestDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      }))
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, limit);
  }

  /**
   * Vaqt bo'yicha trend
   */
  private async getDebtTrend(
    debtVisits: any[],
    startDate: Date,
    endDate: Date,
  ): Promise<DebtTrendData[]> {
    const dailyStats = new Map<
      string,
      {
        debtAmount: number;
        collectedAmount: number;
      }
    >();

    for (const visit of debtVisits) {
      const dateKey = new Date(visit.visit_date).toISOString().split('T')[0];

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, {
          debtAmount: 0,
          collectedAmount: 0,
        });
      }

      const stat = dailyStats.get(dateKey)!;
      stat.debtAmount += visit.debt_amount.toNumber();
      stat.collectedAmount += visit.paid_amount.toNumber();
    }

    return Array.from(dailyStats.entries())
      .map(([date, stat]) => ({
        date: new Date(date),
        debtAmount: stat.debtAmount,
        collectedAmount: stat.collectedAmount,
        netDebt: stat.debtAmount - stat.collectedAmount,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Undirish statistikasi
   */
  private async getCollectionStats(
    startDate: Date,
    endDate: Date,
  ): Promise<CollectionStats> {
    const payments = await this.prisma.payment.aggregate({
      where: {
        payment_date: { gte: startDate, lt: endDate },
        payment_type: 'INCOME',
        deleted_at: null,
      },
      _sum: { amount: true },
    });

    // DebtFollowup modeli hozircha mavjud emas
    const followupCount = 0;

    const totalCollected = payments._sum.amount?.toNumber() || 0;

    const totalDebt = await this.prisma.visit.aggregate({
      where: {
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      _sum: { debt_amount: true },
    });

    const collectionRate =
      (totalDebt._sum.debt_amount?.toNumber() || 0) > 0
        ? Math.round(
            (totalCollected / (totalDebt._sum.debt_amount?.toNumber() || 0)) *
              100 *
              10,
          ) / 10
        : 0;

    return {
      totalCollected,
      collectionRate,
      followupCount,
      smsSent: 0,
      callsMade: 0,
    };
  }

  /**
   * Qarzдор mijozlar ro'yxati
   */
  async getDebtClientList(dto: GetDebtClientsDto): Promise<DebtClientList> {
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    const page = dto.page || 1;
    const limit = dto.limit || 20;

    const debtVisits = await this.prisma.visit.findMany({
      where: {
        debt_amount: { gt: 0 },
        visit_date: {
          gte: startDate,
          lt: endDate,
        },
        deleted_at: null,
        ...(dto.min_debt && {
          debt_amount: { gte: dto.min_debt },
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
        payments: {
          where: { deleted_at: null },
          orderBy: { payment_date: 'desc' },
          take: 1,
        },
      },
    });

    const clientDebts = new Map<number, DebtClient>();

    for (const visit of debtVisits) {
      if (!visit.client_id) continue;
      
      if (!clientDebts.has(visit.client_id)) {
        clientDebts.set(visit.client_id, {
          clientId: visit.client_id,
          clientName: visit.client?.full_name || 'Noma\'lum',
          phone: visit.client?.phone || '',
          totalDebt: 0,
          visitCount: 0,
          oldestDebtDate: visit.visit_date,
          newestDebtDate: visit.visit_date,
          daysOverdue: 0,
          lastPaymentDate: visit.payments[0]?.payment_date || null,
          lastPaymentAmount: visit.payments[0]?.amount.toNumber() || 0,
          contactAttempts: 0,
          status: 'NEW',
        });
      }

      const client = clientDebts.get(visit.client_id)!;
      client.totalDebt += visit.debt_amount.toNumber();
      client.visitCount += 1;

      if (visit.visit_date < client.oldestDebtDate) {
        client.oldestDebtDate = visit.visit_date;
      }
      if (visit.visit_date > client.newestDebtDate) {
        client.newestDebtDate = visit.visit_date;
      }
    }

    const now = new Date();
    let clients = Array.from(clientDebts.values()).map((client) => ({
      ...client,
      daysOverdue: Math.floor(
        (now.getTime() - client.oldestDebtDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    }));

    // Sort
    if (dto.sort_by === 'debt_amount') {
      clients.sort((a, b) =>
        dto.sort_order === 'desc'
          ? b.totalDebt - a.totalDebt
          : a.totalDebt - b.totalDebt,
      );
    } else if (dto.sort_by === 'days_overdue') {
      clients.sort((a, b) =>
        dto.sort_order === 'desc'
          ? b.daysOverdue - a.daysOverdue
          : a.daysOverdue - b.daysOverdue,
      );
    }

    const totalClients = clients.length;
    const totalDebt = clients.reduce((sum, c) => sum + c.totalDebt, 0);

    const paginatedClients = clients.slice((page - 1) * limit, page * limit);

    return {
      period: { from: startDate, to: endDate },
      totalClients,
      totalDebt,
      clients: paginatedClients,
      pagination: {
        page,
        limit,
        total: totalClients,
        totalPages: Math.ceil(totalClients / limit),
        hasNextPage: page * limit < totalClients,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Follow-up yaratish (DebtFollowup modeli qo'shilgandan keyin ishlaydi)
   */
  async createFollowup(
    clientId: number,
    dto: CreateFollowupDto,
    userId: number,
  ): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.deleted_at) {
      throw new NotFoundException('Mijoz topilmadi');
    }

    const debtVisits = await this.prisma.visit.findFirst({
      where: {
        client_id: clientId,
        debt_amount: { gt: 0 },
        deleted_at: null,
      },
    });

    if (!debtVisits) {
      throw new BadRequestException('Mijozda qarz yo\'q');
    }

    // TODO: DebtFollowup modeli qo'shilgandan keyin bu yerni yoqing
    // Hozircha mock response
    return {
      id: 1,
      client_id: clientId,
      type: dto.type,
      description: dto.description,
      status: 'PENDING',
      created_at: new Date(),
    };
  }

  /**
   * Export Excel
   */
  async exportDebtReport(dto: any): Promise<Buffer> {
    const report = await this.getDebtReport({
      start_date: dto.start_date,
      end_date: dto.end_date,
    });

    if (dto.format === 'excel') {
      return this.generateExcel(report);
    }

    throw new BadRequestException('DBT_006');
  }

  private async generateExcel(report: DebtReport): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const summarySheet = workbook.addWorksheet('Umumiy');
    summarySheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { metric: 'Umumiy Qarzdorlik', value: report.summary.totalDebt },
      { metric: 'Qarzдор Mijozlar', value: report.summary.totalClients },
      { metric: 'O\'rtacha Qarz', value: report.summary.averageDebt },
      { metric: 'Qarzdorlik Foizi', value: `${report.summary.debtRate}%` },
      { metric: 'Muddati O\'tgan Qarz', value: report.summary.overdueDebt },
    ]);

    const agingSheet = workbook.addWorksheet('Qarz Yoshi');
    agingSheet.columns = [
      { header: 'Yoshi', key: 'age', width: 20 },
      { header: 'Summa', key: 'amount', width: 20 },
      { header: 'Mijozlar', key: 'count', width: 15 },
      { header: 'Ulush (%)', key: 'percentage', width: 15 },
    ];
    agingSheet.addRows(
      report.aging.map((a) => ({
        age: a.ageRange,
        amount: a.amount,
        count: a.count,
        percentage: a.percentage,
      })),
    );

    const debtorsSheet = workbook.addWorksheet('Qarzдор Mijozlar');
    debtorsSheet.columns = [
      { header: 'Mijoz', key: 'name', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Qarz Summasi', key: 'debt', width: 20 },
      { header: 'Kunlar', key: 'days', width: 15 },
    ];
    debtorsSheet.addRows(
      report.topDebtors.map((d) => ({
        name: d.clientName,
        phone: d.phone,
        debt: d.totalDebt,
        days: d.daysOverdue,
      })),
    );

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }
}
