import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ServiceReportService } from './service-report.service';
import { GetServiceReportDto, GetServiceRankingDto, ExportServiceReportDto } from './dto/get-service-report.dto';

@ApiTags('Reports - Service')
@Controller('reports/services')
export class ServiceReportController {
  constructor(private readonly serviceReportService: ServiceReportService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xizmatlar hisoboti' })
  async getServiceReport(@Query() dto: GetServiceReportDto) {
    return { success: true, data: await this.serviceReportService.getServiceReport(dto) };
  }

  @Get('ranking')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xizmatlar reytingi' })
  async getRanking(@Query() dto: GetServiceRankingDto) {
    return { success: true, data: await this.serviceReportService.getServiceRanking(dto) };
  }

  @Post('export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xizmatlar export' })
  async export(@Query() dto: ExportServiceReportDto, @Res() res: Response) {
    const buffer = await this.serviceReportService.exportServiceReport(dto);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="service-report.xlsx"`);
    res.send(buffer);
  }
}
