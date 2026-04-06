import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { FilterDistrictQueryDto } from './dto/filter-district-query.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@Injectable()
export class DistrictsService {
  private readonly logger = new Logger(DistrictsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDistrictDto, user: ICurrentUser) {
    // Region mavjudligini tekshirish
    const region = await this.prisma.locRegion.findFirst({
      where: {
        id: dto.region_id,
        deleted_at: null,
      },
    });

    if (!region) {
      throw new NotFoundException('Viloyat topilmadi');
    }

    // Nom va region_id bo'yicha unique tekshiruv
    const existing = await this.prisma.locDistrict.findFirst({
      where: {
        name: dto.name,
        region_id: dto.region_id,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Bu nomli tuman ushbu viloyatda allaqachon mavjud');
    }

    const district = await this.prisma.locDistrict.create({
      data: {
        ...dto,
        registered_by: user.id,
        modified_by: user.id,
      },
      select: {
        id: true,
        name: true,
        region_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
        region: true,
      },
    });

    return {
      message: 'Tuman muvaffaqiyatli yaratildi',
      data: district,
    };
  }

  async findMany(query: FilterDistrictQueryDto) {
    const { search, region_id, status, page = 1, limit = 10, sortBy = 'created_at', order = 'desc' } = query;

    // Where filter
    const where: any = { deleted_at: null };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (region_id) {
      where.region_id = region_id;
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
      this.prisma.locDistrict.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          region_id: true,
          status: true,
          created_at: true,
          updated_at: true,
          region: true,
        },
      }),
      this.prisma.locDistrict.count({ where }),
    ]);

    return {
      message: 'Tumanlar ro\'yxati',
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
    const row = await this.prisma.locDistrict.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        region_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
        region: true,
      },
    });
    if (!row) throw new NotFoundException('Tuman topilmadi');

    return {
      message: 'Tuman ma\'lumotlari',
      data: row,
    };
  }

  async update(id: number, dto: UpdateDistrictDto, user: ICurrentUser) {
    const existingDistrict = await this.prisma.locDistrict.findUnique({
      where: { id },
      select: { name: true, region_id: true },
    });

    if (!existingDistrict) {
      throw new NotFoundException('Tuman topilmadi');
    }

    // Yangilanayotgan qiymatlarni aniqlash
    const newName = dto.name ?? existingDistrict.name;
    const newRegionId = dto.region_id ?? existingDistrict.region_id;

    // Agar region_id o'zgartirilayotgan bo'lsa, yangi region mavjudligini tekshirish
    if (dto.region_id) {
      const region = await this.prisma.locRegion.findFirst({
        where: {
          id: dto.region_id,
          deleted_at: null,
        },
      });

      if (!region) {
        throw new NotFoundException('Viloyat topilmadi');
      }
    }

    // Nom va region_id kombinatsiyasi unique bo'lishi kerak
    const duplicate = await this.prisma.locDistrict.findFirst({
      where: {
        name: newName,
        region_id: newRegionId,
        id: { not: id },
        deleted_at: null,
      },
    });

    if (duplicate) {
      throw new ConflictException('Bu nomli tuman ushbu viloyatda allaqachon mavjud');
    }

    const district = await this.prisma.locDistrict.update({
      where: { id },
      data: {
        ...dto,
        modified_by: user.id,
      },
      select: {
        id: true,
        name: true,
        region_id: true,
        status: true,
        created_at: true,
        updated_at: true,
        registered_by: true,
        modified_by: true,
        region: true,
      },
    });

    return {
      message: 'Tuman ma\'lumotlari o\'zgartirildi',
      data: district,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.locDistrict.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return {
      message: 'Tuman o\'chirildi',
    };
  }
}

