import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { FilterDistrictQueryDto } from './dto/filter-district-query.dto';
import { DistrictsService } from './districts.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('districts')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Post()
  create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateDistrictDto) {
    return this.districtsService.create(dto, req.user);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Nom bo\'yicha qidiruv' })
  @ApiQuery({ name: 'region_id', required: false, type: Number, description: 'Viloyat ID bo\'yicha filter' })
  @ApiQuery({ name: 'status', required: false, enum: RecordStatus, description: 'Status bo\'yicha filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Sahifa raqami' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Bir sahifadagi elementlar soni' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Saralash maydoni' })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['asc', 'desc'], description: 'Saralash tartibi' })
  findMany(@Query() query: FilterDistrictQueryDto) {
    return this.districtsService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Request() req: { user: ICurrentUser }, @Body() dto: UpdateDistrictDto) {
    return this.districtsService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.districtsService.remove(id);
  }
}

