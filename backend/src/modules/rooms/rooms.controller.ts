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
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto, UpdateRoomStatusDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'record_status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findMany(@Query() query: any) {
    return this.roomsService.findMany(query);
  }

  @Get('available')
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAvailable(@Query() query: { department_id?: number; limit?: number }) {
    return this.roomsService.findAvailable(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiBody({
    type: UpdateRoomStatusDto,
    description: 'Xona statusini o\'zgartirish',
    examples: {
      occupied: {
        summary: 'Xonani band qilish',
        value: { status: 'OCCUPIED', reason: 'Visit boshlandi' },
      },
      available: {
        summary: 'Xonani bo\'shatish',
        value: { status: 'AVAILABLE', reason: 'Visit yakunlandi' },
      },
      maintenance: {
        summary: 'Ta\'mirlashga qo\'yish',
        value: { status: 'MAINTENANCE', reason: 'Jihoz buzildi' },
      },
    },
  })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomStatusDto) {
    return this.roomsService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id);
  }
}
