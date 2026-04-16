import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientGroupDto } from './dto/create-client-group.dto';
import { UpdateClientGroupDto } from './dto/update-client-group.dto';
import { GetClientGroupsQueryDto } from './dto/get-client-groups-query.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class ClientGroupsService {
  private readonly logger = new Logger(ClientGroupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientGroupDto, user: ICurrentUser) {
    await this.checkUniqueName(dto.name);

    return this.prisma.clientGroup.create({
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

  async findMany(query: GetClientGroupsQueryDto) {
    const where: any = { deleted_at: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const skip = (query.page! - 1) * query.limit!;
    const take = Math.min(query.limit!, 100);

    const orderBy = {
      [query.sortBy!]: query.sortOrder!,
    };

    const [data, total] = await Promise.all([
      this.prisma.clientGroup.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.clientGroup.count({ where }),
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
    const row = await this.prisma.clientGroup.findFirst({
      where: { id, deleted_at: null },
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
    if (!row) throw new NotFoundException('Client group topilmadi');
    return row;
  }

  async update(id: number, dto: UpdateClientGroupDto, user: ICurrentUser) {
    const existing = await this.findOne(id);

    // Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa, case-insensitive)
    if (dto.name && dto.name !== existing.name) {
      await this.checkUniqueName(dto.name, id);
    }

    return this.prisma.clientGroup.update({
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
    await this.findOne(id);
    return this.prisma.clientGroup.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  /**
   * Client group nomining unikal ekanligini tekshirish (case-insensitive)
   * @param name - Client group nomi
   * @param excludeId - Joriy client group ID (update paytida o'zini exclude qilish uchun)
   * @throws ConflictException agar nom band bo'lsa
   */
  private async checkUniqueName(name: string, excludeId?: number) {
    const existing = await this.prisma.clientGroup.findFirst({
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
      throw new ConflictException('Client group nomi allaqachon mavjud');
    }
  }
}

