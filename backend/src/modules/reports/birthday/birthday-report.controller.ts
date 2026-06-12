import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { BirthdayReportService } from './birthday-report.service';
import { GetBirthdayReportDto } from './dto/get-birthday-report.dto';

@ApiTags('Reports - Birthday')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('reports/birthdays')
export class BirthdayReportController {
  constructor(private readonly birthdayReportService: BirthdayReportService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Kelayotgan tug'ilgan kunlar" })
  async getBirthdayReport(@Query() dto: GetBirthdayReportDto) {
    return {
      success: true,
      data: await this.birthdayReportService.getBirthdayReport(dto),
    };
  }
}
