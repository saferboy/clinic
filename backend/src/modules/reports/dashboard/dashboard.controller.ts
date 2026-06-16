import { Controller, Get, Post, Query, Res, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { GetDashboardMetricsDto, ExportDashboardDto } from './dto/get-dashboard-metrics.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard metrikalari' })
  async getMetrics(
    @Query() dto: GetDashboardMetricsDto,
    @Headers('user-id') currentUserId: number,
    @Headers('user-role') currentUserRole: string,
  ) {
    return { success: true, data: await this.dashboardService.getDashboardMetrics(dto, currentUserId, currentUserRole) };
  }

  @Post('export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard export' })
  async export(@Query() dto: ExportDashboardDto, @Res() res: Response) {
    const buffer = await this.dashboardService.exportDashboard(dto);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard.xlsx"`);
    res.send(buffer);
  }
}
