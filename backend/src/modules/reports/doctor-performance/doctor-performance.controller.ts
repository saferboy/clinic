import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DoctorPerformanceService } from './doctor-performance.service';

@ApiTags('Reports - Doctor Performance')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('reports/doctor-performance')
export class DoctorPerformanceController {
  constructor(private readonly doctorPerformanceService: DoctorPerformanceService) {}

  @Get('ranking')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shifokorlar reytingi' })
  async getRanking(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('limit') limit: string = '10',
  ) {
    return {
      success: true,
      data: await this.doctorPerformanceService.getDoctorRanking(
        new Date(startDate + 'T00:00:00'),
        new Date(endDate + 'T23:59:59.999'),
        parseInt(limit) || 10,
      ),
    };
  }

  @Get(':doctorId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shifokor ko\'rsatkichlari' })
  async getPerformance(
    @Query('doctor_id') doctorId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Headers('user-id') currentUserId: string,
    @Headers('user-role') currentUserRole: string,
  ) {
    return {
      success: true,
      data: await this.doctorPerformanceService.getDoctorPerformance(
        parseInt(doctorId),
        new Date(startDate + 'T00:00:00'),
        new Date(endDate + 'T23:59:59.999'),
        parseInt(currentUserId) || 0,
        currentUserRole || 'Admin',
      ),
    };
  }

  @Post('export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shifokor hisoboti export' })
  async export(
    @Query('doctor_id') doctorId: number,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const buffer = await this.doctorPerformanceService.exportDoctorPerformance({ doctorId, start_date: startDate, end_date: endDate, format });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="doctor-performance.xlsx"`);
    res.send(buffer);
  }
}
