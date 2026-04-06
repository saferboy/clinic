import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateVisitDto,
} from './dto/create-visit.dto';
import {
  UpdateVisitDto,
  UpdateVisitStatusDto,
  AddVisitServiceDto,
  AssignVisitRoomDto,
  LinkVisitReferralDto,
  CreateVisitPaymentDto,
} from './dto/update-visit.dto';
import { VisitsService } from './visits.service';

@ApiTags('visits')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  create(@Body() dto: CreateVisitDto) {
    return this.visitsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'client_id', required: false, type: Number })
  @ApiQuery({ name: 'doctor_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  findMany(@Query() query: any) {
    return this.visitsService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVisitDto) {
    return this.visitsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiBody({ type: UpdateVisitStatusDto })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVisitStatusDto) {
    return this.visitsService.updateStatus(id, dto);
  }

  @Post(':id/services')
  @ApiBody({ type: AddVisitServiceDto })
  addService(@Param('id', ParseIntPipe) id: number, @Body() dto: AddVisitServiceDto) {
    return this.visitsService.addService(id, dto);
  }

  @Post(':id/rooms')
  @ApiBody({ type: AssignVisitRoomDto })
  assignRoom(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignVisitRoomDto) {
    return this.visitsService.assignRoom(id, dto);
  }

  @Post(':id/referrals')
  @ApiBody({ type: LinkVisitReferralDto })
  linkReferral(@Param('id', ParseIntPipe) id: number, @Body() dto: LinkVisitReferralDto) {
    return this.visitsService.linkReferral(id, dto);
  }

  @Put(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.complete(id);
  }

  @Post(':id/payments')
  @ApiBody({ type: CreateVisitPaymentDto })
  createPayment(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateVisitPaymentDto) {
    return this.visitsService.createPayment(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.remove(id);
  }

  @Get(':id/services')
  getServices(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.getServices(id);
  }

  @Get(':id/rooms')
  getRooms(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.getRooms(id);
  }

  @Get(':id/payments')
  getPayments(@Param('id', ParseIntPipe) id: number) {
    return this.visitsService.getPayments(id);
  }
}
