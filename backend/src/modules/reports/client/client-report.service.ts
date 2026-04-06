import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetClientReportDto } from './dto/get-client-report.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ClientReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bitta mijoz hisoboti
   */
  async getClientReport(
    clientId: number,
    currentUserId: number,
    currentUserRole: string,
  ) {
    // RBAC tekshiruvi
    if (currentUserRole !== 'Admin' && currentUserRole !== 'Accountant') {
      if (currentUserRole === 'Doctor') {
        const hasVisit = await this.prisma.visit.findFirst({
          where: {
            client_id: clientId,
            doctor_id: currentUserId,
            deleted_at: null,
          },
        });

        if (!hasVisit) {
          throw new ForbiddenException('CR_001');
        }
      } else {
        throw new ForbiddenException('CR_001');
      }
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        group: { select: { id: true, name: true } },
        source: { select: { id: true, name: true } },
        region: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
      },
    });

    if (!client || client.deleted_at) {
      throw new NotFoundException('CR_002');
    }

    const [visitStats, financialStats, serviceStats, doctorStats, visitHistory, paymentHistory] =
      await Promise.all([
        this.calculateVisitStats(clientId),
        this.calculateFinancialStats(clientId),
        this.calculateServiceStats(clientId),
        this.calculateDoctorStats(clientId),
        this.getVisitHistory(clientId),
        this.getPaymentHistory(clientId),
      ]);

    return {
      clientId,
      clientInfo: {
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
        lastVisitAt: visitStats.lastVisitDate,
      },
      visitStats,
      financialStats,
      serviceStats,
      doctorStats,
      visitHistory,
      paymentHistory,
    };
  }

  private async calculateVisitStats(clientId: number) {
    const visits = await this.prisma.visit.findMany({
      where: { client_id: clientId, deleted_at: null },
      select: { id: true, status: true, visit_date: true },
      orderBy: { visit_date: 'asc' },
    });

    const totalVisits = visits.length;
    const completedVisits = visits.filter(
      (v) => v.status === 'COMPLETED' || v.status === 'DONE',
    ).length;
    const cancelledVisits = visits.filter((v) => v.status === 'CANCELLED').length;
    const noShowVisits = visits.filter((v) => v.status === 'NO_SHOW').length;

    const firstVisitDate = visits.length > 0 ? visits[0].visit_date : null;
    const lastVisitDate = visits.length > 0 ? visits[visits.length - 1].visit_date : null;

    let averageVisitsPerMonth = 0;
    if (firstVisitDate && lastVisitDate) {
      const monthsDiff = Math.max(
        1,
        Math.ceil(
          (lastVisitDate.getTime() - firstVisitDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30),
        ),
      );
      averageVisitsPerMonth = Math.round((totalVisits / monthsDiff) * 10) / 10;
    }

    return {
      totalVisits,
      completedVisits,
      cancelledVisits,
      noShowVisits,
      firstVisitDate,
      lastVisitDate,
      averageVisitsPerMonth,
    };
  }

  private async calculateFinancialStats(clientId: number) {
    const visitStats = await this.prisma.visit.aggregate({
      where: { client_id: clientId, deleted_at: null },
      _sum: { total_amount: true, paid_amount: true, debt_amount: true },
      _count: { id: true },
    });

    const prepaidStats = await this.prisma.clientPaid.aggregate({
      where: { client_id: clientId, deleted_at: null },
      _sum: { amount: true },
    });

    const paymentStats = await this.prisma.payment.aggregate({
      where: { client_id: clientId, payment_type: 'INCOME', deleted_at: null },
      _sum: { amount: true },
      _max: { payment_date: true },
    });

    const totalSpent = visitStats._sum.total_amount?.toNumber() || 0;
    const totalPaid =
      (visitStats._sum.paid_amount?.toNumber() || 0) +
      (paymentStats._sum.amount?.toNumber() || 0);
    const totalDebt = visitStats._sum.debt_amount?.toNumber() || 0;
    const totalPrepaid = prepaidStats._sum.amount?.toNumber() || 0;
    const averageCheck =
      visitStats._count.id > 0
        ? Math.round((totalSpent / visitStats._count.id) * 100) / 100
        : 0;

    return {
      totalSpent,
      totalPaid,
      totalDebt,
      totalPrepaid,
      averageCheck,
      lastPaymentDate: paymentStats._max.payment_date,
    };
  }

  private async calculateServiceStats(clientId: number) {
    const serviceStats = await this.prisma.visitService.groupBy({
      by: ['service_id'],
      _count: { id: true },
      _sum: { total: true },
      where: {
        visit: { client_id: clientId, deleted_at: null },
        deleted_at: null,
      },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const topServices = await Promise.all(
      serviceStats.map(async (item) => {
        const service = await this.prisma.service.findUnique({
          where: { id: item.service_id! },
          select: { id: true, name: true },
        });

        return {
          serviceId: item.service_id!,
          serviceName: service?.name || 'Noma\'lum',
          count: item._count.id,
          totalAmount: item._sum.total?.toNumber() || 0,
        };
      }),
    );

    return {
      totalServices: serviceStats.reduce((sum, item) => sum + item._count.id, 0),
      topServices,
    };
  }

  private async calculateDoctorStats(clientId: number) {
    const doctorStats = await this.prisma.visit.groupBy({
      by: ['doctor_id'],
      _count: { id: true },
      where: {
        client_id: clientId,
        deleted_at: null,
        doctor_id: { not: null },
      },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topDoctors = await Promise.all(
      doctorStats.map(async (item) => {
        const doctor = await this.prisma.user.findUnique({
          where: { id: item.doctor_id! },
          select: { id: true, full_name: true },
        });

        return {
          doctorId: item.doctor_id!,
          doctorName: doctor?.full_name || 'Noma\'lum',
          visitCount: item._count.id,
        };
      }),
    );

    return {
      totalDoctors: doctorStats.length,
      topDoctors,
    };
  }

  private async getVisitHistory(clientId: number, limit: number = 20) {
    const visits = await this.prisma.visit.findMany({
      where: { client_id: clientId, deleted_at: null },
      include: {
        doctor: { select: { id: true, full_name: true } },
        visit_services: { include: { service: { select: { id: true, name: true } } } },
      },
      orderBy: { visit_date: 'desc' },
      take: limit,
    });

    return visits.map((visit) => ({
      visitId: visit.id,
      visitDate: visit.visit_date,
      status: visit.status,
      totalAmount: visit.total_amount.toNumber(),
      paidAmount: visit.paid_amount.toNumber(),
      debtAmount: visit.debt_amount.toNumber(),
      doctorName: visit.doctor?.full_name || 'Noma\'lum',
      services: visit.visit_services.map((vs) => ({
        serviceId: vs.service_id!,
        serviceName: vs.service?.name || 'Noma\'lum',
        price: vs.price.toNumber(),
        quantity: vs.quantity,
        total: vs.total.toNumber(),
      })),
    }));
  }

  private async getPaymentHistory(clientId: number, limit: number = 20) {
    const payments = await this.prisma.payment.findMany({
      where: { client_id: clientId, deleted_at: null },
      orderBy: { payment_date: 'desc' },
      take: limit,
    });

    return payments.map((payment) => ({
      paymentId: payment.id,
      paymentDate: payment.payment_date,
      amount: payment.amount.toNumber(),
      paymentType: payment.payment_type,
      description: payment.description,
    }));
  }

  /**
   * Mijozlar ro'yxati
   */
  async getClientListReport(dto: GetClientReportDto) {
    const startDate = dto.start_date ? new Date(dto.start_date) : new Date();
    const endDate = dto.end_date ? new Date(dto.end_date) : new Date();
    const page = dto.page || 1;
    const limit = dto.limit || 20;

    const clients = await this.prisma.client.findMany({
      where: {
        deleted_at: null,
        created_at: { gte: startDate, lt: endDate },
        ...(dto.group_id && { group_id: dto.group_id }),
        ...(dto.source_id && { source_id: dto.source_id }),
        ...(dto.has_debt && {
          visits: {
            some: { debt_amount: { gt: 0 }, deleted_at: null },
          },
        }),
      },
      include: {
        group: { select: { id: true, name: true } },
        source: { select: { id: true, name: true } },
        _count: {
          select: {
            visits: {
              where: { deleted_at: null, visit_date: { gte: startDate, lt: endDate } },
            },
          },
        },
        visits: {
          where: { deleted_at: null },
          orderBy: { visit_date: 'desc' },
          take: 1,
          select: { visit_date: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalClients = await this.prisma.client.count({
      where: { deleted_at: null, created_at: { gte: startDate, lt: endDate } },
    });

    return {
      period: { from: startDate, to: endDate },
      totalClients,
      activeClients: clients.filter((c) => c.status === 'ACTIVE').length,
      newClients: clients.length,
      clients: clients.map((c) => ({
        clientId: c.id,
        fullName: c.full_name,
        phone: c.phone,
        group: c.group?.name || null,
        source: c.source?.name || null,
        totalVisits: c._count.visits,
        lastVisitDate: c.visits[0]?.visit_date || null,
        registeredAt: c.created_at,
      })),
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
   * Mijoz segmentatsiyasi
   */
  async getClientSegmentation() {
    const clients = await this.prisma.client.findMany({
      where: { deleted_at: null, status: 'ACTIVE' },
      select: { id: true, full_name: true, group_id: true, source_id: true, created_at: true },
    });

    const byGroup = await this.prisma.client.groupBy({
      by: ['group_id'],
      _count: { id: true },
      where: { deleted_at: null, status: 'ACTIVE', group_id: { not: null } },
    });

    const bySource = await this.prisma.client.groupBy({
      by: ['source_id'],
      _count: { id: true },
      where: { deleted_at: null, status: 'ACTIVE', source_id: { not: null } },
    });

    const groupDetails = await Promise.all(
      byGroup.map(async (item) => {
        const group = await this.prisma.clientGroup.findUnique({
          where: { id: item.group_id! },
          select: { id: true, name: true },
        });

        return {
          groupId: item.group_id!,
          groupName: group?.name || 'Noma\'lum',
          count: item._count.id,
          percentage:
            clients.length > 0
              ? Math.round((item._count.id / clients.length) * 100 * 10) / 10
              : 0,
        };
      }),
    );

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
          percentage:
            clients.length > 0
              ? Math.round((item._count.id / clients.length) * 100 * 10) / 10
              : 0,
        };
      }),
    );

    return {
      totalClients: clients.length,
      byGroup: groupDetails,
      bySource: sourceDetails,
    };
  }

  /**
   * Export Excel
   */
  async exportClientReport(clientId: number | null, dto: any): Promise<Buffer> {
    if (clientId) {
      const report = await this.getClientReport(clientId, 1, 'Admin');
      return this.generateClientExcel(report);
    } else {
      const report = await this.getClientListReport(dto);
      return this.generateListExcel(report);
    }
  }

  private async generateClientExcel(report: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const summarySheet = workbook.addWorksheet('Umumiy');
    summarySheet.columns = [
      { header: 'Ko\'rsatkich', key: 'metric', width: 30 },
      { header: 'Qiymat', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { metric: 'Mijoz', value: report.clientInfo.fullName },
      { metric: 'Telefon', value: report.clientInfo.phone },
      { metric: 'Jami Visitlar', value: report.visitStats.totalVisits },
      { metric: 'Jami Sarflangan', value: report.financialStats.totalSpent },
      { metric: 'Qarz', value: report.financialStats.totalDebt },
    ]);

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }

  private async generateListExcel(report: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    // workbook.properties.created = new Date();
    // workbook.properties.creator = 'Klinika CRM';

    const clientsSheet = workbook.addWorksheet('Mijozlar');
    clientsSheet.columns = [
      { header: 'Mijoz', key: 'name', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Guruh', key: 'group', width: 15 },
      { header: 'Visit Soni', key: 'visits', width: 15 },
    ];
    clientsSheet.addRows(
      report.clients.map((c: any) => ({
        name: c.fullName,
        phone: c.phone,
        group: c.group,
        visits: c.totalVisits,
      })),
    );

    return Buffer.from(await workbook.xlsx.writeBuffer() as any);
  }
}
