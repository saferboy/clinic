import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetDailyReportDto } from './dto/get-daily-report.dto';
import { ExportDailyReportDto } from './dto/export-daily-report.dto';
import * as ExcelJS from 'exceljs';

/**
 * Kunlik hisobot interfeyslari
 */
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

export interface DoctorLoadStats {
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

export interface SourceStats {
  sourceId: number;
  sourceName: string;
  count: number;
}

export interface GenderStats {
  gender: string;
  count: number;
}

export interface NewClientStats {
  totalNewClients: number;
  bySource: SourceStats[];
  byGender: GenderStats[];
}

export interface DailyReport {
  date: string;
  visitStats: DailyVisitStats;
  financialStats: DailyFinancialStats;
  doctorLoadStats: DoctorLoadStats[];
  roomOccupancyStats: RoomOccupancyStats;
  newClientStats: NewClientStats;
}

export interface ChangeMetric {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface DailyTrend {
  currentDate: string;
  previousDate: string;
  visitChange: ChangeMetric;
  incomeChange: ChangeMetric;
  averageCheckChange: ChangeMetric;
}

@Injectable()
export class DailyReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kunlik hisobotni olish
   */
  async getDailyReport(dto: GetDailyReportDto): Promise<DailyReport> {
    // 1. Sanani aniqlash (bugun agar kiritilmasa)
    const reportDate = dto.date ? new Date(dto.date) : new Date();
    const dateStr = reportDate.toISOString().split('T')[0];

    // 2. Kelajak sanani tekshirish
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reportDate > today) {
      throw new BadRequestException('RPT_002');
    }

    // 3. Kun boshi va oxiri
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 4. Barcha metrikalarni parallel hisoblash
    const [
      visitStats,
      financialStats,
      doctorLoadStats,
      roomOccupancyStats,
      newClientStats,
    ] = await Promise.all([
      this.getVisitStats(startOfDay, endOfDay),
      this.getFinancialStats(startOfDay, endOfDay),
      this.getDoctorLoadStats(startOfDay, endOfDay),
      this.getRoomOccupancyStats(startOfDay, endOfDay),
      this.getNewClientStats(startOfDay, endOfDay),
    ]);

    return {
      date: dateStr,
      visitStats,
      financialStats,
      doctorLoadStats,
      roomOccupancyStats,
      newClientStats,
    };
  }

  /**
   * Kunlik visit statistikasi
   */
  private async getVisitStats(
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<DailyVisitStats> {
    const totalVisits = await this.prisma.visit.count({
      where: {
        visit_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
    });

    const visitsByStatus = await this.prisma.visit.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        visit_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
    });

    const stats: DailyVisitStats = {
      totalVisits,
      completedVisits: 0,
      scheduledVisits: 0,
      cancelledVisits: 0,
      noShowVisits: 0,
      inProgressVisits: 0,
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
        case 'IN_PROGRESS':
          stats.inProgressVisits = item._count.id;
          break;
      }
    });

    return stats;
  }

  /**
   * Kunlik moliyaviy statistika
   */
  private async getFinancialStats(
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<DailyFinancialStats> {
    // Payment yig'indisi (INCOME)
    const paymentStats = await this.prisma.payment.aggregate({
      where: {
        payment_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        payment_type: 'INCOME',
        deleted_at: null,
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    // ClientPaid yig'indisi
    const prepaidStats = await this.prisma.clientPaid.aggregate({
      where: {
        payment_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
      _sum: { amount: true },
    });

    // Visit yig'indisi
    const visitStats = await this.prisma.visit.aggregate({
      where: {
        visit_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
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
    const averageCheck =
      visitStats._count.id > 0
        ? Math.round(
            ((visitStats._sum.total_amount?.toNumber() || 0) /
              visitStats._count.id) *
              100,
          ) / 100
        : 0;
    const totalDebt = visitStats._sum.debt_amount?.toNumber() || 0;

    return {
      totalIncome,
      totalPayment,
      totalPrepaid,
      averageCheck,
      totalDebt,
    };
  }

  /**
   * Shifokor yuklamasi statistikasi
   */
  private async getDoctorLoadStats(
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<DoctorLoadStats[]> {
    const doctorVisits = await this.prisma.visit.groupBy({
      by: ['doctor_id'],
      _count: { id: true },
      _sum: { total_amount: true },
      where: {
        visit_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
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
          startOfDay,
          endOfDay,
        );

        return {
          doctorId: item.doctor_id!,
          doctorName: doctor?.full_name || 'Noma\'lum',
          visitCount: item._count.id,
          totalAmount: item._sum.total_amount?.toNumber() || 0,
          commission,
        };
      }),
    );

    return stats.sort((a, b) => b.visitCount - a.visitCount);
  }

  /**
   * Shifokor komissiyasini hisoblash
   */
  private async calculateDoctorCommission(
    doctorId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const visitServices = await this.prisma.visitService.findMany({
      where: {
        visit: {
          doctor_id: doctorId,
          visit_date: {
            gte: startDate,
            lt: endDate,
          },
          deleted_at: null,
        },
        deleted_at: null,
      },
      include: {
        service: true,
      },
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
   * Xona bandligi statistikasi
   */
  private async getRoomOccupancyStats(
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<RoomOccupancyStats> {
    const totalRooms = await this.prisma.room.count({
      where: {
        record_status: 'ACTIVE',
        deleted_at: null,
      },
    });

    const roomUsage = await this.prisma.visitRoom.groupBy({
      by: ['room_id'],
      _count: { id: true },
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
    });

    const usedRooms = roomUsage.length;
    const occupancyRate =
      totalRooms > 0 ? (usedRooms / totalRooms) * 100 : 0;

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
        };
      }),
    );

    return {
      totalRooms,
      usedRooms,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      roomUsage: roomUsageDetails.sort((a, b) => b.usageCount - a.usageCount),
    };
  }

  /**
   * Yangi mijozlar statistikasi
   */
  private async getNewClientStats(
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<NewClientStats> {
    const totalNewClients = await this.prisma.client.count({
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
    });

    const bySource = await this.prisma.client.groupBy({
      by: ['source_id'],
      _count: { id: true },
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
        source_id: { not: null },
      },
    });

    const byGender = await this.prisma.client.groupBy({
      by: ['gender'],
      _count: { id: true },
      where: {
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
    });

    const sourceDetails = await Promise.all(
      bySource.map(async (item) => {
        const source = await this.prisma.source.findUnique({
          where: { id: item.source_id! },
          select: { id: true, name: true },
        });

        return {
          sourceId: item.source_id!,
          sourceName: source?.name || 'Noma\'lum',
          count: item._count.id,
        };
      }),
    );

    const genderDetails = byGender.map((item) => ({
      gender: item.gender,
      count: item._count.id,
    }));

    return {
      totalNewClients,
      bySource: sourceDetails,
      byGender: genderDetails,
    };
  }

  /**
   * Kunlik hisobot export (Excel)
   */
  async exportDailyReport(dto: ExportDailyReportDto): Promise<Buffer> {
    const report = await this.getDailyReport({ date: dto.date });

    if (dto.format === 'excel') {
      return this.generateExcel(report, dto.includeDetails);
    }

    throw new BadRequestException('RPT_006');
  }

  /**
   * Excel generatsiya
   */
  private async generateExcel(
    report: DailyReport,
    includeDetails?: boolean,
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    // Visit sheet
    const visitSheet = workbook.addWorksheet('Visitlar');
    visitSheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
    ];
    visitSheet.addRows([
      { metric: 'Jami Visitlar', value: report.visitStats.totalVisits },
      { metric: 'Yakunlangan', value: report.visitStats.completedVisits },
      { metric: 'Rejalashtirilgan', value: report.visitStats.scheduledVisits },
      { metric: 'Bekor qilingan', value: report.visitStats.cancelledVisits },
    ]);

    // Moliyaviy sheet
    const financeSheet = workbook.addWorksheet('Moliya');
    financeSheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Summa (so\'m)', key: 'value', width: 20 },
    ];
    financeSheet.addRows([
      { metric: 'Umumiy Kirim', value: report.financialStats.totalIncome },
      { metric: 'To\'lovlar', value: report.financialStats.totalPayment },
      { metric: 'Oldindan to\'lov', value: report.financialStats.totalPrepaid },
      { metric: 'O\'rtacha Check', value: report.financialStats.averageCheck },
      { metric: 'Qarz', value: report.financialStats.totalDebt },
    ]);

    // Shifokor sheet
    const doctorSheet = workbook.addWorksheet('Shifokorlar');
    doctorSheet.columns = [
      { header: 'Shifokor', key: 'name', width: 25 },
      { header: 'Visit Soni', key: 'visits', width: 15 },
      { header: 'Summa', key: 'amount', width: 20 },
      { header: 'Komissiya', key: 'commission', width: 20 },
    ];
    doctorSheet.addRows(
      report.doctorLoadStats.map((d) => ({
        name: d.doctorName,
        visits: d.visitCount,
        amount: d.totalAmount,
        commission: d.commission,
      })),
    );

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }

  /**
   * Kunlik trend (solishtirma)
   */
  async getDailyTrend(date: string, compareDays: number = 7): Promise<DailyTrend> {
    const currentDate = new Date(date);
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - compareDays);

    const currentReport = await this.getDailyReport({ date });
    const previousReport = await this.getDailyReport({
      date: previousDate.toISOString().split('T')[0],
    });

    const visitChange = this.calculateChange(
      currentReport.visitStats.totalVisits,
      previousReport.visitStats.totalVisits,
    );

    const incomeChange = this.calculateChange(
      currentReport.financialStats.totalIncome,
      previousReport.financialStats.totalIncome,
    );

    const averageCheckChange = this.calculateChange(
      currentReport.financialStats.averageCheck,
      previousReport.financialStats.averageCheck,
    );

    return {
      currentDate: date,
      previousDate: previousDate.toISOString().split('T')[0],
      visitChange,
      incomeChange,
      averageCheckChange,
    };
  }

  /**
   * O'zgarishni hisoblash
   */
  private calculateChange(current: number, previous: number): ChangeMetric {
    const change = current - previous;
    const changePercent =
      previous > 0 ? Math.round((change / previous) * 100 * 10) / 10 : 0;

    return {
      current,
      previous,
      change,
      changePercent,
    };
  }

  /**
   * Shifokor kunlik hisoboti
   */
  async getDoctorDailyReport(
    doctorId: number,
    date: string,
    currentUserId: number,
    currentUserRole: string,
  ): Promise<any> {
    // RBAC tekshiruvi
    if (
      currentUserRole !== 'Admin' &&
      currentUserRole !== 'Accountant' &&
      currentUserId !== doctorId
    ) {
      throw new BadRequestException('RPT_003');
    }

    const reportDate = new Date(date);
    const startOfDay = new Date(reportDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    const visits = await this.prisma.visit.findMany({
      where: {
        doctor_id: doctorId,
        visit_date: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deleted_at: null,
      },
      include: {
        client: { select: { id: true, full_name: true } },
        visit_services: { include: { service: true } },
      },
    });

    const visitDetails = await Promise.all(
      visits.map(async (visit) => {
        let commission = 0;

        for (const vs of visit.visit_services) {
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
              commission += serviceUser.value.toNumber() * vs.quantity;
            } else if (serviceUser.type === 'PERCENT') {
              commission +=
                (vs.service?.price.toNumber() || 0) *
                (serviceUser.value.toNumber() / 100) *
                vs.quantity;
            }
          }
        }

        return {
          visitId: visit.id,
          clientName: visit.client?.full_name || 'Noma\'lum',
          status: visit.status,
          totalAmount: visit.total_amount.toNumber(),
          commission,
        };
      }),
    );

    const totalAmount = visitDetails.reduce(
      (sum, v) => sum + v.totalAmount,
      0,
    );
    const totalCommission = visitDetails.reduce(
      (sum, v) => sum + v.commission,
      0,
    );

    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, full_name: true },
    });

    return {
      doctorId,
      doctor,
      date,
      visitCount: visits.length,
      totalAmount,
      commission: totalCommission,
      visits: visitDetails,
    };
  }
}
