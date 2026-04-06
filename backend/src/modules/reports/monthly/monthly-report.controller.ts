import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { MonthlyReportService } from './monthly-report.service';
import { GetMonthlyReportDto } from './dto/get-monthly-report.dto';
import { ExportMonthlyReportDto } from './dto/export-monthly-report.dto';

@ApiTags('Reports - Monthly')
@Controller('reports/monthly')
export class MonthlyReportController {
  constructor(private readonly monthlyReportService: MonthlyReportService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oylik hisobotni olish' })
  async getMonthlyReport(@Query() dto: GetMonthlyReportDto) {
    return {
      success: true,
      data: await this.monthlyReportService.getMonthlyReport(dto),
    };
  }

  @Post('export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Oylik hisobot export (Excel/PDF)' })
  async exportMonthlyReport(
    @Body() dto: ExportMonthlyReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.monthlyReportService.exportMonthlyReport(dto);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="monthly-report-${dto.month}-${dto.year}.xlsx"`,
    );
    res.send(buffer);
  }
}
