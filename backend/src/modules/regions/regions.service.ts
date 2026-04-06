import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { FilterRegionQueryDto } from './dto/filter-region-query.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRegionDto, user: ICurrentUser) {
    // Nom bo'yicha unique tekshiruv
    const existing = await this.prisma.locRegion.findFirst({
      where: {
        name: dto.name,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Bu nomli viloyat allaqachon mavjud');
    }

    const region = await this.prisma.locRegion.create({
      data: {
        ...dto,
        registered_by: user.id,
        modified_by: user.id,
      },
      select: {
        id: true,
        name: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
      },
    });

    return {
      message: 'Viloyat muvaffaqiyatli yaratildi',
      data: region,
    };
  }

  async findMany(query: FilterRegionQueryDto) {
    const { search, status, page = 1, limit = 10, sortBy = 'created_at', order = 'desc' } = query;

    // Where filter
    const where: any = { deleted_at: null };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Order by
    const orderBy: any = {};
    orderBy[sortBy] = order;

    const [data, total] = await Promise.all([
      this.prisma.locRegion.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          status: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.locRegion.count({ where }),
    ]);

    return {
      message: 'Viloyatlar ro\'yxati',
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
    const row = await this.prisma.locRegion.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
      },
    });
    if (!row) throw new NotFoundException('Viloyat topilmadi');

    return {
      message: 'Viloyat ma\'lumotlari',
      data: row,
    };
  }

  async update(id: number, dto: UpdateRegionDto, user: ICurrentUser) {
    await this.findOne(id);
    
    const region = await this.prisma.locRegion.update({
      where: { id },
      data: {
        ...dto,
        modified_by: user.id,
      },
      select: {
        id: true,
        name: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
      },
    });

    return {
      message: 'Viloyat ma\'lumotlari o\'zgartirildi',
      data: region,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.locRegion.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return {
      message: 'Viloyat o\'chirildi',
    };
  }
}

