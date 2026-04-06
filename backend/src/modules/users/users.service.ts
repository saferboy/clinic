import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findMany() {
    return this.prisma.user.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: userSelect,
    });
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
}

