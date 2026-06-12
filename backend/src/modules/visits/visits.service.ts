import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Visit } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import {
  UpdateVisitDto,
  UpdateVisitStatusDto,
  AddVisitServiceDto,
  AssignVisitRoomDto,
  LinkVisitReferralDto,
  CreateVisitPaymentDto,
} from './dto/update-visit.dto';

const visitSelect = {
  id: true,
  client_id: true,
  doctor_id: true,
  status: true,
  total_amount: true,
  paid_amount: true,
  debt_amount: true,
  description: true,
  visit_date: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  registered_by: true,
  modified_by: true,
  client: {
    select: {
      id: true,
      full_name: true,
      phone: true,
    },
  },
  doctor: {
    select: {
      id: true,
      full_name: true,
    },
  },
} satisfies Prisma.VisitSelect;

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Yangi visit yaratish
   */
  async create(dto: CreateVisitDto, userId: number = 1) {
    // 1. Client mavjudligini tekshirish
    const client = await this.prisma.client.findUnique({
      where: { id: dto.client_id },
    });

    if (!client || client.deleted_at) {
      throw new NotFoundException('Mijoz topilmadi');
    }

    // 2. Doctor mavjudligini tekshirish (agar kiritilgan bo'lsa)
    if (dto.doctor_id) {
      const doctor = await this.prisma.user.findUnique({
        where: { id: dto.doctor_id },
        include: { role: true },
      });

      if (!doctor || doctor.deleted_at || doctor.status !== 'ACTIVE') {
        throw new NotFoundException('Shifokor topilmadi yoki faol emas');
      }
      if (!doctor.role || (doctor.role.name !== 'Doctor' && doctor.role.name !== 'Nurse')) {
        throw new NotFoundException(`Foydalanuvchi roli "${doctor.role?.name || 'N/A'}" - faqat Doctor yoki Nurse roli tanlash mumkin`);
      }
    }

    // 3. Room mavjudligini tekshirish (agar kiritilgan bo'lsa)
    if (dto.room_id) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.room_id },
      });

      if (!room || room.deleted_at || room.record_status !== 'ACTIVE') {
        throw new NotFoundException('Xona topilmadi');
      }
    }

    // 4. Services mavjudligini tekshirish (agar kiritilgan bo'lsa)
    if (dto.service_ids && dto.service_ids.length > 0) {
      const services = await this.prisma.service.findMany({
        where: { id: { in: dto.service_ids } },
      });

      if (services.length !== dto.service_ids.length) {
        throw new NotFoundException('Ba\'zi xizmatlar topilmadi');
      }
    }

    // 5. Visit yaratish
    const visit = await this.prisma.visit.create({
      data: {
        client_id: dto.client_id,
        doctor_id: dto.doctor_id,
        status: dto.status || 'SCHEDULED',
        visit_date: dto.visit_date ? new Date(dto.visit_date) : new Date(),
        description: dto.description,
        total_amount: 0,
        paid_amount: 0,
        debt_amount: 0,
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      select: visitSelect,
    });

    // 6. Room biriktirish (agar kiritilgan bo'lsa)
    if (dto.room_id) {
      await this.prisma.visitRoom.create({
        data: {
          visit_id: visit.id,
          room_id: dto.room_id,
          status: 'ASSIGNED',
          started_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
          registered_by: userId,
        },
      });

      await this.prisma.room.update({
        where: { id: dto.room_id },
        data: { status: 'OCCUPIED', updated_at: new Date() },
      });
    }

    // 7. Xizmatlar biriktirish (agar kiritilgan bo'lsa)
    if (dto.service_ids && dto.service_ids.length > 0) {
      for (const serviceId of dto.service_ids) {
        const service = await this.prisma.service.findUnique({
          where: { id: serviceId },
        });

        if (service && !service.deleted_at) {
          await this.prisma.visitService.create({
            data: {
              visit_id: visit.id,
              service_id: serviceId,
              price: Number(service.price),
              quantity: 1,
              total: Number(service.price),
              created_at: new Date(),
              updated_at: new Date(),
              registered_by: userId,
            },
          });
        }
      }
    }

    // 8. Visit miqdorlarini qayta hisoblash
    await this.recalculateVisitAmounts(visit.id);

    // 9. Updated visitni qaytarish
    const updatedVisit = await this.prisma.visit.findUnique({
      where: { id: visit.id },
      select: visitSelect,
    });

    return {
      success: true,
      message: 'Visit muvaffaqiyatli yaratildi',
      data: updatedVisit,
    };
  }

  /**
   * Visitlar ro'yxatini olish (pagination bilan)
   */
  async findMany(query: any) {
    const where: any = { deleted_at: null };

    // Client filter
    if (query.client_id) {
      where.client_id = Number(query.client_id);
    }

    // Doctor filter
    if (query.doctor_id) {
      where.doctor_id = Number(query.doctor_id);
    }

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Date range filter
    if (query.date_from || query.date_to) {
      where.visit_date = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lt: query.date_to ? new Date(new Date(query.date_to).setHours(23, 59, 59, 999)) : undefined,
      };
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Sorting
    const orderBy = {
      [query.sortBy || 'visit_date']: query.sortOrder || 'desc',
    };

    const [data, total] = await Promise.all([
      this.prisma.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...visitSelect,
          _count: {
            select: {
              visit_services: { where: { deleted_at: null } },
              payments: { where: { deleted_at: null } },
            },
          },
        },
      }),
      this.prisma.visit.count({ where }),
    ]);

    return {
      success: true,
      message: 'Visitlar ro\'yxati muvaffaqiyatli olindi',
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
   * Bitta visitni olish
   */
  async findOne(id: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id },
      select: {
        ...visitSelect,
        visit_services: {
          where: { deleted_at: null },
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        visit_rooms: {
          where: { deleted_at: null },
          include: {
            room: {
              select: {
                id: true,
                name: true,
                room_number: true,
              },
            },
          },
        },
        visit_referrals: {
          where: { deleted_at: null },
          include: {
            referral: {
              select: {
                id: true,
                full_name: true,
                phone: true,
              },
            },
          },
        },
        payments: {
          where: { deleted_at: null },
          orderBy: { payment_date: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            visit_services: { where: { deleted_at: null } },
            visit_rooms: { where: { deleted_at: null } },
            visit_referrals: { where: { deleted_at: null } },
            payments: { where: { deleted_at: null } },
          },
        },
      },
    });

    if (!visit || visit.deleted_at) {
      throw new NotFoundException('Visit topilmadi');
    }

    return {
      success: true,
      message: 'Visit ma\'lumotlari olindi',
      data: visit,
    };
  }

  /**
   * Visit yangilash
   */
  async update(id: number, dto: UpdateVisitDto, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(id);

    // 2. Doctor mavjudligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.doctor_id && dto.doctor_id !== visit.doctor_id) {
      const doctor = await this.prisma.user.findUnique({
        where: { id: dto.doctor_id },
        include: { role: true },
      });

      if (!doctor || doctor.deleted_at || doctor.status !== 'ACTIVE') {
        throw new NotFoundException('Shifokor topilmadi yoki faol emas');
      }
      if (!doctor.role || (doctor.role.name !== 'Doctor' && doctor.role.name !== 'Nurse')) {
        throw new NotFoundException(`Foydalanuvchi roli "${doctor.role?.name || 'N/A'}" - faqat Doctor yoki Nurse roli tanlash mumkin`);
      }
    }

    // 3. Visit yangilash
    const updated = await this.prisma.visit.update({
      where: { id },
      data: {
        ...dto,
        visit_date: dto.visit_date ? new Date(dto.visit_date) : undefined,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: visitSelect,
    });

    return {
      success: true,
      message: 'Visit muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  /**
   * Visit status o'zgartirish
   */
  async updateStatus(id: number, dto: UpdateVisitStatusDto, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(id);

    // 2. Status o'zgarish qoidalarini tekshirish
    const statusTransitions: any = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: ['DONE'],
      CANCELLED: [],
      NO_SHOW: [],
      DONE: [],
    };

    if (!statusTransitions[visit.status].includes(dto.status)) {
      throw new BadRequestException(`Status o'zgarishi mumkin emas: ${visit.status} → ${dto.status}`);
    }

    // 3. Status yangilash
    const updated = await this.prisma.visit.update({
      where: { id },
      data: {
        status: dto.status,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: visitSelect,
    });

    return {
      success: true,
      message: 'Visit status muvaffaqiyatli o\'zgartirildi',
      data: updated,
    };
  }

  /**
   * Helper: Visitni raw formatda topish
   */
  private async findRaw(id: number): Promise<Visit> {
    const row = await this.prisma.visit.findUnique({
      where: { id },
    });
    if (!row || row.deleted_at) throw new NotFoundException('Visit topilmadi');
    return row;
  }

  /**
   * Visitga xizmat qo'shish
   */
  async addService(visitId: number, dto: AddVisitServiceDto, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(visitId);

    // 2. Visit status tekshirish (faqat SCHEDULED yoki IN_PROGRESS)
    if (!['SCHEDULED', 'IN_PROGRESS'].includes(visit.status)) {
      throw new BadRequestException('Visit status xizmat qo\'shish uchun emas');
    }

    // 3. Service mavjudligini tekshirish
    const service = await this.prisma.service.findUnique({
      where: { id: dto.service_id },
    });

    if (!service || service.deleted_at) {
      throw new NotFoundException('Xizmat topilmadi');
    }

    // 4. VisitService yaratish
    const quantity = dto.quantity || 1;
    const price = dto.price || Number(service.price);
    const total = price * quantity;

    const visitService = await this.prisma.visitService.create({
      data: {
        visit_id: visitId,
        service_id: dto.service_id,
        price: price,
        quantity: quantity,
        total: total,
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 5. Visit total_amount yangilash
    await this.recalculateVisitAmounts(visitId);

    return {
      success: true,
      message: 'Xizmat muvaffaqiyatli qo\'shildi',
      data: visitService,
    };
  }

  /**
   * Visitga xona ajratish
   */
  async assignRoom(visitId: number, dto: AssignVisitRoomDto, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(visitId);

    // 2. Xona topish (agar room_id kiritilgan bo'lmasa, AVAILABLE xonani topish)
    let roomId = dto.room_id;

    if (!roomId) {
      const availableRoom = await this.prisma.room.findFirst({
        where: {
          status: 'AVAILABLE',
          record_status: 'ACTIVE',
          deleted_at: null,
        },
      });

      if (!availableRoom) {
        throw new BadRequestException('Bo\'sh xona topilmadi');
      }

      roomId = availableRoom.id;
    }

    // 3. VisitRoom yaratish
    const visitRoom = await this.prisma.visitRoom.create({
      data: {
        visit_id: visitId,
        room_id: roomId,
        status: 'ASSIGNED',
        started_at: dto.started_at ? new Date(dto.started_at) : new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            room_number: true,
          },
        },
      },
    });

    // 4. Room status yangilash (OCCUPIED)
    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        status: 'OCCUPIED',
        updated_at: new Date(),
      },
    });

    return {
      success: true,
      message: 'Xona muvaffaqiyatli ajratildi',
      data: visitRoom,
    };
  }

  /**
   * Visitga tavsiya biriktirish
   */
  async linkReferral(visitId: number, dto: LinkVisitReferralDto, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(visitId);

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
   * Visit yakunlash
   */
  async complete(visitId: number, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(visitId);

    // 2. Status tekshirish
    if (visit.status === 'COMPLETED' || visit.status === 'DONE') {
      throw new BadRequestException('Visit allaqachon yakunlangan');
    }

    // 3. Visit miqdorlarini qayta hisoblash
    await this.recalculateVisitAmounts(visitId);

    // 4. Visit status COMPLETED ga o'zgartirish
    const updatedVisit = await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'COMPLETED',
        updated_at: new Date(),
        modified_by: userId,
      },
      select: visitSelect,
    });

    // 5. VisitRoom status COMPLETED ga o'zgartirish va Room bo'shatish
    await this.prisma.visitRoom.updateMany({
      where: { visit_id: visitId, deleted_at: null },
      data: {
        status: 'COMPLETED',
        ended_at: new Date(),
        updated_at: new Date(),
      },
    });

    // 6. Room status AVAILABLE ga qaytarish
    const visitRooms = await this.prisma.visitRoom.findMany({
      where: { visit_id: visitId },
      select: { room_id: true },
    });

    const roomIds = visitRooms.map(r => r.room_id).filter(Boolean) as number[];
    if (roomIds.length > 0) {
      await this.prisma.room.updateMany({
        where: { id: { in: roomIds } },
        data: {
          status: 'AVAILABLE',
          updated_at: new Date(),
        },
      });
    }

    return {
      success: true,
      message: 'Visit muvaffaqiyatli yakunlandi',
      data: updatedVisit,
    };
  }

  /**
   * Visit to'lov yaratish
   */
  async createPayment(visitId: number, dto: CreateVisitPaymentDto, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    const visit = await this.findRaw(visitId);

    // 2. Joriy qarzni qayta hisoblash (ClientPaid ham hisobga olinadi)
    await this.recalculateVisitAmounts(visitId);
    const freshVisit = await this.findRaw(visitId);
    const currentDebt = Number(freshVisit.debt_amount);

    if (currentDebt <= 0) {
      throw new BadRequestException('Visit to\'liq to\'langan, qarz qolmagan');
    }
    if (dto.amount > currentDebt) {
      throw new BadRequestException(`To'lov summasi qarzdan oshmasligi kerak. Joriy qarz: ${currentDebt} so'm`);
    }

    // 3. Payment yaratish
    const payment = await this.prisma.payment.create({
      data: {
        visit_id: visitId,
        client_id: visit.client_id,
        user_id: userId,
        amount: dto.amount,
        payment_type: 'INCOME',
        description: dto.description,
        payment_date: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        visit: {
          select: {
            id: true,
            total_amount: true,
          },
        },
      },
    });

    // 4. Visit miqdorlarini qayta hisoblash
    await this.recalculateVisitAmounts(visitId);

    // 5. Client balance yangilash
    await this.updateClientBalance(Number(visit.client_id));

    // 6. Agar to'liq to'langan bo'lsa, Visit status DONE ga o'zgartirish
    const updatedVisit = await this.prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (updatedVisit && Number(updatedVisit.debt_amount) <= 0 && updatedVisit.status === 'COMPLETED') {
      await this.prisma.visit.update({
        where: { id: visitId },
        data: {
          status: 'DONE',
          updated_at: new Date(),
        },
      });
    }

    return {
      success: true,
      message: 'To\'lov muvaffaqiyatli yaratildi',
      data: payment,
    };
  }

  /**
   * Visit bekor qilish (Soft Delete)
   */
  async remove(visitId: number, userId: number = 1) {
    // 1. Visit mavjudligini tekshirish
    await this.findRaw(visitId);

    // 2. Soft Delete
    const deleted = await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'CANCELLED',
        deleted_at: new Date(),
        modified_by: userId,
        updated_at: new Date(),
      },
      select: visitSelect,
    });

    return {
      success: true,
      message: 'Visit muvaffaqiyatli bekor qilindi',
      data: deleted,
    };
  }

  /**
   * Visit xizmatlarini olish
   */
  async getServices(visitId: number) {
    await this.findRaw(visitId);

    const data = await this.prisma.visitService.findMany({
      where: { visit_id: visitId, deleted_at: null },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Visit xizmatlari olindi',
      data,
    };
  }

  /**
   * Visit xonalarini olish
   */
  async getRooms(visitId: number) {
    await this.findRaw(visitId);

    const data = await this.prisma.visitRoom.findMany({
      where: { visit_id: visitId, deleted_at: null },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            room_number: true,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Visit xonalari olindi',
      data,
    };
  }

  /**
   * Visit to'lovlarini olish
   */
  async getPayments(visitId: number) {
    await this.findRaw(visitId);

    const data = await this.prisma.payment.findMany({
      where: { visit_id: visitId, deleted_at: null },
      orderBy: { payment_date: 'desc' },
    });

    return {
      success: true,
      message: 'Visit to\'lovlari olindi',
      data,
    };
  }

  /**
   * Visit miqdorlarini qayta hisoblash
   */
  private async recalculateVisitAmounts(visitId: number): Promise<void> {
    const [services, payments, clientPaid] = await Promise.all([
      this.prisma.visitService.aggregate({
        where: { visit_id: visitId, deleted_at: null },
        _sum: { total: true },
      }),
      this.prisma.payment.aggregate({
        where: { visit_id: visitId, deleted_at: null, payment_type: 'INCOME' },
        _sum: { amount: true },
      }),
      this.prisma.clientPaid.aggregate({
        where: { visit_id: visitId, deleted_at: null },
        _sum: { amount: true },
      }),
    ]);

    const total_amount = Number(services._sum.total || 0);
    const paid_amount = Number(payments._sum.amount || 0) + Number(clientPaid._sum.amount || 0);
    const debt_amount = total_amount - paid_amount;

    // Visit yangilash
    await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        total_amount,
        paid_amount,
        debt_amount,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Client balance ni yangilash
   */
  private async updateClientBalance(clientId: number): Promise<void> {
    // Barcha visitlarning debt_amount yig'indisi
    const visits = await this.prisma.visit.aggregate({
      where: { client_id: clientId, deleted_at: null },
      _sum: { debt_amount: true },
    });

    // Barcha ClientPaid yozuvlarining amount yig'indisi
    const clientPaid = await this.prisma.clientPaid.aggregate({
      where: { client_id: clientId, deleted_at: null },
      _sum: { amount: true },
    });

    // Barcha Payment (INCOME) yozuvlarining amount yig'indisi
    const payments = await this.prisma.payment.aggregate({
      where: { client_id: clientId, deleted_at: null, payment_type: 'INCOME' },
      _sum: { amount: true },
    });

    const totalDebt = Number(visits._sum.debt_amount || 0);
    const totalPrepaid = Number(clientPaid._sum.amount || 0);
    const totalPaid = Number(payments._sum.amount || 0);
    const balance = totalPrepaid + totalPaid - totalDebt;

    // Client yangilash
    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        balance,
        updated_at: new Date(),
      },
    });
  }
}
