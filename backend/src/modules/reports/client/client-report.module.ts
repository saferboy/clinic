import { Module } from '@nestjs/common';
import { ClientReportService } from './client-report.service';
import { ClientReportController } from './client-report.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClientReportController],
  providers: [ClientReportService],
  exports: [ClientReportService],
})
export class ClientReportModule {}
