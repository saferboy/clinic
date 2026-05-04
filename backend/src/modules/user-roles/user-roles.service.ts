import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { GetUserRolesQueryDto } from './dto/get-user-roles-query.dto';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

const select = {
  id: true,
  name: true,
  description: true,
  permissions: true,
  status: true,
  created_at: true,
  updated_at: true,
  registered_by: true,
  modified_by: true,
};

@Injectable()
export class UserRolesService {
  private readonly logger = new Logger(UserRolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserRoleDto, user: ICurrentUser) {
    // Unikal nomni tekshirish @IsUnique decorator orqali avtomatik bajariladi

    this.logger.log(`Rol yaratmoqda: ${user.login} (${user.role_name})`);

    return this.prisma.userRole.create({
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions as any,
        status: dto.status || 'ACTIVE',
        registered_by: user.id,
        modified_by: user.id,
      },
      select,
    });
  }

  async findMany(query: GetUserRolesQueryDto) {
    const where: any = { deleted_at: null };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page! - 1) * query.limit!;
    const take = Math.min(query.limit!, 100);
    const orderBy = { [query.sortBy!]: query.sortOrder! };

    const [data, total] = await Promise.all([
      this.prisma.userRole.findMany({ where, skip, take, orderBy, select }),
      this.prisma.userRole.count({ where }),
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

  async findAll() {
    return this.prisma.userRole.findMany({
      where: { deleted_at: null, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select,
    });
  }

  async findOne(id: number) {
    const row = await this.prisma.userRole.findFirst({
      where: { id, deleted_at: null },
      select,
    });
    if (!row) throw new NotFoundException('Rol topilmadi');
    return row;
  }

  private async findRaw(id: number) {
    const row = await this.prisma.userRole.findFirst({
      where: { id, deleted_at: null },
    });
    if (!row) throw new NotFoundException('Rol topilmadi');
    return row;
  }

  async update(id: number, dto: UpdateUserRoleDto, user: ICurrentUser) {
    // Rol mavjudligini tekshirish
    await this.findRaw(id);


    return this.prisma.userRole.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions,
        status: dto.status,
        modified_by: user.id,
      },
      select,
    });
  }

  async remove(id: number) {
    await this.findRaw(id);
    return this.prisma.userRole.update({
      where: { id },
      data: { deleted_at: new Date() },
      select,
    });
  }
}

