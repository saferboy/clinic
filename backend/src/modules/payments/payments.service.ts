import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateClientPaidDto } from './dto/create-client-paid.dto';
import { CreateOtherPaidGroupDto, UpdateOtherPaidGroupDto } from './dto/create-other-paid-group.dto';
import { CreateOtherPaidDto } from './dto/create-other-paid.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ----------------------------------------------------------------
  // Payment
  // ----------------------------------------------------------------

  async createPayment(dto: CreatePaymentDto, userId: number = 1) {
    // Visit mavjudligi va amount validatsiyasi
    if (dto.visit_id) {
      const visit = await this.prisma.visit.findUnique({
        where: { id: dto.visit_id },
      });

      if (!visit || visit.deleted_at) {
        throw new NotFoundException('Visit topilmadi');
      }

      if (dto.payment_type === 'INCOME') {
        const debtAmount = Number(visit.debt_amount);
        if (debtAmount <= 0) {
          throw new BadRequestException("Bu visit uchun qarz mavjud emas");
        }
        if (dto.amount > debtAmount) {
          throw new BadRequestException(
            `To'lov summasi qarzdan oshib ketdi. Maksimal: ${debtAmount} so'm`,
          );
        }
      }
    }

    const payment = await this.prisma.payment.create({
      data: {
        payment_type: dto.payment_type,
        amount: dto.amount,
        description: dto.description,
        client_id: dto.client_id,
        visit_id: dto.visit_id,
        user_id: dto.user_id,
        payment_date: dto.payment_date ? new Date(dto.payment_date) : new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        client: {
          select: { id: true, full_name: true, phone: true },
        },
        register_user: {
          select: { id: true, full_name: true },
        },
      },
    });

    // Visit bilan bog'liq bo'lsa, visit miqdorlarini yangilash
    if (dto.visit_id) {
      await this.recalculateVisitAmounts(dto.visit_id);
    }

    // Client balance yangilash
    if (dto.client_id) {
      await this.updateClientBalance(dto.client_id);
    }

    return {
      success: true,
      message: "To'lov muvaffaqiyatli yaratildi",
      data: payment,
    };
  }

  async findPayments(query: any) {
    const where: any = { deleted_at: null };

    if (query.payment_type) {
      where.payment_type = query.payment_type;
    }

    if (query.client_id) {
      where.client_id = Number(query.client_id);
    }

    if (query.date_from || query.date_to) {
      where.payment_date = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to
          ? new Date(new Date(query.date_to).setHours(23, 59, 59, 999))
          : undefined,
      };
    }

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { payment_date: 'desc' },
        include: {
          client: {
            select: { id: true, full_name: true, phone: true },
          },
          register_user: {
            select: { id: true, full_name: true },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      success: true,
      message: "To'lovlar ro'yxati muvaffaqiyatli olindi",
      data: {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPaymentSummary(date_from?: string, date_to?: string) {
    const dateFilter =
      date_from || date_to
        ? {
            gte: date_from ? new Date(date_from) : undefined,
            lte: date_to
              ? new Date(new Date(date_to).setHours(23, 59, 59, 999))
              : undefined,
          }
        : undefined;

    const paymentWhere: any = { deleted_at: null };
    const clientPaidWhere: any = { deleted_at: null };
    const otherPaidWhere: any = { deleted_at: null };

    if (dateFilter) {
      paymentWhere.payment_date = dateFilter;
      clientPaidWhere.payment_date = dateFilter;
      otherPaidWhere.payment_date = dateFilter;
    }

    const [
      paymentIncomeAgg,
      paymentOutcomeAgg,
      clientPaidAgg,
      otherPaidIncomeAgg,
      otherPaidOutcomeAgg,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...paymentWhere, payment_type: 'INCOME' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.payment.aggregate({
        where: { ...paymentWhere, payment_type: 'OUTCOME' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.clientPaid.aggregate({
        where: clientPaidWhere,
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.otherPaid.aggregate({
        where: { ...otherPaidWhere, type: 'INCOME' },
        _sum: { amount: true },
        _count: { id: true },
      }),
      this.prisma.otherPaid.aggregate({
        where: { ...otherPaidWhere, type: 'OUTCOME' },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const paymentIncome = Number(paymentIncomeAgg._sum.amount || 0);
    const paymentOutcome = Number(paymentOutcomeAgg._sum.amount || 0);
    const clientPaidIncome = Number(clientPaidAgg._sum.amount || 0);
    const otherPaidIncome = Number(otherPaidIncomeAgg._sum.amount || 0);
    const otherPaidOutcome = Number(otherPaidOutcomeAgg._sum.amount || 0);

    const totalIncome = paymentIncome + clientPaidIncome + otherPaidIncome;
    const totalOutcome = paymentOutcome + otherPaidOutcome;
    const count =
      (paymentIncomeAgg._count.id || 0) +
      (paymentOutcomeAgg._count.id || 0) +
      (clientPaidAgg._count.id || 0) +
      (otherPaidIncomeAgg._count.id || 0) +
      (otherPaidOutcomeAgg._count.id || 0);

    return {
      success: true,
      message: "To'lov xulosasi olindi",
      data: {
        totalIncome,
        totalOutcome,
        netBalance: totalIncome - totalOutcome,
        count,
        by_type: {
          payment: { income: paymentIncome, outcome: paymentOutcome },
          client_paid: { income: clientPaidIncome, outcome: 0 },
          other_paid: { income: otherPaidIncome, outcome: otherPaidOutcome },
        },
      },
    };
  }

  async findPaymentById(id: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, full_name: true, phone: true },
        },
        register_user: {
          select: { id: true, full_name: true },
        },
      },
    });

    if (!payment || payment.deleted_at) {
      throw new NotFoundException("To'lov topilmadi");
    }

    return {
      success: true,
      message: "To'lov ma'lumotlari olindi",
      data: payment,
    };
  }

  async removePayment(id: number) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.deleted_at) {
      throw new NotFoundException("To'lov topilmadi");
    }

    const deleted = await this.prisma.payment.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    // Visit bilan bog'liq bo'lsa, visit miqdorlarini yangilash
    if (deleted.visit_id) {
      await this.recalculateVisitAmounts(deleted.visit_id);
    }

    // Client balance yangilash
    if (deleted.client_id) {
      await this.updateClientBalance(deleted.client_id);
    }

    return {
      success: true,
      message: "To'lov muvaffaqiyatli o'chirildi",
      data: null,
    };
  }

  // ----------------------------------------------------------------
  // ClientPaid
  // ----------------------------------------------------------------

  async createClientPaid(dto: CreateClientPaidDto, userId: number = 1) {
    const clientPaid = await this.prisma.clientPaid.create({
      data: {
        client_id: dto.client_id,
        amount: dto.amount,
        visit_id: dto.visit_id,
        description: dto.description,
        payment_date: dto.payment_date ? new Date(dto.payment_date) : new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        client: {
          select: { id: true, full_name: true, phone: true },
        },
      },
    });

    // Visit bilan bog'liq bo'lsa, visit miqdorlarini yangilash
    if (dto.visit_id) {
      await this.recalculateVisitAmounts(dto.visit_id);
    }

    // Client balance yangilash
    if (dto.client_id) {
      await this.updateClientBalance(dto.client_id);
    }

    return {
      success: true,
      message: "Mijoz to'lovi muvaffaqiyatli yaratildi",
      data: clientPaid,
    };
  }

  async findClientPaid(query: any) {
    const where: any = { deleted_at: null };

    if (query.client_id) {
      where.client_id = Number(query.client_id);
    }

    if (query.visit_id) {
      where.visit_id = Number(query.visit_id);
    }

    if (query.date_from || query.date_to) {
      where.payment_date = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to
          ? new Date(new Date(query.date_to).setHours(23, 59, 59, 999))
          : undefined,
      };
    }

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.clientPaid.findMany({
        where,
        skip,
        take: limit,
        orderBy: { payment_date: 'desc' },
        include: {
          client: {
            select: { id: true, full_name: true, phone: true },
          },
        },
      }),
      this.prisma.clientPaid.count({ where }),
    ]);

    return {
      success: true,
      message: "Mijoz to'lovlari ro'yxati olindi",
      data: { data, total },
    };
  }

  async removeClientPaid(id: number) {
    const record = await this.prisma.clientPaid.findUnique({ where: { id } });
    if (!record || record.deleted_at) {
      throw new NotFoundException("Mijoz to'lovi topilmadi");
    }

    const deleted = await this.prisma.clientPaid.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    if (deleted.visit_id) {
      await this.recalculateVisitAmounts(deleted.visit_id);
    }

    // Client balance yangilash
    if (deleted.client_id) {
      await this.updateClientBalance(deleted.client_id);
    }

    return {
      success: true,
      message: "Mijoz to'lovi muvaffaqiyatli o'chirildi",
      data: null,
    };
  }

  // ----------------------------------------------------------------
  // OtherPaidGroup
  // ----------------------------------------------------------------

  async createOtherPaidGroup(dto: CreateOtherPaidGroupDto, userId: number = 1) {
    const group = await this.prisma.otherPaidGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
    });

    return {
      success: true,
      message: "Guruh muvaffaqiyatli yaratildi",
      data: group,
    };
  }

  async findOtherPaidGroups() {
    const data = await this.prisma.otherPaidGroup.findMany({
      where: { deleted_at: null },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      message: "Guruhlar ro'yxati olindi",
      data,
    };
  }

  async updateOtherPaidGroup(id: number, dto: UpdateOtherPaidGroupDto, userId: number = 1) {
    const group = await this.prisma.otherPaidGroup.findUnique({ where: { id } });
    if (!group || group.deleted_at) {
      throw new NotFoundException('Guruh topilmadi');
    }

    const updated = await this.prisma.otherPaidGroup.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
        modified_by: userId,
      },
    });

    return {
      success: true,
      message: 'Guruh muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  async removeOtherPaidGroup(id: number) {
    const group = await this.prisma.otherPaidGroup.findUnique({ where: { id } });
    if (!group || group.deleted_at) {
      throw new NotFoundException('Guruh topilmadi');
    }

    await this.prisma.otherPaidGroup.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    return {
      success: true,
      message: "Guruh muvaffaqiyatli o'chirildi",
      data: null,
    };
  }

  // ----------------------------------------------------------------
  // OtherPaid
  // ----------------------------------------------------------------

  async createOtherPaid(dto: CreateOtherPaidDto, userId: number = 1) {
    const record = await this.prisma.otherPaid.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        group_id: dto.group_id,
        description: dto.description,
        payment_date: dto.payment_date ? new Date(dto.payment_date) : new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      include: {
        group: true,
      },
    });

    return {
      success: true,
      message: "Boshqa to'lov muvaffaqiyatli yaratildi",
      data: record,
    };
  }

  async findOtherPaid(query: any) {
    const where: any = { deleted_at: null };

    if (query.type) {
      where.type = query.type;
    }

    if (query.group_id) {
      where.group_id = Number(query.group_id);
    }

    if (query.date_from || query.date_to) {
      where.payment_date = {
        gte: query.date_from ? new Date(query.date_from) : undefined,
        lte: query.date_to
          ? new Date(new Date(query.date_to).setHours(23, 59, 59, 999))
          : undefined,
      };
    }

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.otherPaid.findMany({
        where,
        skip,
        take: limit,
        orderBy: { payment_date: 'desc' },
        include: {
          group: true,
        },
      }),
      this.prisma.otherPaid.count({ where }),
    ]);

    return {
      success: true,
      message: "Boshqa to'lovlar ro'yxati olindi",
      data: { data, total },
    };
  }

  async removeOtherPaid(id: number) {
    const record = await this.prisma.otherPaid.findUnique({ where: { id } });
    if (!record || record.deleted_at) {
      throw new NotFoundException("Boshqa to'lov topilmadi");
    }

    await this.prisma.otherPaid.update({
      where: { id },
      data: { deleted_at: new Date(), updated_at: new Date() },
    });

    return {
      success: true,
      message: "Boshqa to'lov muvaffaqiyatli o'chirildi",
      data: null,
    };
  }

  // ----------------------------------------------------------------
  // Helper: Visit miqdorlarini qayta hisoblash
  // ----------------------------------------------------------------

  private async updateClientBalance(clientId: number): Promise<void> {
    const [visitsAgg, clientPaidAgg, paymentsAgg] = await Promise.all([
      this.prisma.visit.aggregate({
        where: { client_id: clientId, deleted_at: null },
        _sum: { debt_amount: true },
      }),
      this.prisma.clientPaid.aggregate({
        where: { client_id: clientId, deleted_at: null },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { client_id: clientId, deleted_at: null, payment_type: 'INCOME' },
        _sum: { amount: true },
      }),
    ]);

    const totalDebt = Number(visitsAgg._sum.debt_amount || 0);
    const totalPrepaid = Number(clientPaidAgg._sum.amount || 0);
    const totalPaid = Number(paymentsAgg._sum.amount || 0);
    const balance = totalPrepaid + totalPaid - totalDebt;

    await this.prisma.client.update({
      where: { id: clientId },
      data: { balance, updated_at: new Date() },
    });
  }

  private async recalculateVisitAmounts(visitId: number): Promise<void> {
    // Barcha VisitService yozuvlarini yig'ish
    const services = await this.prisma.visitService.aggregate({
      where: { visit_id: visitId, deleted_at: null },
      _sum: { total: true },
    });

    // Barcha Payment (INCOME) yozuvlarini yig'ish
    const payments = await this.prisma.payment.aggregate({
      where: { visit_id: visitId, deleted_at: null, payment_type: 'INCOME' },
      _sum: { amount: true },
    });

    // Barcha ClientPaid yozuvlarini yig'ish
    const clientPaid = await this.prisma.clientPaid.aggregate({
      where: { visit_id: visitId, deleted_at: null },
      _sum: { amount: true },
    });

    const total_amount = Number(services._sum.total || 0);
    const paid_amount =
      Number(payments._sum.amount || 0) + Number(clientPaid._sum.amount || 0);
    const debt_amount = total_amount - paid_amount;

    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      select: { status: true },
    });

    const shouldMarkDone =
      debt_amount <= 0 &&
      total_amount > 0 &&
      visit?.status === 'COMPLETED';

    await this.prisma.visit.update({
      where: { id: visitId },
      data: {
        total_amount,
        paid_amount,
        debt_amount,
        ...(shouldMarkDone ? { status: 'DONE' } : {}),
        updated_at: new Date(),
      },
    });
  }
}
