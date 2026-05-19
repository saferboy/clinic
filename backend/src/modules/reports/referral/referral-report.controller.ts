import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralReportService } from './referral-report.service';
import { GetReferralReportDto } from './dto/get-referral-report.dto';

@ApiTags('Reports - Referral')
@Controller('reports/referrals')
export class ReferralReportController {
  constructor(private readonly referralReportService: ReferralReportService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Referral va manba hisoboti' })
  async getReferralReport(@Query() dto: GetReferralReportDto) {
    return {
      success: true,
      data: await this.referralReportService.getReferralReport(dto),
    };
  }
}
