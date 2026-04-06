import { Injectable, Logger, type OnApplicationShutdown, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name);
  private pool: Pool;
  private isShuttingDown = false;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['error', 'warn'],
    });

    this.pool = pool;

    // Default findMany ordering
    this.$extends({
      model: {
        $allModels: {
          async findMany({ args, query }: { args: Record<string, unknown>; query: (args: Record<string, unknown>) => Promise<unknown> }) {
            if (!args.orderBy) {
              args.orderBy = { id: 'desc' };
            }
            return query(args);
          },
        },
      },
    });

    this.setupProcessListeners();
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed', error);
    }
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  async onApplicationShutdown() {
    await this.gracefulShutdown();
  }

  private setupProcessListeners() {
    process.on('SIGTERM', async () => {
      this.logger.log('Received SIGTERM');
      await this.gracefulShutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      this.logger.log('Received SIGINT');
      await this.gracefulShutdown();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      this.logger.error('Uncaught Exception:', error);
      await this.gracefulShutdown();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason) => {
      this.logger.error('Unhandled Rejection:', reason);
      await this.gracefulShutdown();
      process.exit(1);
    });
  }

  private async gracefulShutdown() {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      await this.$disconnect();
      await this.pool.end();
      this.logger.log('Database connections closed');
    } catch (error) {
      this.logger.error('Error during graceful shutdown:', error);
    }
  }
}
