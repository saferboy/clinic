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
import { ApiTags, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto, UpdateServicePriceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@ApiTags('services')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'min_price', required: false, type: Number })
  @ApiQuery({ name: 'max_price', required: false, type: Number })
  findMany(@Query() query: any) {
    return this.servicesService.findMany(query);
  }

  @Get('departments/:departmentId')
  findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number, @Query() query: any) {
    return this.servicesService.findByDepartment(departmentId, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Patch(':id/price')
  @ApiBody({
    type: UpdateServicePriceDto,
    description: 'Xizmat narxini yangilash',
    examples: {
      default: {
        summary: 'Narx yangilash',
        value: { price: 120000, reason: 'Narxlar indeksatsiyasi' },
      },
    },
  })
  updatePrice(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServicePriceDto) {
    return this.servicesService.updatePrice(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.remove(id);
  }
}
