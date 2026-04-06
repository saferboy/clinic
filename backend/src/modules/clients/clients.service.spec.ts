import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('ClientsService', () => {
  let service: ClientsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: {
            client: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            clientGroup: {
              findUnique: jest.fn(),
            },
            locRegion: {
              findUnique: jest.fn(),
            },
            locDistrict: {
              findUnique: jest.fn(),
            },
            source: {
              findUnique: jest.fn(),
            },
            visit: {
              count: jest.fn(),
              aggregate: jest.fn(),
              findMany: jest.fn(),
            },
            payment: {
              count: jest.fn(),
              aggregate: jest.fn(),
              findMany: jest.fn(),
            },
            clientPaid: {
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client successfully', async () => {
      const dto = {
        full_name: 'John Doe',
        phone: '+998901234567',
        gender: 'MALE' as const,
        group_id: 1,
        region_id: 1,
        district_id: 1,
        source_id: 1,
        status: 'ACTIVE' as const,
      };

      // Mock: Check existing client
      (prisma.client.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock: Check references
      (prisma.clientGroup.findUnique as jest.Mock).mockResolvedValue({ id: 1, deleted_at: null });
      (prisma.locRegion.findUnique as jest.Mock).mockResolvedValue({ id: 1, deleted_at: null });
      (prisma.locDistrict.findUnique as jest.Mock).mockResolvedValue({ id: 1, deleted_at: null });
      (prisma.source.findUnique as jest.Mock).mockResolvedValue({ id: 1, deleted_at: null });

      // Mock: Create client
      (prisma.client.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...dto,
        balance: 0,
      });

      const result = await service.create(dto, 1);

      expect(result.full_name).toBe('John Doe');
      expect(result.phone).toBe('+998901234567');
      expect(prisma.client.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if phone already exists', async () => {
      const dto = {
        full_name: 'John Doe',
        phone: '+998901234567',
        gender: 'MALE' as const,
      };

      (prisma.client.findFirst as jest.Mock).mockResolvedValue({ id: 1, phone: '+998901234567' });

      await expect(service.create(dto, 1)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid phone format', async () => {
      const dto = {
        full_name: 'John Doe',
        phone: 'invalid',
        gender: 'MALE' as const,
      };

      await expect(service.create(dto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMany', () => {
    it('should return paginated clients', async () => {
      const query = { page: 1, limit: 10 };

      (prisma.client.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.client.count as jest.Mock).mockResolvedValue(0);

      const result = await service.findMany(query);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should filter by phone', async () => {
      const query = { phone: '+998901234567' };

      (prisma.client.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.client.count as jest.Mock).mockResolvedValue(0);

      await service.findMany(query);

      expect(prisma.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            phone: '+998901234567',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      const mockClient = {
        id: 1,
        full_name: 'John Doe',
        phone: '+998901234567',
        deleted_at: null,
      };

      (prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
      expect(result.full_name).toBe('John Doe');
    });

    it('should throw NotFoundException if client not found', async () => {
      (prisma.client.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      const dto = { full_name: 'John Doe Updated' };
      const mockClient = { id: 1, full_name: 'John Doe', phone: '+998901234567', deleted_at: null };

      (prisma.client.findFirst as jest.Mock).mockResolvedValue(mockClient);
      (prisma.client.update as jest.Mock).mockResolvedValue({ ...mockClient, ...dto });

      const result = await service.update(1, dto, 1);

      expect(result.full_name).toBe('John Doe Updated');
      expect(prisma.client.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if client not found', async () => {
      (prisma.client.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.update(1, {}, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a client', async () => {
      const mockClient = { id: 1, deleted_at: null };

      (prisma.client.findFirst as jest.Mock).mockResolvedValue(mockClient);
      (prisma.visit.count as jest.Mock).mockResolvedValue(0);
      (prisma.payment.count as jest.Mock).mockResolvedValue(0);
      (prisma.client.update as jest.Mock).mockResolvedValue({
        ...mockClient,
        status: 'INACTIVE',
        deleted_at: new Date(),
      });

      const result = await service.remove(1, 1);

      expect(result.status).toBe('INACTIVE');
      expect(result.deleted_at).toBeDefined();
    });
  });

  describe('getBalance', () => {
    it('should return client balance', async () => {
      const mockClient = { id: 1, deleted_at: null };

      (prisma.client.findFirst as jest.Mock).mockResolvedValue(mockClient);
      (prisma.visit.aggregate as jest.Mock).mockResolvedValue({
        _sum: { debt_amount: 100000, total_amount: 200000, paid_amount: 100000 },
      });
      (prisma.clientPaid.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 50000 },
        _count: { id: 1 },
      });
      (prisma.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 50000 },
        _count: { id: 1 },
      });

      const result = await service.getBalance(1);

      expect(result.balance).toBe(0); // (50000 + 50000) - 100000 = 0
    });
  });
});
