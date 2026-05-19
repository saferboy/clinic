import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetServiceReportDto, GetServiceRankingDto } from './dto/get-service-report.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ServiceReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getServiceReport(dto: GetServiceReportDto) {
    const startDate = new Date(dto.start_date + 'T00:00:00');
    const endDate = new Date(dto.end_date + 'T23:59:59.999');

    const visitServices = await this.prisma.visitService.findMany({
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      include: {
        service: { include: { department: { select: { id: true, name: true } } } },
        visit: { select: { id: true, doctor_id: true, visit_date: true, doctor: { select: { id: true, full_name: true } } } },
      },
    });

    const summary = this.calculateSummary(visitServices, startDate, endDate);
    const topServices = await this.getTopServices(visitServices);
    const byDepartment = await this.getByDepartment(visitServices);
    const byDoctor = await this.getByDoctor(visitServices);

    return {
      period: { from: startDate, to: endDate },
      summary,
      topServices,
      byDepartment,
      byDoctor,
    };
  }

  private calculateSummary(visitServices: any[], startDate: Date, endDate: Date) {
    const totalServices = visitServices.reduce((sum, vs) => sum + vs.quantity, 0);
    const totalRevenue = visitServices.reduce((sum, vs) => sum + vs.total.toNumber(), 0);
    const uniqueServices = new Set(visitServices.map((vs) => vs.service_id)).size;
    const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalServices,
      totalRevenue,
      averagePrice: totalServices > 0 ? Math.round((totalRevenue / totalServices) * 100) / 100 : 0,
      averagePerDay: Math.round((totalServices / daysDiff) * 10) / 10,
      uniqueServices,
      totalCommission: 0,
    };
  }

  private async getTopServices(visitServices: any[], limit: number = 10) {
    const serviceStats = new Map();
    for (const vs of visitServices) {
      if (!serviceStats.has(vs.service_id)) {
        serviceStats.set(vs.service_id, {
          count: 0,
          revenue: 0,
          serviceName: vs.service.name,
          departmentName: vs.service.department?.name || 'Noma\'lum',
        });
      }
      const stat = serviceStats.get(vs.service_id);
      stat.count += vs.quantity;
      stat.revenue += vs.total.toNumber();
    }

    const totalRevenue = visitServices.reduce((sum, vs) => sum + vs.total.toNumber(), 0);

    return Array.from(serviceStats.entries())
      .sort((a: any, b: any) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([serviceId, stat]: [any, any]) => ({
        serviceId,
        serviceName: stat.serviceName,
        departmentName: stat.departmentName,
        count: stat.count,
        revenue: stat.revenue,
        percentage: totalRevenue > 0 ? Math.round((stat.revenue / totalRevenue) * 100 * 10) / 10 : 0,
        averagePrice: stat.count > 0 ? Math.round((stat.revenue / stat.count) * 100) / 100 : 0,
      }));
  }

  private async getByDepartment(visitServices: any[]) {
    const deptStats = new Map();
    for (const vs of visitServices) {
      const deptId = vs.service.department_id;
      if (!deptId) continue;
      if (!deptStats.has(deptId)) {
        deptStats.set(deptId, {
          serviceCount: 0,
          revenue: 0,
          departmentName: vs.service.department?.name || 'Noma\'lum',
          services: new Map(),
        });
      }
      const dept = deptStats.get(deptId);
      dept.serviceCount += vs.quantity;
      dept.revenue += vs.total.toNumber();
    }

    const totalRevenue = visitServices.reduce((sum, vs) => sum + vs.total.toNumber(), 0);

    return Array.from(deptStats.entries())
      .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
      .map(([deptId, stat]: [any, any]) => ({
        departmentId: deptId,
        departmentName: stat.departmentName,
        serviceCount: stat.serviceCount,
        revenue: stat.revenue,
        percentage: totalRevenue > 0 ? Math.round((stat.revenue / totalRevenue) * 100 * 10) / 10 : 0,
      }));
  }

  private async getByDoctor(visitServices: any[]) {
    const doctorStats = new Map();
    for (const vs of visitServices) {
      const doctorId = vs.visit.doctor_id;
      if (!doctorId) continue;
      if (!doctorStats.has(doctorId)) {
        doctorStats.set(doctorId, {
          serviceCount: 0,
          revenue: 0,
          doctorName: vs.visit.doctor?.full_name || 'Noma\'lum',
        });
      }
      const doctor = doctorStats.get(doctorId);
      doctor.serviceCount += vs.quantity;
      doctor.revenue += vs.total.toNumber();
    }

    return Array.from(doctorStats.entries())
      .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
      .map(([doctorId, stat]: [any, any]) => ({
        doctorId,
        doctorName: stat.doctorName,
        serviceCount: stat.serviceCount,
        revenue: stat.revenue,
      }));
  }

  async getServiceRanking(dto: GetServiceRankingDto) {
    const startDate = new Date(dto.start_date + 'T00:00:00');
    const endDate = new Date(dto.end_date + 'T23:59:59.999');
    const limit = dto.limit || 10;

    const serviceStats = await this.prisma.visitService.groupBy({
      by: ['service_id'],
      _count: { id: true },
      _sum: { total: true, quantity: true },
      where: {
        created_at: { gte: startDate, lt: endDate },
        deleted_at: null,
      },
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    const totalRevenue = serviceStats.reduce((sum, s) => sum + (s._sum.total?.toNumber() || 0), 0);

    const rankings = await Promise.all(
      serviceStats.map(async (item, index) => {
        const service = await this.prisma.service.findUnique({
          where: { id: item.service_id! },
          include: { department: { select: { id: true, name: true } } },
        });

        return {
          rank: index + 1,
          serviceId: item.service_id!,
          serviceName: service?.name || 'Noma\'lum',
          departmentName: service?.department?.name || 'Noma\'lum',
          count: Number(item._sum.quantity) || 0,
          revenue: Number(item._sum.total) || 0,
          percentage: totalRevenue > 0 ? Math.round(((Number(item._sum.total) || 0) / totalRevenue) * 100 * 10) / 10 : 0,
        };
      }),
    );

    return { period: { from: startDate, to: endDate }, rankings };
  }

  async exportServiceReport(dto: any): Promise<Buffer> {
    const report = await this.getServiceReport(dto);
    return this.generateExcel(report);
  }

  private async generateExcel(report: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const summarySheet = workbook.addWorksheet('Umumiy');
    summarySheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { metric: 'Jami Xizmatlar', value: report.summary.totalServices },
      { metric: 'Jami Daromad', value: report.summary.totalRevenue },
      { metric: 'O\'rtacha Narx', value: report.summary.averagePrice },
    ]);

    const topSheet = workbook.addWorksheet('Top Xizmatlar');
    topSheet.columns = [
      { header: 'Xizmat', key: 'name', width: 30 },
      { header: 'Bo\'lim', key: 'dept', width: 20 },
      { header: 'Soni', key: 'count', width: 15 },
      { header: 'Daromad', key: 'revenue', width: 20 },
    ];
    topSheet.addRows(
      report.topServices.map((s: any) => ({
        name: s.serviceName,
        dept: s.departmentName,
        count: s.count,
        revenue: s.revenue,
      })),
    );

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }
}
