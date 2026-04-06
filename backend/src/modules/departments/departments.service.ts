import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { GetDepartmentsQueryDto } from './dto/get-departments-query.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';
import { RecordStatus } from '@prisma/client';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto, user: ICurrentUser) {
    // Unique name tekshirish (case-insensitive)
    await this.checkUniqueName(dto.name);

    return this.prisma.department.create({
      data: {
        ...dto,
        registered_by: user.id,
        modified_by: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
      },
    });
  }

  async findMany(query: GetDepartmentsQueryDto) {
    const where: any = { deleted_at: null };

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Search filter (name bo'yicha, case-insensitive)
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Pagination
    const skip = (query.page! - 1) * query.limit!;
    const take = Math.min(query.limit!, 100);

    // Sorting
    const orderBy = {
      [query.sortBy!]: query.sortOrder!,
    };

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          _count: {
            select: {
              rooms: { where: { deleted_at: null } },
              services: { where: { deleted_at: null } },
            },
          },
        },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page: query.page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNextPage: skip + take < total,
        hasPrevPage: query.page! > 1,
      },
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: { where: { deleted_at: null } },
            services: { where: { deleted_at: null } },
          },
        },
      },
    });

    if (!row || row.deleted_at) {
      throw new NotFoundException('DEPT_003');
    }

    return row;
  }

  async update(id: number, dto: UpdateDepartmentDto, user: ICurrentUser) {
    const existing = await this.findOne(id);

    // Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa, case-insensitive)
    if (dto.name && dto.name !== existing.name) {
      await this.checkUniqueName(dto.name, id);
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        ...dto,
        modified_by: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.findOne(id);

    // Bog'liq yozuvlarni tekshirish
    const [roomCount, serviceCount] = await Promise.all([
      this.prisma.room.count({
        where: { department_id: id, deleted_at: null },
      }),
      this.prisma.service.count({
        where: { department_id: id, deleted_at: null },
      }),
    ]);

    // Ogohlantirish (agar bog'liq yozuvlar bo'lsa)
    if (roomCount > 0 || serviceCount > 0) {
      this.logger.warn(
        `Department ${id} has ${roomCount} rooms and ${serviceCount} services. ` +
        `Their department_id will be set to NULL.`,
      );
    }

    // Soft Delete: status = INACTIVE, deleted_at = now()
    return this.prisma.department.update({
      where: { id },
      data: {
        status: RecordStatus.INACTIVE,
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Bo'lim nomining unikal ekanligini tekshirish (case-insensitive)
   * @param name - Bo'lim nomi
   * @param excludeId - Joriy bo'lim ID (update paytida o'zini exclude qilish uchun)
   * @throws ConflictException agar nom band bo'lsa
   */
  private async checkUniqueName(name: string, excludeId?: number) {
    const existing = await this.prisma.department.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        id: excludeId ? { not: excludeId } : undefined,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('DEPT_001');
    }
  }
}
