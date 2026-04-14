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
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto, UpdateRoomStatusDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('rooms')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto, req.user.id);
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

  @Get('stats')
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  getStats(@Query() query: { department_id?: number }) {
    return this.roomsService.getStats(query.department_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req: { user: ICurrentUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto, req.user.id);
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
  updateStatus(@Request() req: { user: ICurrentUser }, @Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomStatusDto) {
    return this.roomsService.updateStatus(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Request() req: { user: ICurrentUser }, @Param('id', ParseIntPipe) id: number) {
    return this.roomsService.remove(id, req.user.id);
  }
}
