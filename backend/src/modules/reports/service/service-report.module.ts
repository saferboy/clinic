import { Module } from '@nestjs/common';
import { ServiceReportService } from './service-report.service';
import { ServiceReportController } from './service-report.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceReportController],
  providers: [ServiceReportService],
  exports: [ServiceReportService],
})
export class ServiceReportModule {}
