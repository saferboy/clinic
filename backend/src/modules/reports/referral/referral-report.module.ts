import { Module } from '@nestjs/common';
import { ReferralReportController } from './referral-report.controller';
import { ReferralReportService } from './referral-report.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReferralReportController],
  providers: [ReferralReportService],
})
export class ReferralReportModule {}
