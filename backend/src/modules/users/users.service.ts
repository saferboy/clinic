import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

interface FindManyParams {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const userSelect = {
  id: true,
  role_id: true,
  full_name: true,
  login: true,
  phone: true,
  email: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  role: {
    select: {
      id: true,
      name: true,
      permissions: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Agar role_id berilgan bo'lsa, uning mavjudligini tekshirish
    if (dto.role_id) {
      const role = await this.prisma.userRole.findFirst({
        where: {
          id: dto.role_id,
          deleted_at: null,
        },
      });

      if (!role) {
        throw new NotFoundException('Role topilmadi');
      }
    }

    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { ...dto, password },
      select: userSelect,
    });
  }

  async findMany(params: FindManyParams = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      role_id,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Where shartlari
    const where: Prisma.UserWhereInput = { deleted_at: null };

    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { login: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role_id) {
      where.role_id = role_id;
    }

    if (status) {
      where.status = status as any;
    }

    // Order by
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    // Parallel: data va total count
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: userSelect,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      select: userSelect,
    });
    if (!row) throw new NotFoundException('User not found');
    return row;
  }

  private async findRaw(id: number): Promise<User> {
    const row = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });
    if (!row) throw new NotFoundException('User not found');
    return row;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findRaw(id);

    // Agar role_id o'zgartirilayotgan bo'lsa, uning mavjudligini tekshirish
    if (dto.role_id) {
      const role = await this.prisma.userRole.findFirst({
        where: {
          id: dto.role_id,
          deleted_at: null,
        },
      });

      if (!role) {
        throw new NotFoundException('Role topilmadi');
      }
    }

    const data: Prisma.UserUpdateInput = { ...dto } as Prisma.UserUpdateInput;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  }

  async remove(id: number) {
    await this.findRaw(id);
    return this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
      select: userSelect,
    });
  }

  /**
   * Admin tomonidan foydalanuvchi parolini tiklash
   */
  async resetPassword(id: number, customPassword?: string) {
    await this.findRaw(id);

    // Agar parol berilmagan bo'lsa, default parol
    const password = customPassword || '1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: userSelect,
    });

    return {
      ...updatedUser,
      tempPassword: password,
    };
  }
}

