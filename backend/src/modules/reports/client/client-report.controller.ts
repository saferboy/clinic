import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  ParseIntPipe,
  Res,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ClientReportService } from './client-report.service';
import { GetClientReportDto } from './dto/get-client-report.dto';

@ApiTags('Reports - Client')
@Controller('reports/clients')
export class ClientReportController {
  constructor(private readonly clientReportService: ClientReportService) {}

  @Get(':clientId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bitta mijoz hisoboti' })
  async getClientReport(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Headers('user-id') currentUserId: number,
    @Headers('user-role') currentUserRole: string,
  ) {
    return {
      success: true,
      data: await this.clientReportService.getClientReport(
        clientId,
        currentUserId,
        currentUserRole,
      ),
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mijozlar ro\'yxati' })
  async getClientList(@Query() dto: GetClientReportDto) {
    return {
      success: true,
      data: await this.clientReportService.getClientListReport(dto),
    };
  }

  @Get('segmentation')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mijoz segmentatsiyasi' })
  async getSegmentation() {
    return {
      success: true,
      data: await this.clientReportService.getClientSegmentation(),
    };
  }

  @Post('export')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mijoz hisoboti export' })
  async exportClientReport(
    @Query('clientId') clientId: number | null,
    @Query() dto: GetClientReportDto,
    @Res() res: Response,
  ) {
    const buffer = await this.clientReportService.exportClientReport(clientId, dto);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="client-report.xlsx"`,
    );
    res.send(buffer);
  }
}
