import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateClientGroupDto } from './dto/create-client-group.dto';
import { UpdateClientGroupDto } from './dto/update-client-group.dto';
import { ClientGroupsService } from './client-groups.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('client-groups')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('client-groups')
export class ClientGroupsController {
  constructor(private readonly clientGroupsService: ClientGroupsService) {}

  @Post()
  async create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateClientGroupDto) {
    const clientGroup = await this.clientGroupsService.create(dto, req.user);
    return {
      message: 'Client group muvaffaqiyatli yaratildi',
      data: clientGroup,
    };
  }

  @Get()
  async findMany() {
    const result = await this.clientGroupsService.findMany();
    return {
      message: 'Client groups ro\'yxati',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.clientGroupsService.findOne(id);
    return {
      message: 'Client group topildi',
      data: result,
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Request() req: { user: ICurrentUser }, @Body() dto: UpdateClientGroupDto) {
    const clientGroup = await this.clientGroupsService.update(id, dto, req.user);
    return {
      message: 'Client group yangilandi',
      data: clientGroup,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientGroupsService.remove(id);
    return {
      message: 'Client group o\'chirildi',
    };
  }
}

