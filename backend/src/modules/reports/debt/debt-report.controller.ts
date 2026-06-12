import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe,
  Res,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { DebtReportService } from './debt-report.service';
import { GetDebtReportDto, GetDebtClientsDto, CreateFollowupDto, ExportDebtReportDto } from './dto/get-debt-report.dto';

@ApiTags('Reports - Debt')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('reports/debt')
export class DebtReportController {
  constructor(private readonly debtReportService: DebtReportService) {}

  @Get()
  @ApiOperation({ summary: 'Qarzdorlik hisobotini olish' })
  async getDebtReport(@Query() dto: GetDebtReportDto) {
    return {
      success: true,
      data: await this.debtReportService.getDebtReport(dto),
    };
  }

  @Get('clients')
  @ApiOperation({ summary: "Qarzdor mijozlar ro'yxati" })
  async getDebtClientList(@Query() dto: GetDebtClientsDto) {
    return {
      success: true,
      data: await this.debtReportService.getDebtClientList(dto),
    };
  }

  @Post(':clientId/followup')
  @ApiOperation({ summary: 'Follow-up yaratish' })
  async createFollowup(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() dto: CreateFollowupDto,
    @Headers('user-id') userId: number,
  ) {
    return {
      success: true,
      data: await this.debtReportService.createFollowup(clientId, dto, userId),
    };
  }

  @Post('export')
  @ApiOperation({ summary: 'Qarzdorlik hisoboti export' })
  async exportDebtReport(
    @Body() dto: ExportDebtReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.debtReportService.exportDebtReport(dto);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="debt-report-${dto.start_date}.xlsx"`);
    res.send(buffer);
  }
}
