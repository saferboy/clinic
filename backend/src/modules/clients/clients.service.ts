import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Prisma, Client } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

const clientSelect = {
  id: true,
  full_name: true,
  phone: true,
  group_id: true,
  gender: true,
  date_of_birth: true,
  region_id: true,
  district_id: true,
  address: true,
  balance: true,
  description: true,
  source_id: true,
  status: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  registered_by: true,
  modified_by: true,
  group: {
    select: {
      id: true,
      name: true,
    },
  },
  region: {
    select: {
      id: true,
      name: true,
    },
  },
  district: {
    select: {
      id: true,
      name: true,
    },
  },
  source: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ClientSelect;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Phone raqamni normalizatsiya qilish
   */
  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('998')) {
      return '+' + digits;
    }

    if (digits.length === 9) {
      return '+998' + digits;
    }

    throw new BadRequestException('CLI_006');
  }

  /**
   * Yangi mijoz yaratish
   */
  async create(dto: CreateClientDto, userId: number = 1) {
    // 1. Phone formatini tekshirish va normalizatsiya
    const normalizedPhone = this.normalizePhone(dto.phone);

    // 2. Mavjud mijozni telefon raqam bo'yicha tekshirish
    const existingClient = await this.prisma.client.findFirst({
      where: {
        phone: normalizedPhone,
        deleted_at: null,
      },
    });

    if (existingClient) {
      throw new ConflictException('Bu telefon raqam allaqachon mavjud');
    }

    // 3. Reference ma'lumotlarni tekshirish (agar kiritilgan bo'lsa)
    if (dto.group_id) {
      const group = await this.prisma.clientGroup.findUnique({
        where: { id: dto.group_id },
      });
      if (!group || group.deleted_at) {
        throw new NotFoundException('Mijoz guruhi topilmadi');
      }
    }

    if (dto.region_id) {
      const region = await this.prisma.locRegion.findUnique({
        where: { id: dto.region_id },
      });
      if (!region || region.deleted_at) {
        throw new NotFoundException('Viloyat topilmadi');
      }
    }

    if (dto.district_id) {
      const district = await this.prisma.locDistrict.findUnique({
        where: { id: dto.district_id },
      });
      if (!district || district.deleted_at) {
        throw new NotFoundException('Tuman topilmadi');
      }
    }

    if (dto.source_id) {
      const source = await this.prisma.source.findUnique({
        where: { id: dto.source_id },
      });
      if (!source || source.deleted_at) {
        throw new NotFoundException('Manba topilmadi');
      }
    }

    // 4. Mijoz yaratish
    const client = await this.prisma.client.create({
      data: {
        full_name: dto.full_name,
        phone: normalizedPhone,
        group_id: dto.group_id,
        gender: dto.gender,
        date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : null,
        region_id: dto.region_id,
        district_id: dto.district_id,
        address: dto.address,
        balance: 0,
        source_id: dto.source_id,
        description: dto.description,
        status: dto.status || 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      select: clientSelect,
    });

    return {
      success: true,
      message: 'Mijoz muvaffaqiyatli yaratildi',
      data: client,
    };
  }

  /**
   * Mijozlar ro'yxatini olish (pagination bilan)
   */
  async findMany(query: any) {
    const where: any = { deleted_at: null };

    // Phone filter
    if (query.phone) {
      where.phone = this.normalizePhone(query.phone);
    }

    // Full name search
    if (query.full_name) {
      where.full_name = {
        contains: query.full_name,
        mode: 'insensitive',
      };
    }

    // Group filter
    if (query.group_id) {
      where.group_id = parseInt(query.group_id);
    }

    // Region filter
    if (query.region_id) {
      where.region_id = parseInt(query.region_id);
    }

    // District filter
    if (query.district_id) {
      where.district_id = parseInt(query.district_id);
    }

    // Source filter
    if (query.source_id) {
      where.source_id = parseInt(query.source_id);
    }

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Gender filter
    if (query.gender) {
      where.gender = query.gender;
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // Sorting
    const orderBy = {
      [query.sortBy || 'created_at']: query.sortOrder || 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...clientSelect,
          _count: {
            select: {
              visits: { where: { deleted_at: null } },
              payments: { where: { deleted_at: null } },
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      success: true,
      message: 'Mijozlar ro\'yxati muvaffaqiyatli olindi',
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
   * Mijozlar statistikasini olish
   */
  async getStats() {
    const [
      total,
      active,
      inactive,
      archived,
      male,
      female,
      debtClients,
    ] = await Promise.all([
      this.prisma.client.count({ where: { deleted_at: null } }),
      this.prisma.client.count({ where: { deleted_at: null, status: 'ACTIVE' } }),
      this.prisma.client.count({ where: { deleted_at: null, status: 'INACTIVE' } }),
      this.prisma.client.count({ where: { deleted_at: null, status: 'ARCHIVED' } }),
      this.prisma.client.count({ where: { deleted_at: null, gender: 'MALE' } }),
      this.prisma.client.count({ where: { deleted_at: null, gender: 'FEMALE' } }),
      this.prisma.client.count({
        where: {
          deleted_at: null,
          balance: { lt: 0 },
        },
      }),
    ]);

    return {
      success: true,
      message: 'Mijozlar statistikasi olindi',
      data: {
        total,
        active,
        inactive,
        archived,
        male,
        female,
        debt: debtClients,
      },
    };
  }

  /**
   * Mijozlarni qidirish (telefon yoki ism bo'yicha)
   */
  async search(query: { phone?: string; full_name?: string; limit?: number }) {
    const where: any = { deleted_at: null };

    // Phone search
    if (query.phone) {
      const normalizedPhone = this.normalizePhone(query.phone);
      where.phone = {
        contains: normalizedPhone.replace('+', ''),
      };
    }

    // Full name search
    if (query.full_name) {
      where.full_name = {
        contains: query.full_name,
        mode: 'insensitive',
      };
    }

    const take = Math.min(query.limit || 10, 50);

    const data = await this.prisma.client.findMany({
      where,
      take,
      select: {
        id: true,
        full_name: true,
        phone: true,
        balance: true,
        status: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      message: 'Mijozlar qidiruv natijalari',
      data,
    };
  }

  /**
   * Bitta mijozni olish
   */
  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: {
        ...clientSelect,
        visits: {
          where: { deleted_at: null },
          take: 10,
          orderBy: { visit_date: 'desc' },
          select: {
            id: true,
            status: true,
            total_amount: true,
            paid_amount: true,
            debt_amount: true,
            visit_date: true,
            doctor: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
        payments: {
          where: { deleted_at: null },
          take: 10,
          orderBy: { payment_date: 'desc' },
          select: {
            id: true,
            amount: true,
            payment_type: true,
            payment_date: true,
            description: true,
          },
        },
        _count: {
          select: {
            visits: { where: { deleted_at: null } },
            payments: { where: { deleted_at: null } },
          },
        },
      },
    });

    if (!client || client.deleted_at) {
      throw new NotFoundException('Mijoz topilmadi');
    }

    return {
      success: true,
      message: 'Mijoz ma\'lumotlari olindi',
      data: client,
    };
  }

  /**
   * Mijozni yangilash
   */
  async update(id: number, dto: UpdateClientDto, userId: number = 1) {
    // 1. Mijoz mavjudligini tekshirish
    const client = await this.findRaw(id);

    // 2. Phone unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.phone && dto.phone !== client.phone) {
      const normalizedPhone = this.normalizePhone(dto.phone);

      const existingClient = await this.prisma.client.findFirst({
        where: {
          phone: normalizedPhone,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingClient) {
        throw new ConflictException('Bu telefon raqam allaqachon mavjud');
      }

      dto.phone = normalizedPhone;
    }

    // 3. Reference ma'lumotlarni tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.group_id) {
      const group = await this.prisma.clientGroup.findUnique({
        where: { id: dto.group_id },
      });
      if (!group || group.deleted_at) {
        throw new NotFoundException('Mijoz guruhi topilmadi');
      }
    }

    if (dto.region_id) {
      const region = await this.prisma.locRegion.findUnique({
        where: { id: dto.region_id },
      });
      if (!region || region.deleted_at) {
        throw new NotFoundException('Viloyat topilmadi');
      }
    }

    if (dto.district_id) {
      const district = await this.prisma.locDistrict.findUnique({
        where: { id: dto.district_id },
      });
      if (!district || district.deleted_at) {
        throw new NotFoundException('Tuman topilmadi');
      }
    }

    if (dto.source_id) {
      const source = await this.prisma.source.findUnique({
        where: { id: dto.source_id },
      });
      if (!source || source.deleted_at) {
        throw new NotFoundException('Manba topilmadi');
      }
    }

    // 4. Mijoz yangilash
    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        ...dto,
        date_of_birth: dto.date_of_birth ? new Date(dto.date_of_birth) : undefined,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: clientSelect,
    });

    return {
      success: true,
      message: 'Mijoz muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  /**
   * Mijozni o'chirish (Soft Delete)
   */
  async remove(id: number, userId: number = 1) {
    // 1. Mijoz mavjudligini tekshirish
    await this.findRaw(id);

    // 2. Bog'liq yozuvlarni tekshirish
    const visitCount = await this.prisma.visit.count({
      where: { client_id: id, deleted_at: null },
    });

    const paymentCount = await this.prisma.payment.count({
      where: { client_id: id, deleted_at: null },
    });

    // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
    if (visitCount > 0 || paymentCount > 0) {
      console.warn(
        `Client ${id} has ${visitCount} visits and ${paymentCount} payments. These records will remain but client will be inactive.`,
      );
    }

    // 4. Soft Delete
    const deleted = await this.prisma.client.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deleted_at: new Date(),
        modified_by: userId,
        updated_at: new Date(),
      },
      select: clientSelect,
    });

    return {
      success: true,
      message: 'Mijoz muvaffaqiyatli o\'chirildi',
      data: deleted,
    };
  }

  /**
   * Mijoz balance ini olish
   */
  async getBalance(id: number) {
    await this.findRaw(id);

    // Barcha visitlarning debt_amount yig'indisi
    const visits = await this.prisma.visit.aggregate({
      where: { client_id: id, deleted_at: null },
      _sum: {
        debt_amount: true,
        total_amount: true,
        paid_amount: true,
      },
    });

    // Barcha ClientPaid yozuvlarining amount yig'indisi
    const clientPaid = await this.prisma.clientPaid.aggregate({
      where: { client_id: id, deleted_at: null },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Barcha Payment (INCOME) yozuvlarining amount yig'indisi
    const payments = await this.prisma.payment.aggregate({
      where: { client_id: id, deleted_at: null, payment_type: 'INCOME' },
      _sum: { amount: true },
      _count: { id: true },
    });

    const totalDebt = Number(visits._sum.debt_amount || 0);
    const totalPrepaid = Number(clientPaid._sum.amount || 0);
    const totalPaid = Number(payments._sum.amount || 0);
    const balance = totalPrepaid + totalPaid - totalDebt;

    return {
      success: true,
      message: 'Mijoz balance ma\'lumotlari olindi',
      data: {
        clientId: id,
        totalPrepaid: Number(totalPrepaid),
        totalPaid: Number(totalPaid),
        totalDebt: Number(totalDebt),
        balance: Number(balance),
        prepaidCount: clientPaid._count.id,
        paymentCount: payments._count.id,
        visitTotalAmount: Number(visits._sum.total_amount || 0),
        visitPaidAmount: Number(visits._sum.paid_amount || 0),
      },
    };
  }

  /**
   * Mijoz visitlarini olish
   */
  async getVisits(clientId: number, query: any) {
    await this.findRaw(clientId);

    const where: any = { client_id: clientId, deleted_at: null };

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { visit_date: 'desc' },
        select: {
          id: true,
          status: true,
          total_amount: true,
          paid_amount: true,
          debt_amount: true,
          visit_date: true,
          description: true,
          doctor: {
            select: {
              id: true,
              full_name: true,
            },
          },
        },
      }),
      this.prisma.visit.count({ where }),
    ]);

    return {
      success: true,
      message: 'Mijoz visitlari olindi',
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
   * Mijoz to'lovlarini olish
   */
  async getPayments(clientId: number, query: any) {
    await this.findRaw(clientId);

    const where: any = { client_id: clientId, deleted_at: null };

    // Payment type filter
    if (query.payment_type) {
      where.payment_type = query.payment_type;
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { payment_date: 'desc' },
        select: {
          id: true,
          amount: true,
          payment_type: true,
          payment_date: true,
          description: true,
          visit: {
            select: {
              id: true,
              total_amount: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      success: true,
      message: 'Mijoz to\'lovlari olindi',
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
   * Helper: Mijozni raw formatda topish
   */
  private async findRaw(id: number): Promise<Client> {
    const row = await this.prisma.client.findFirst({
      where: { id, deleted_at: null },
    });
    if (!row) throw new NotFoundException('Mijoz topilmadi');
    return row;
  }

  /**
   * Barcha mijozlarni Excelga eksport qilish
   */
  async exportAll(query: any) {
    const where: any = { deleted_at: null };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.gender && query.gender !== 'ALL') {
      where.gender = query.gender;
    }
    if (query.group_id && query.group_id !== 'ALL') {
      where.group_id = Number(query.group_id);
    }
    if (query.full_name) {
      where.full_name = { contains: query.full_name, mode: 'insensitive' };
    }

    const clients = await this.prisma.client.findMany({
      where,
      include: {
        group: { select: { name: true } },
        region: { select: { name: true } },
        district: { select: { name: true } },
        source: { select: { name: true } },
        _count: { select: { visits: true, payments: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Clinic';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Mijozlar');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'To\'liq ism', key: 'full_name', width: 25 },
      { header: 'Telefon', key: 'phone', width: 15 },
      { header: 'Jins', key: 'gender', width: 10 },
      { header: 'Tug\'ilgan sana', key: 'date_of_birth', width: 14 },
      { header: 'Manzil', key: 'address', width: 30 },
      { header: 'Viloyat', key: 'region', width: 15 },
      { header: 'Tuman', key: 'district', width: 15 },
      { header: 'Guruh', key: 'group', width: 12 },
      { header: 'Manba', key: 'source', width: 12 },
      { header: 'Balans', key: 'balance', width: 12 },
      { header: 'Tashriflar soni', key: 'visits', width: 12 },
      { header: 'Holat', key: 'status', width: 10 },
      { header: 'Yaratilgan sana', key: 'created_at', width: 16 },
    ];

    for (const client of clients) {
      sheet.addRow({
        id: client.id,
        full_name: client.full_name,
        phone: client.phone,
        gender: client.gender === 'MALE' ? 'Erkak' : client.gender === 'FEMALE' ? 'Ayol' : 'Boshqa',
        date_of_birth: client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString('uz-UZ') : '',
        address: client.address || '',
        region: client.region?.name || '',
        district: client.district?.name || '',
        group: client.group?.name || '',
        source: client.source?.name || '',
        balance: Number(client.balance),
        visits: client._count?.visits || 0,
        status: client.status === 'ACTIVE' ? 'Faol' : client.status === 'INACTIVE' ? 'Nofaol' : 'Arxiv',
        created_at: new Date(client.created_at).toLocaleString('uz-UZ'),
      });
    }

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    sheet.getRow(1).alignment = { horizontal: 'center' };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
