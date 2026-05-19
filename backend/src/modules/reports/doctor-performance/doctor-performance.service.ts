import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DoctorPerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getDoctorPerformance(
    doctorId: number,
    startDate: Date,
    endDate: Date,
    currentUserId: number,
    currentUserRole: string,
  ) {
    if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant' && currentUserId !== doctorId) {
      throw new ForbiddenException('DR_001');
    }

    const doctor = await this.prisma.user.findUnique({
      where: { id: doctorId },
      include: { role: true },
    });

    if (!doctor || doctor.deleted_at || doctor.role?.name !== 'Doctor') {
      throw new NotFoundException('DR_002');
    }

    const visits = await this.prisma.visit.findMany({
      where: {
        doctor_id: doctorId,
        visit_date: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      include: {
        client: { select: { id: true, created_at: true } },
        visit_services: { include: { service: true } },
      },
    });

    const basicMetrics = await this.calculateBasicMetrics(visits, doctorId, startDate, endDate);
    const financialMetrics = await this.calculateFinancialMetrics(visits, doctorId, startDate, endDate);
    const serviceMetrics = await this.calculateServiceMetrics(visits);
    const timeMetrics = await this.calculateTimeMetrics(visits);
    const visitStatusMetrics = this.calculateVisitStatusMetrics(visits);

    return {
      doctorId,
      doctorName: doctor.full_name,
      period: { from: startDate, to: endDate },
      basicMetrics,
      financialMetrics,
      serviceMetrics,
      timeMetrics,
      visitStatusMetrics,
    };
  }

  private async calculateBasicMetrics(visits: any[], doctorId: number, startDate: Date, endDate: Date) {
    const totalVisits = visits.length;
    const completedVisits = visits.filter((v) => v.status === 'COMPLETED' || v.status === 'DONE').length;
    const cancelledVisits = visits.filter((v) => v.status === 'CANCELLED').length;
    const noShowVisits = visits.filter((v) => v.status === 'NO_SHOW').length;

    const uniquePatients = new Set(visits.map((v) => v.client_id));
    const totalPatients = uniquePatients.size;

    const newPatients = await this.prisma.visit.count({
      where: {
        doctor_id: doctorId,
        client_id: { in: Array.from(uniquePatients) },
        visit_date: { lt: startDate },
        deleted_at: null,
      },
      // distinct: ['client_id'],
    });

    const returningPatients = totalPatients - newPatients;

    return { totalVisits, completedVisits, cancelledVisits, noShowVisits, totalPatients, newPatients, returningPatients };
  }

  private async calculateFinancialMetrics(visits: any[], doctorId: number, startDate: Date, endDate: Date) {
    const totalRevenue = visits.reduce((sum, v) => sum + v.total_amount.toNumber(), 0);
    let commission = 0;

    for (const visit of visits) {
      for (const vs of visit.visit_services) {
        const serviceUser = await this.prisma.serviceUser.findFirst({
          where: { service_id: vs.service_id, user_id: doctorId, status: 'ACTIVE', deleted_at: null },
        });

        if (serviceUser) {
          if (serviceUser.type === 'FIXED') {
            commission += serviceUser.value.toNumber() * vs.quantity;
          } else if (serviceUser.type === 'PERCENT') {
            commission += vs.service.price.toNumber() * (serviceUser.value.toNumber() / 100) * vs.quantity;
          }
        }
      }
    }

    const averageCheck = visits.length > 0 ? Math.round((totalRevenue / visits.length) * 100) / 100 : 0;
    const averageCommission = visits.length > 0 ? Math.round((commission / visits.length) * 100) / 100 : 0;

    return { totalRevenue, commission, averageCheck, averageCommission };
  }

  private async calculateServiceMetrics(visits: any[]) {
    const serviceStats = new Map();
    for (const visit of visits) {
      for (const vs of visit.visit_services) {
        if (!serviceStats.has(vs.service_id)) {
          serviceStats.set(vs.service_id, { count: 0, revenue: 0 });
        }
        const stat = serviceStats.get(vs.service_id);
        stat.count += vs.quantity;
        stat.revenue += vs.total.toNumber();
      }
    }

    const topServices = await Promise.all(
      Array.from(serviceStats.entries())
        .sort((a: any, b: any) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(async ([serviceId, stat]: [any, any]) => {
          const service = await this.prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true, name: true },
          });

          return {
            serviceId,
            serviceName: service?.name || 'Noma\'lum',
            count: stat.count,
            revenue: stat.revenue,
            commission: 0,
          };
        }),
    );

    return { totalServices: visits.reduce((sum, v) => sum + v.visit_services.length, 0), topServices };
  }

  private async calculateTimeMetrics(visits: any[]) {
    const visitRooms = await this.prisma.visitRoom.findMany({
      where: { visit_id: { in: visits.map((v: any) => v.id) }, deleted_at: null },
      select: { started_at: true, ended_at: true },
    });

    let totalMinutes = 0;
    let validRooms = 0;

    for (const room of visitRooms) {
      if (room.started_at && room.ended_at) {
        const duration = (new Date(room.ended_at).getTime() - new Date(room.started_at).getTime()) / 60000;
        totalMinutes += duration;
        validRooms++;
      }
    }

    const averageVisitDuration = validRooms > 0 ? Math.round((totalMinutes / validRooms) * 10) / 10 : 0;
    const workingDays = 30;
    const workingHours = workingDays * 8;
    const efficiency = workingHours > 0 ? Math.min(Math.round((totalMinutes / 60 / workingHours) * 100 * 10) / 10, 100) : 0;

    return { averageVisitDuration, workingHours, efficiency };
  }

  private calculateVisitStatusMetrics(visits: any[]) {
    const total = visits.length;
    const completed = visits.filter((v) => v.status === 'COMPLETED' || v.status === 'DONE').length;
    const cancelled = visits.filter((v) => v.status === 'CANCELLED').length;
    const noShow = visits.filter((v) => v.status === 'NO_SHOW').length;

    return {
      completionRate: total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100 * 10) / 10 : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100 * 10) / 10 : 0,
    };
  }

  async getDoctorRanking(startDate: Date, endDate: Date, limit: number = 10) {
    // Visitlarda doctor_id sifatida ishlatilgan barcha foydalanuvchilarni olamiz
    const doctorVisitRows = await this.prisma.visit.findMany({
      where: {
        visit_date: { gte: startDate, lte: endDate },
        deleted_at: null,
        doctor_id: { not: null },
      },
      select: { doctor_id: true },
      distinct: ['doctor_id'],
    });

    const doctorIds = doctorVisitRows.map((v) => v.doctor_id!);

    const doctors = doctorIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: doctorIds }, deleted_at: null },
          select: { id: true, full_name: true },
        })
      : [];

    const rankings = await Promise.all(
      doctors.map(async (doctor) => {
        const performance = await this.getDoctorPerformance(doctor.id, startDate, endDate, doctor.id, 'Admin');
        const score = this.calculateDoctorScore(performance);

        return {
          doctorId: doctor.id,
          doctorName: doctor.full_name,
          totalVisits: performance.basicMetrics.totalVisits,
          totalRevenue: performance.financialMetrics.totalRevenue,
          commission: performance.financialMetrics.commission,
          completionRate: performance.visitStatusMetrics.completionRate,
          score,
        };
      }),
    );

    rankings.sort((a, b) => b.score - a.score);

    return {
      period: { from: startDate, to: endDate },
      rankings: rankings.slice(0, limit).map((item, index) => ({ ...item, rank: index + 1 })),
    };
  }

  private calculateDoctorScore(performance: any): number {
    const weights = { visits: 0.3, revenue: 0.3, completion: 0.2, efficiency: 0.2 };
    const visitScore = Math.min(performance.basicMetrics.totalVisits / 10, 100);
    const revenueScore = Math.min(performance.financialMetrics.totalRevenue / 10000000, 100);
    const completionScore = performance.visitStatusMetrics.completionRate;
    const efficiencyScore = performance.timeMetrics.efficiency;

    return Math.round(visitScore * weights.visits + revenueScore * weights.revenue + completionScore * weights.completion + efficiencyScore * weights.efficiency) * 10 / 10;
  }

  async exportDoctorPerformance(dto: any): Promise<Buffer> {
    const performance = await this.getDoctorPerformance(dto.doctorId, new Date(dto.start_date + 'T00:00:00'), new Date(dto.end_date + 'T23:59:59.999'), 1, 'Admin');
    return this.generateExcel(performance);
  }

  private async generateExcel(performance: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const summarySheet = workbook.addWorksheet('Umumiy');
    summarySheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { metric: 'Shifokor', value: performance.doctorName },
      { metric: 'Jami Visitlar', value: performance.basicMetrics.totalVisits },
      { metric: 'Jami Daromad', value: performance.financialMetrics.totalRevenue },
      { metric: 'Komissiya', value: performance.financialMetrics.commission },
      { metric: 'Yakunlash Foizi', value: `${performance.visitStatusMetrics.completionRate}%` },
    ]);

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }
}
