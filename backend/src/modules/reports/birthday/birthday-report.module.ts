import { Module } from '@nestjs/common';
import { BirthdayReportController } from './birthday-report.controller';
import { BirthdayReportService } from './birthday-report.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BirthdayReportController],
  providers: [BirthdayReportService],
})
export class BirthdayReportModule {}
