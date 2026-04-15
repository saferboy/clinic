import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientsService } from './clients.service';

@ApiTags('clients')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'phone', required: false, type: String })
  @ApiQuery({ name: 'full_name', required: false, type: String })
  @ApiQuery({ name: 'group_id', required: false, type: Number })
  @ApiQuery({ name: 'region_id', required: false, type: Number })
  @ApiQuery({ name: 'district_id', required: false, type: Number })
  @ApiQuery({ name: 'source_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, type: String })
  findMany(@Query() query: any) {
    return this.clientsService.findMany(query);
  }

  @Get('stats')
  getStats() {
    return this.clientsService.getStats();
  }

  @Get('search')
  @ApiQuery({ name: 'phone', required: false, type: String })
  @ApiQuery({ name: 'full_name', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  search(@Query() query: { phone?: string; full_name?: string; limit?: number }) {
    return this.clientsService.search(query);
  }

  @Get('export')
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'gender', required: false, type: String })
  @ApiQuery({ name: 'group_id', required: false, type: Number })
  @ApiQuery({ name: 'full_name', required: false, type: String })
  async export(@Res() res: any, @Query() query: any) {
    const buffer = await this.clientsService.exportAll(query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="mijozlar.xlsx"');
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.remove(id);
  }

  @Get(':id/balance')
  getBalance(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.getBalance(id);
  }

  @Get(':id/visits')
  getVisits(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.clientsService.getVisits(id, query);
  }

  @Get(':id/payments')
  getPayments(@Param('id', ParseIntPipe) id: number, @Query() query: any) {
    return this.clientsService.getPayments(id, query);
  }
}
