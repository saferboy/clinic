import { Module } from '@nestjs/common';
import { DebtReportService } from './debt-report.service';
import { DebtReportController } from './debt-report.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DebtReportController],
  providers: [DebtReportService],
  exports: [DebtReportService],
})
export class DebtReportModule {}
