import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetReferralReportDto } from './dto/get-referral-report.dto';

@Injectable()
export class ReferralReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReferralReport(dto: GetReferralReportDto) {
    const now = new Date();
    const startDate = dto.start_date
      ? new Date(dto.start_date)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = dto.end_date ? new Date(dto.end_date) : now;

    const visitReferrals = await this.prisma.visitReferral.findMany({
      where: {
        created_at: { gte: startDate, lte: endDate },
        deleted_at: null,
        referral_id: { not: null },
      },
      include: {
        referral: { select: { id: true, full_name: true, phone: true } },
        visit: {
          select: {
            id: true,
            total_amount: true,
            client_id: true,
            visit_date: true,
          },
        },
      },
    });

    const referralMap = new Map<
      number,
      {
        referralId: number;
        referralName: string;
        phone: string;
        clientIds: Set<number>;
        visitCount: number;
        totalRevenue: number;
      }
    >();

    for (const vr of visitReferrals) {
      if (!vr.referral_id || !vr.referral) continue;

      if (!referralMap.has(vr.referral_id)) {
        referralMap.set(vr.referral_id, {
          referralId: vr.referral_id,
          referralName: vr.referral.full_name,
          phone: vr.referral.phone || '',
          clientIds: new Set(),
          visitCount: 0,
          totalRevenue: 0,
        });
      }

      const ref = referralMap.get(vr.referral_id)!;
      ref.visitCount += 1;
      if (vr.visit?.client_id) ref.clientIds.add(vr.visit.client_id);
      ref.totalRevenue += vr.visit?.total_amount?.toNumber() || 0;
    }

    const referrals = Array.from(referralMap.values())
      .map((r) => ({
        referralId: r.referralId,
        referralName: r.referralName,
        phone: r.phone,
        clientCount: r.clientIds.size,
        visitCount: r.visitCount,
        totalRevenue: r.totalRevenue,
        averageRevenue:
          r.visitCount > 0 ? Math.round(r.totalRevenue / r.visitCount) : 0,
      }))
      .sort((a, b) => b.visitCount - a.visitCount);

    const totalVisits = referrals.reduce((sum, r) => sum + r.visitCount, 0);
    const totalRevenue = referrals.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalClients = new Set(
      visitReferrals
        .filter((vr) => vr.visit?.client_id)
        .map((vr) => vr.visit!.client_id!),
    ).size;

    // Manba hisoboti (source stats)
    const sourceStats = await this.getSourceStats(startDate, endDate);

    return {
      period: { from: startDate, to: endDate },
      summary: {
        totalReferrals: referrals.length,
        totalVisits,
        totalClients,
        totalRevenue,
      },
      referrals,
      sourceStats,
    };
  }

  private async getSourceStats(startDate: Date, endDate: Date) {
    const clients = await this.prisma.client.findMany({
      where: {
        created_at: { gte: startDate, lte: endDate },
        deleted_at: null,
        source_id: { not: null },
      },
      select: {
        source_id: true,
        source: { select: { id: true, name: true } },
      },
    });

    const sourceMap = new Map<
      number,
      { sourceName: string; clientCount: number }
    >();

    for (const client of clients) {
      if (!client.source_id || !client.source) continue;
      if (!sourceMap.has(client.source_id)) {
        sourceMap.set(client.source_id, {
          sourceName: client.source.name,
          clientCount: 0,
        });
      }
      sourceMap.get(client.source_id)!.clientCount += 1;
    }

    const total = clients.length;

    return Array.from(sourceMap.entries())
      .map(([sourceId, stat]) => ({
        sourceId,
        sourceName: stat.sourceName,
        clientCount: stat.clientCount,
        percentage:
          total > 0 ? Math.round((stat.clientCount / total) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.clientCount - a.clientCount);
  }
}
