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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReferralDto, CreateVisitReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { ReferralsService } from './referrals.service';

@ApiTags('referrals')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  create(@Body() dto: CreateReferralDto) {
    return this.referralsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'phone', required: false, type: String })
  @ApiQuery({ name: 'full_name', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findMany(@Query() query: any) {
    return this.referralsService.findMany(query);
  }

  @Get('statistics')
  getStatistics() {
    return this.referralsService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.referralsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReferralDto) {
    return this.referralsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.referralsService.remove(id);
  }

  @Post('visits/:visitId')
  linkToVisit(@Param('visitId', ParseIntPipe) visitId: number, @Body() dto: CreateVisitReferralDto) {
    return this.referralsService.linkToVisit(visitId, dto);
  }
}
