import { Module } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { DailyReportController } from './daily-report.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DailyReportController],
  providers: [DailyReportService],
  exports: [DailyReportService],
})
export class DailyReportModule {}
