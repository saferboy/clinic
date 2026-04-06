import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('RoomsService', () => {
  let service: RoomsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        {
          provide: PrismaService,
          useValue: {
            room: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            department: {
              findUnique: jest.fn(),
            },
            visitRoom: {
              findFirst: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new room successfully', async () => {
      const dto = {
        name: 'Terapiya Kabineti 1',
        room_number: '101',
        department_id: 1,
        status: 'AVAILABLE' as const,
      };

      (prisma.department.findUnique as jest.Mock).mockResolvedValue({ id: 1, deleted_at: null });
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.room.create as jest.Mock).mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto, 1);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Terapiya Kabineti 1');
    });

    it('should throw ConflictException if room name exists', async () => {
      const dto = {
        name: 'Terapiya Kabineti 1',
        department_id: 1,
      };

      (prisma.department.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (prisma.room.findFirst as jest.Mock).mockResolvedValue({ id: 1, name: 'Terapiya Kabineti 1' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });
  });

  describe('findMany', () => {
    it('should return paginated rooms', async () => {
      const query = { page: 1, limit: 20 };

      (prisma.room.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.room.count as jest.Mock).mockResolvedValue(0);

      const result = await service.findMany(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should filter by department_id', async () => {
      const query = { department_id: 1 };

      (prisma.room.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.room.count as jest.Mock).mockResolvedValue(0);

      await service.findMany(query);

      expect(prisma.room.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department_id: 1,
          }),
        }),
      );
    });
  });

  describe('findAvailable', () => {
    it('should return only available rooms', async () => {
      const query = { limit: 10 };

      (prisma.room.findMany as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Room 1', status: 'AVAILABLE' },
      ]);

      const result = await service.findAvailable(query);

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe('AVAILABLE');
    });
  });

  describe('findOne', () => {
    it('should return a room by id', async () => {
      const mockRoom = { id: 1, name: 'Terapiya Kabineti 1', deleted_at: null };

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);

      const result = await service.findOne(1);

      expect(result.data.id).toBe(1);
    });

    it('should throw NotFoundException if room not found', async () => {
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update room status successfully', async () => {
      const dto = { status: 'OCCUPIED' as const };
      const mockRoom = { id: 1, status: 'AVAILABLE', deleted_at: null };

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.visitRoom.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.room.update as jest.Mock).mockResolvedValue({ ...mockRoom, status: 'OCCUPIED' });

      const result = await service.updateStatus(1, dto, 1);

      expect(result.data.status).toBe('OCCUPIED');
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const dto = { status: 'OCCUPIED' as const };
      const mockRoom = { id: 1, status: 'CLOSED', deleted_at: null };

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);

      await expect(service.updateStatus(1, dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete a room', async () => {
      const mockRoom = { id: 1, deleted_at: null };

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.visitRoom.count as jest.Mock).mockResolvedValue(0);
      (prisma.room.update as jest.Mock).mockResolvedValue({
        ...mockRoom,
        record_status: 'INACTIVE',
        deleted_at: new Date(),
      });

      const result = await service.remove(1, 1);

      expect(result.data.record_status).toBe('INACTIVE');
      expect(result.data.deleted_at).toBeDefined();
    });

    it('should throw BadRequestException if room has active visits', async () => {
      const mockRoom = { id: 1, deleted_at: null };

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.visitRoom.count as jest.Mock).mockResolvedValue(1);

      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
    });
  });
});
