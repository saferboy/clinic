import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourcesService } from './sources.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('sources')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  async create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateSourceDto) {
    const source = await this.sourcesService.create(dto, req.user);
    return {
      message: 'Source muvaffaqiyatli yaratildi',
      data: source,
    };
  }

  @Get()
  async findMany() {
    const result = await this.sourcesService.findMany();
    return {
      message: 'Sources ro\'yxati',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.sourcesService.findOne(id);
    return {
      message: 'Source topildi',
      data: result,
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Request() req: { user: ICurrentUser }, @Body() dto: UpdateSourceDto) {
    const source = await this.sourcesService.update(id, dto, req.user);
    return {
      message: 'Source yangilandi',
      data: source,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.sourcesService.remove(id);
    return {
      message: 'Source o\'chirildi',
    };
  }
}

