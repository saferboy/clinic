import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  Headers,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DailyReportService } from './daily-report.service';
import { GetDailyReportDto } from './dto/get-daily-report.dto';
import { ExportDailyReportDto } from './dto/export-daily-report.dto';
import { GetDoctorReportDto } from './dto/get-doctor-report.dto';
import { GetDailyTrendDto } from './dto/get-daily-trend.dto';

@ApiTags('Reports - Daily')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('reports/daily')
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kunlik hisobotni olish' })
  async getDailyReport(@Query() dto: GetDailyReportDto) {
    return {
      success: true,
      data: await this.dailyReportService.getDailyReport(dto),
    };
  }

  @Post('export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kunlik hisobot export (Excel/PDF)' })
  async exportDailyReport(
    @Body() dto: ExportDailyReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.dailyReportService.exportDailyReport(dto);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="daily-report-${dto.date}.xlsx"`,
    );
    res.send(buffer);
  }

  @Get('trend')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kunlik trend (solishtirma)' })
  async getDailyTrend(@Query() dto: GetDailyTrendDto) {
    return {
      success: true,
      data: await this.dailyReportService.getDailyTrend(
        dto.date,
        dto.compare_days,
      ),
    };
  }

  @Get('doctor/:doctorId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shifokor kunlik hisoboti' })
  async getDoctorDailyReport(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('date') date: string = new Date().toISOString().split('T')[0],
    @Headers('user-id') currentUserId: number,
    @Headers('user-role') currentUserRole: string,
  ) {
    return {
      success: true,
      data: await this.dailyReportService.getDoctorDailyReport(
        doctorId,
        date,
        currentUserId,
        currentUserRole,
      ),
    };
  }
}
