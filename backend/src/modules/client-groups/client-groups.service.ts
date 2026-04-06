import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientGroupDto } from './dto/create-client-group.dto';
import { UpdateClientGroupDto } from './dto/update-client-group.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class ClientGroupsService {
  private readonly logger = new Logger(ClientGroupsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientGroupDto, user: ICurrentUser) {
    // Unique name tekshirish (case-insensitive)
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

  async findMany() {
    return this.prisma.clientGroup.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
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

