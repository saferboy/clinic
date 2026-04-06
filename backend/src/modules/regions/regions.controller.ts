import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { FilterRegionQueryDto } from './dto/filter-region-query.dto';
import { RegionsService } from './regions.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('regions')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Post()
  create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateRegionDto) {
    return this.regionsService.create(dto, req.user);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Nom bo\'yicha qidiruv' })
  @ApiQuery({ name: 'status', required: false, enum: RecordStatus, description: 'Status bo\'yicha filter' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Sahifa raqami' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Bir sahifadagi elementlar soni' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Saralash maydoni' })
  @ApiQuery({ name: 'order', required: false, type: String, enum: ['asc', 'desc'], description: 'Saralash tartibi' })
  findMany(@Query() query: FilterRegionQueryDto) {
    return this.regionsService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.regionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Request() req: { user: ICurrentUser }, @Body() dto: UpdateRegionDto) {
    return this.regionsService.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.regionsService.remove(id);
  }
}

