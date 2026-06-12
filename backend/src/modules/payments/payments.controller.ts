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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateClientPaidDto } from './dto/create-client-paid.dto';
import { CreateOtherPaidGroupDto, UpdateOtherPaidGroupDto } from './dto/create-other-paid-group.dto';
import { CreateOtherPaidDto } from './dto/create-other-paid.dto';

// ----------------------------------------------------------------
// /payments
// ----------------------------------------------------------------
@ApiTags('payments')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('summary')
  @Permissions('payment:read')
  @ApiOperation({ summary: "To'lov xulosasi" })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  findPaymentSummary(
    @Query('date_from') date_from?: string,
    @Query('date_to') date_to?: string,
  ) {
    return this.paymentsService.findPaymentSummary(date_from, date_to);
  }

  @Get()
  @Permissions('payment:read')
  @ApiOperation({ summary: "To'lovlar ro'yxati" })
  @ApiQuery({ name: 'payment_type', required: false, enum: ['INCOME', 'OUTCOME'] })
  @ApiQuery({ name: 'client_id', required: false, type: Number })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findPayments(@Query() query: any) {
    return this.paymentsService.findPayments(query);
  }

  @Get(':id')
  @Permissions('payment:read')
  @ApiOperation({ summary: "To'lovni ID bo'yicha olish" })
  findPaymentById(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findPaymentById(id);
  }

  @Post()
  @Permissions('payment:create')
  @ApiOperation({ summary: "Yangi to'lov yaratish" })
  createPayment(@Body() dto: CreatePaymentDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 1;
    return this.paymentsService.createPayment(dto, userId);
  }

  @Delete(':id')
  @Permissions('payment:delete')
  @ApiOperation({ summary: "To'lovni o'chirish (soft delete)" })
  removePayment(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.removePayment(id);
  }
}

// ----------------------------------------------------------------
// /client-paid
// ----------------------------------------------------------------
@ApiTags('client-paid')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('client-paid')
export class ClientPaidController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Permissions('payment:create')
  @ApiOperation({ summary: "Mijoz to'lovi yaratish" })
  createClientPaid(@Body() dto: CreateClientPaidDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 1;
    return this.paymentsService.createClientPaid(dto, userId);
  }

  @Get()
  @Permissions('payment:read')
  @ApiOperation({ summary: "Mijoz to'lovlari ro'yxati" })
  @ApiQuery({ name: 'client_id', required: false, type: Number })
  @ApiQuery({ name: 'visit_id', required: false, type: Number })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findClientPaid(@Query() query: any) {
    return this.paymentsService.findClientPaid(query);
  }

  @Delete(':id')
  @Permissions('payment:delete')
  @ApiOperation({ summary: "Mijoz to'lovini o'chirish (soft delete)" })
  removeClientPaid(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.removeClientPaid(id);
  }
}

// ----------------------------------------------------------------
// /other-paid-groups
// ----------------------------------------------------------------
@ApiTags('other-paid-groups')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('other-paid-groups')
export class OtherPaidGroupsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Permissions('payment:read')
  @ApiOperation({ summary: 'Guruhlar ro\'yxati' })
  findOtherPaidGroups() {
    return this.paymentsService.findOtherPaidGroups();
  }

  @Post()
  @Permissions('payment:create')
  @ApiOperation({ summary: 'Yangi guruh yaratish' })
  createOtherPaidGroup(@Body() dto: CreateOtherPaidGroupDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 1;
    return this.paymentsService.createOtherPaidGroup(dto, userId);
  }

  @Patch(':id')
  @Permissions('payment:update')
  @ApiOperation({ summary: 'Guruhni yangilash' })
  updateOtherPaidGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOtherPaidGroupDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 1;
    return this.paymentsService.updateOtherPaidGroup(id, dto, userId);
  }

  @Delete(':id')
  @Permissions('payment:delete')
  @ApiOperation({ summary: "Guruhni o'chirish (soft delete)" })
  removeOtherPaidGroup(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.removeOtherPaidGroup(id);
  }
}

// ----------------------------------------------------------------
// /other-paid
// ----------------------------------------------------------------
@ApiTags('other-paid')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('other-paid')
export class OtherPaidController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Permissions('payment:read')
  @ApiOperation({ summary: "Boshqa to'lovlar ro'yxati" })
  @ApiQuery({ name: 'type', required: false, enum: ['INCOME', 'OUTCOME'] })
  @ApiQuery({ name: 'group_id', required: false, type: Number })
  @ApiQuery({ name: 'date_from', required: false, type: String })
  @ApiQuery({ name: 'date_to', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  findOtherPaid(@Query() query: any) {
    return this.paymentsService.findOtherPaid(query);
  }

  @Post()
  @Permissions('payment:create')
  @ApiOperation({ summary: "Yangi boshqa to'lov yaratish" })
  createOtherPaid(@Body() dto: CreateOtherPaidDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 1;
    return this.paymentsService.createOtherPaid(dto, userId);
  }

  @Delete(':id')
  @Permissions('payment:delete')
  @ApiOperation({ summary: "Boshqa to'lovni o'chirish (soft delete)" })
  removeOtherPaid(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.removeOtherPaid(id);
  }
}
