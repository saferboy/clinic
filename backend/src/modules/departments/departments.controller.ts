import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentsService } from './departments.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';
import { GetDepartmentsQueryDto } from './dto/get-departments-query.dto';

@ApiTags('departments')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  async create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateDepartmentDto) {
    const department = await this.departmentsService.create(dto, req.user);
    return {
      message: 'Department muvaffaqiyatli yaratildi',
      data: department,
    };
  }

  @Get()
  async findMany(@Query() query: GetDepartmentsQueryDto) {
    const result = await this.departmentsService.findMany(query);
    return {
      message: 'Departments ro\'yxati',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.departmentsService.findOne(id);
    return {
      message: 'Department topildi',
      data: result,
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto, @Request() req: { user: ICurrentUser }) {
    const department = await this.departmentsService.update(id, dto, req.user);
    return {
      message: 'Department yangilandi',
      data: department,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.departmentsService.remove(id);
    return {
      message: 'Department o\'chirildi',
    };
  }
}

