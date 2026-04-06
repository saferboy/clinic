import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSourceDto, user: ICurrentUser) {
    return this.prisma.source.create({
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
    return this.prisma.source.findMany({
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
    const row = await this.prisma.source.findFirst({
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
    if (!row) throw new NotFoundException('Source topilmadi');
    return row;
  }

  async update(id: number, dto: UpdateSourceDto, user: ICurrentUser) {
    await this.findOne(id);
    return this.prisma.source.update({
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
    return this.prisma.source.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}

