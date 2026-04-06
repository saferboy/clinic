import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Referral } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

const referralSelect = {
  id: true,
  full_name: true,
  phone: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  registered_by: true,
  modified_by: true,
  _count: {
    select: {
      visit_referrals: { where: { deleted_at: null } },
    },
  },
} satisfies Prisma.ReferralSelect;

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Yangi tavsiya yaratish
   */
  async create(dto: CreateReferralDto, userId: number = 1) {
    // 2. Tavsiya yaratish
    const referral = await this.prisma.referral.create({
      data: {
        full_name: dto.full_name,
        phone: dto.phone,
        description: dto.description,
        status: dto.status || 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      select: referralSelect,
    });

    return {
      success: true,
      message: 'Tavsiya muvaffaqiyatli yaratildi',
      data: referral,
    };
  }

  /**
   * Tavsiyalar ro'yxatini olish (pagination bilan)
   */
  async findMany(query: any) {
    const where: any = { deleted_at: null };

    // Phone filter
    if (query.phone) {
      where.phone = {
        contains: query.phone.replace(/\D/g, ''),
        mode: 'insensitive',
      };
    }

    // Full name search
    if (query.full_name) {
      where.full_name = {
        contains: query.full_name,
        mode: 'insensitive',
      };
    }

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Sorting
    const orderBy = {
      [query.sortBy || 'created_at']: query.sortOrder || 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: referralSelect,
      }),
      this.prisma.referral.count({ where }),
    ]);

    return {
      success: true,
      message: 'Tavsiyalar ro\'yxati muvaffaqiyatli olindi',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Tavsiya statistikasi
   */
  async getStatistics() {
    const statistics = await this.prisma.visitReferral.groupBy({
      by: ['referral_id'],
      _count: {
        visit_id: true,
      },
      where: {
        deleted_at: null,
      },
    });

    // Referral ma'lumotlarini qo'shish
    const result = await Promise.all(
      statistics.map(async (stat) => {
        const referral = await this.prisma.referral.findUnique({
          where: { id: Number(stat.referral_id) },
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        });

        return {
          referral_id: stat.referral_id,
          full_name: referral?.full_name || 'Noma\'lum',
          phone: referral?.phone || null,
          visit_count: stat._count.visit_id,
        };
      }),
    );

    // Sort by visit count (descending)
    result.sort((a, b) => b.visit_count - a.visit_count);

    return {
      success: true,
      message: 'Tavsiya statistikasi olindi',
      data: result,
    };
  }

  /**
   * Bitta tavsiyani olish
   */
  async findOne(id: number) {
    const referral = await this.prisma.referral.findUnique({
      where: { id },
      select: {
        ...referralSelect,
      },
    });

    if (!referral || referral.deleted_at) {
      throw new NotFoundException('Tavsiya topilmadi');
    }

    return {
      success: true,
      message: 'Tavsiya ma\'lumotlari olindi',
      data: referral,
    };
  }

  /**
   * Tavsiya yangilash
   */
  async update(id: number, dto: UpdateReferralDto, userId: number = 1) {
    // 1. Tavsiya mavjudligini tekshirish
    const referral = await this.findRaw(id);

    // 2. Phone unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.phone && dto.phone !== referral.phone) {
      const existing = await this.prisma.referral.findFirst({
        where: {
          phone: dto.phone,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existing) {
        throw new ConflictException('Bu telefon raqam allaqachon mavjud');
      }
    }

    // 3. Tavsiya yangilash
    const updated = await this.prisma.referral.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: referralSelect,
    });

    return {
      success: true,
      message: 'Tavsiya muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  /**
   * Visitga tavsiya biriktirish
   */
  async linkToVisit(visitId: number, dto: { referral_id: number }, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visit || visit.deleted_at) {
      throw new NotFoundException('Visit topilmadi');
    }

    // 2. Referral mavjudligini tekshirish
    const referral = await this.prisma.referral.findUnique({
      where: { id: dto.referral_id },
    });

    if (!referral || referral.deleted_at) {
      throw new NotFoundException('Tavsiya topilmadi');
    }

    // 3. Duplicate tekshiruvi (bir visitga bir tavsiya)
    const existing = await this.prisma.visitReferral.findFirst({
      where: {
        visit_id: visitId,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Visitga allaqachon tavsiya biriktirilgan');
    }

    // 4. VisitReferral yaratish
    const visitReferral = await this.prisma.visitReferral.create({
      data: {
        visit_id: visitId,
        referral_id: dto.referral_id,
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        referral: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Tavsiya visitga muvaffaqiyatli biriktirildi',
      data: visitReferral,
    };
  }

  /**
   * Tavsiya o'chirish (Soft Delete)
   */
  async remove(id: number, userId: number = 1) {
    // 1. Tavsiya mavjudligini tekshirish
    await this.findRaw(id);

    // 2. Bog'liq VisitReferral yozuvlarini tekshirish
    const visitReferralCount = await this.prisma.visitReferral.count({
      where: {
        referral_id: id,
        deleted_at: null,
      },
    });

    // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
    if (visitReferralCount > 0) {
      console.warn(
        `Referral ${id} has ${visitReferralCount} visit referrals. These records will be cascade deleted.`,
      );
    }

    // 4. Soft Delete
    const deleted = await this.prisma.referral.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deleted_at: new Date(),
        modified_by: userId,
        updated_at: new Date(),
      },
      select: referralSelect,
    });

    return {
      success: true,
      message: 'Tavsiya muvaffaqiyatli o\'chirildi',
      data: deleted,
    };
  }

  /**
   * Helper: Tavsiyani raw formatda topish
   */
  private async findRaw(id: number): Promise<Referral> {
    const row = await this.prisma.referral.findUnique({
      where: { id },
    });
    if (!row || row.deleted_at) throw new NotFoundException('Tavsiya topilmadi');
    return row;
  }
}
