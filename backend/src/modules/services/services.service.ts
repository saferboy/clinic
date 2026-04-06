import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Service } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto, UpdateServicePriceDto } from './dto/update-service.dto';

const serviceSelect = {
  id: true,
  department_id: true,
  name: true,
  price: true,
  duration_min: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  registered_by: true,
  modified_by: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.ServiceSelect;

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Yangi xizmat yaratish
   */
  async create(dto: CreateServiceDto, userId: number = 1) {
    // 1. Department mavjudligini tekshirish (agar kiritilgan bo'lsa)
    if (dto.department_id) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.department_id },
      });
      if (!department || department.deleted_at) {
        throw new NotFoundException('Bo\'lim topilmadi');
      }
    }

    // 2. Name unikal ekanligini tekshirish (bo'lim ichida)
    const existing = await this.prisma.service.findFirst({
      where: {
        name: dto.name,
        department_id: dto.department_id || null,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Bu xizmat nomi allaqachon mavjud');
    }

    // 3. Price validatsiya (musbat son)
    if (dto.price < 0) {
      throw new BadRequestException('Narx manfiy bo\'lishi mumkin emas');
    }

    // 4. Duration validatsiya
    if (dto.duration_min && (dto.duration_min < 5 || dto.duration_min > 480)) {
      throw new BadRequestException('Davomiylik 5-480 daqiqa orasida bo\'lishi kerak');
    }

    // 5. Xizmat yaratish
    const service = await this.prisma.service.create({
      data: {
        name: dto.name,
        price: dto.price,
        department_id: dto.department_id,
        duration_min: dto.duration_min || 30,
        description: dto.description,
        status: dto.status || 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      select: serviceSelect,
    });

    return {
      success: true,
      message: 'Xizmat muvaffaqiyatli yaratildi',
      data: service,
    };
  }

  /**
   * Xizmatlar ro'yxatini olish (pagination bilan)
   */
  async findMany(query: any) {
    const where: any = { deleted_at: null };

    // Department filter
    if (query.department_id) {
      where.department_id = Number(query.department_id);
    }

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    // Search filter
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Price filter
    if (query.min_price !== undefined) {
      where.price = { ...where.price, gte: Number(query.min_price) };
    }
    if (query.max_price !== undefined) {
      where.price = { ...where.price, lte: Number(query.max_price) };
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    // Sorting
    const orderBy = {
      [query.sortBy || 'name']: query.sortOrder || 'asc',
    };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...serviceSelect,
          _count: {
            select: {
              service_users: { where: { deleted_at: null } },
              visit_services: { where: { deleted_at: null } },
            },
          },
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      success: true,
      message: 'Xizmatlar ro\'yxati muvaffaqiyatli olindi',
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
   * Bo'lim xizmatlarini olish
   */
  async findByDepartment(departmentId: number, query: any) {
    const where: any = {
      department_id: departmentId,
      deleted_at: null,
    };

    // Status filter
    if (query.status) {
      where.status = query.status;
    }

    const data = await this.prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        duration_min: true,
        status: true,
      },
    });

    return {
      success: true,
      message: 'Bo\'lim xizmatlari olindi',
      data,
    };
  }

  /**
   * Bitta xizmatni olish
   */
  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: {
        ...serviceSelect,
        _count: {
          select: {
            service_users: { where: { deleted_at: null } },
            visit_services: { where: { deleted_at: null } },
          },
        },
      },
    });

    if (!service || service.deleted_at) {
      throw new NotFoundException('Xizmat topilmadi');
    }

    return {
      success: true,
      message: 'Xizmat ma\'lumotlari olindi',
      data: service,
    };
  }

  /**
   * Xizmat yangilash
   */
  async update(id: number, dto: UpdateServiceDto, userId: number = 1) {
    // 1. Xizmat mavjudligini tekshirish
    const service = await this.findRaw(id);

    // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.name && dto.name !== service.name) {
      const existing = await this.prisma.service.findFirst({
        where: {
          name: dto.name,
          department_id: dto.department_id || service.department_id,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existing) {
        throw new ConflictException('Bu xizmat nomi allaqachon mavjud');
      }
    }

    // 3. Department mavjudligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.department_id && dto.department_id !== service.department_id) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.department_id },
      });
      if (!department || department.deleted_at) {
        throw new NotFoundException('Bo\'lim topilmadi');
      }
    }

    // 4. Price validatsiya
    if (dto.price !== undefined && dto.price < 0) {
      throw new BadRequestException('Narx manfiy bo\'lishi mumkin emas');
    }

    // 5. Duration validatsiya
    if (dto.duration_min && (dto.duration_min < 5 || dto.duration_min > 480)) {
      throw new BadRequestException('Davomiylik 5-480 daqiqa orasida bo\'lishi kerak');
    }

    // 6. Xizmat yangilash
    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: serviceSelect,
    });

    return {
      success: true,
      message: 'Xizmat muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  /**
   * Xizmat narxini yangilash
   */
  async updatePrice(id: number, dto: UpdateServicePriceDto, userId: number = 1) {
    // 1. Xizmat mavjudligini tekshirish
    const service = await this.findRaw(id);

    // 2. Price validatsiya (musbat son)
    if (dto.price < 0) {
      throw new BadRequestException('Narx manfiy bo\'lishi mumkin emas');
    }

    // 3. Narx o'zgarishini log qilish
    if (Number(service.price) !== dto.price) {
      console.log(
        `Service price changed: ${service.name} from ${service.price} to ${dto.price}. Reason: ${dto.reason || 'N/A'}`,
      );
    }

    // 4. Narx yangilash
    const updated = await this.prisma.service.update({
      where: { id },
      data: {
        price: dto.price,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: serviceSelect,
    });

    return {
      success: true,
      message: 'Xizmat narxi muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  /**
   * Xizmat o'chirish (Soft Delete)
   */
  async remove(id: number, userId: number = 1) {
    // 1. Xizmat mavjudligini tekshirish
    await this.findRaw(id);

    // 2. Bog'liq yozuvlarni tekshirish
    const visitServiceCount = await this.prisma.visitService.count({
      where: {
        service_id: id,
        deleted_at: null,
      },
    });

    const serviceUserCount = await this.prisma.serviceUser.count({
      where: {
        service_id: id,
        deleted_at: null,
      },
    });

    // 3. Warning log (agar bog'liq yozuvlar bo'lsa)
    if (visitServiceCount > 0 || serviceUserCount > 0) {
      console.warn(
        `Service ${id} has ${visitServiceCount} visit services and ${serviceUserCount} service users. These records will be cascade deleted.`,
      );
    }

    // 4. Soft Delete
    const deleted = await this.prisma.service.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deleted_at: new Date(),
        modified_by: userId,
        updated_at: new Date(),
      },
      select: serviceSelect,
    });

    return {
      success: true,
      message: 'Xizmat muvaffaqiyatli o\'chirildi',
      data: deleted,
    };
  }

  /**
   * Helper: Xizmatni raw formatda topish
   */
  private async findRaw(id: number): Promise<Service> {
    const row = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!row || row.deleted_at) throw new NotFoundException('Xizmat topilmadi');
    return row;
  }
}
