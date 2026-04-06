import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { DoctorPerformanceService } from './doctor-performance.service';

@ApiTags('Reports - Doctor Performance')
@Controller('reports/doctor-performance')
export class DoctorPerformanceController {
  constructor(private readonly doctorPerformanceService: DoctorPerformanceService) {}

  @Get(':doctorId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shifokor ko\'rsatkichlari' })
  async getPerformance(
    @Query('doctor_id') doctorId: number,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Headers('user-id') currentUserId: number,
    @Headers('user-role') currentUserRole: string,
  ) {
    return {
      success: true,
      data: await this.doctorPerformanceService.getDoctorPerformance(
        doctorId,
        new Date(startDate),
        new Date(endDate),
        currentUserId,
        currentUserRole,
      ),
    };
  }

  @Get('ranking')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Shifokorlar reytingi' })
  async getRanking(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
    @Query('limit') limit: number = 10,
    @Headers('user-id') currentUserId: number,
    @Headers('user-role') currentUserRole: string,
  ) {
    return {
      success: true,
      data: await this.doctorPerformanceService.getDoctorRanking(
        new Date(startDate),
        new Date(endDate),
        limit,
        currentUserId,
        currentUserRole,
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
