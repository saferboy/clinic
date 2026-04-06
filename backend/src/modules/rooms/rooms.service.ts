import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Room } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto, UpdateRoomStatusDto } from './dto/update-room.dto';

const roomSelect = {
  id: true,
  department_id: true,
  name: true,
  room_number: true,
  status: true,
  description: true,
  record_status: true,
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
} satisfies Prisma.RoomSelect;

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Yangi xona yaratish
   */
  async create(dto: CreateRoomDto, userId: number = 1) {
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
    const existing = await this.prisma.room.findFirst({
      where: {
        name: dto.name,
        department_id: dto.department_id || null,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Bu xona nomi allaqachon mavjud');
    }

    // 3. Room number unikal ekanligini tekshirish (agar kiritilgan bo'lsa)
    if (dto.room_number) {
      const existingNumber = await this.prisma.room.findFirst({
        where: {
          room_number: dto.room_number,
          department_id: dto.department_id || null,
          deleted_at: null,
        },
      });

      if (existingNumber) {
        throw new ConflictException('Bu xona raqami allaqachon mavjud');
      }
    }

    // 4. Xona yaratish
    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        room_number: dto.room_number,
        department_id: dto.department_id,
        status: dto.status || 'AVAILABLE',
        description: dto.description,
        record_status: dto.record_status || 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
        registered_by: userId,
      },
      select: roomSelect,
    });

    return {
      success: true,
      message: 'Xona muvaffaqiyatli yaratildi',
      data: room,
    };
  }

  /**
   * Xonalar ro'yxatini olish (pagination bilan)
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

    // Record Status filter
    if (query.record_status) {
      where.record_status = query.record_status;
    }

    // Search filter
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { room_number: { contains: query.search, mode: 'insensitive' } },
      ];
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
      this.prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          ...roomSelect,
          _count: {
            select: {
              visit_rooms: { where: { status: 'IN_USE', deleted_at: null } },
            },
          },
        },
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      success: true,
      message: 'Xonalar ro\'yxati muvaffaqiyatli olindi',
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
   * Bo'sh xonalarni olish
   */
  async findAvailable(query: { department_id?: number; limit?: number }) {
    const where: any = {
      status: 'AVAILABLE',
      record_status: 'ACTIVE',
      deleted_at: null,
    };

    if (query.department_id) {
      where.department_id = Number(query.department_id);
    }

    const take = Math.min(query.limit || 10, 50);

    const data = await this.prisma.room.findMany({
      where,
      take,
      select: {
        id: true,
        name: true,
        room_number: true,
        status: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      message: 'Bo\'sh xonalar olindi',
      data,
    };
  }

  /**
   * Bitta xonani olish
   */
  async findOne(id: number) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      select: {
        ...roomSelect,
        _count: {
          select: {
            visit_rooms: { where: { deleted_at: null } },
          },
        },
      },
    });

    if (!room || room.deleted_at) {
      throw new NotFoundException('Xona topilmadi');
    }

    return {
      success: true,
      message: 'Xona ma\'lumotlari olindi',
      data: room,
    };
  }

  /**
   * Xona yangilash
   */
  async update(id: number, dto: UpdateRoomDto, userId: number = 1) {
    // 1. Xona mavjudligini tekshirish
    const room = await this.findRaw(id);

    // 2. Name unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.name && dto.name !== room.name) {
      const existing = await this.prisma.room.findFirst({
        where: {
          name: dto.name,
          department_id: dto.department_id || room.department_id,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existing) {
        throw new ConflictException('Bu xona nomi allaqachon mavjud');
      }
    }

    // 3. Room number unikal ekanligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.room_number && dto.room_number !== room.room_number) {
      const existingNumber = await this.prisma.room.findFirst({
        where: {
          room_number: dto.room_number,
          department_id: dto.department_id || room.department_id,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingNumber) {
        throw new ConflictException('Bu xona raqami allaqachon mavjud');
      }
    }

    // 4. Department mavjudligini tekshirish (agar o'zgarayotgan bo'lsa)
    if (dto.department_id && dto.department_id !== room.department_id) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.department_id },
      });
      if (!department || department.deleted_at) {
        throw new NotFoundException('Bo\'lim topilmadi');
      }
    }

    // 5. Xona yangilash
    const updated = await this.prisma.room.update({
      where: { id },
      data: {
        ...dto,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: roomSelect,
    });

    return {
      success: true,
      message: 'Xona muvaffaqiyatli yangilandi',
      data: updated,
    };
  }

  /**
   * Xona status o'zgartirish
   */
  async updateStatus(id: number, dto: UpdateRoomStatusDto, userId: number = 1) {
    // 1. Xona mavjudligini tekshirish
    const room = await this.findRaw(id);

    // 2. Status o'zgarish qoidalarini tekshirish
    const statusTransitions: any = {
      AVAILABLE: ['OCCUPIED', 'MAINTENANCE', 'CLOSED'],
      OCCUPIED: ['AVAILABLE', 'MAINTENANCE'],
      MAINTENANCE: ['AVAILABLE', 'CLOSED'],
      CLOSED: ['AVAILABLE', 'MAINTENANCE'],
    };

    if (!statusTransitions[room.status].includes(dto.status)) {
      throw new BadRequestException('Status o\'zgarishi mumkin emas');
    }

    // 3. OCCUPIED ga o'zgartirishda VisitRoom tekshiruvi
    if (dto.status === 'OCCUPIED') {
      const activeVisit = await this.prisma.visitRoom.findFirst({
        where: {
          room_id: id,
          status: 'IN_USE',
          deleted_at: null,
        },
      });

      if (!activeVisit) {
        console.warn(`Room ${id} marked as OCCUPIED without active VisitRoom`);
      }
    }

    // 4. Status yangilash
    const updated = await this.prisma.room.update({
      where: { id },
      data: {
        status: dto.status,
        updated_at: new Date(),
        modified_by: userId,
      },
      select: roomSelect,
    });

    return {
      success: true,
      message: 'Xona status muvaffaqiyatli o\'zgartirildi',
      data: updated,
    };
  }

  /**
   * Xona o'chirish (Soft Delete)
   */
  async remove(id: number, userId: number = 1) {
    // 1. Xona mavjudligini tekshirish
    await this.findRaw(id);

    // 2. Active VisitRoom yozuvlarini tekshirish
    const activeVisitCount = await this.prisma.visitRoom.count({
      where: {
        room_id: id,
        status: 'IN_USE',
        deleted_at: null,
      },
    });

    // 3. Agar active visit bo'lsa, o'chirishni taqiqlash
    if (activeVisitCount > 0) {
      throw new BadRequestException('Xonada aktiv bemor bor');
    }

    // 4. Soft Delete
    const deleted = await this.prisma.room.update({
      where: { id },
      data: {
        record_status: 'INACTIVE',
        status: 'CLOSED',
        deleted_at: new Date(),
        modified_by: userId,
        updated_at: new Date(),
      },
      select: roomSelect,
    });

    return {
      success: true,
      message: 'Xona muvaffaqiyatli o\'chirildi',
      data: deleted,
    };
  }

  /**
   * Helper: Xonani raw formatda topish
   */
  private async findRaw(id: number): Promise<Room> {
    const row = await this.prisma.room.findUnique({
      where: { id },
    });
    if (!row || row.deleted_at) throw new NotFoundException('Xona topilmadi');
    return row;
  }
}
