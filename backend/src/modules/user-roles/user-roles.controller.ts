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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { GetUserRolesQueryDto } from './dto/get-user-roles-query.dto';
import { UserRolesService } from './user-roles.service';
import { ICurrentUser } from '../../common/interfaces/current-user.interface';

@ApiTags('user-roles')
@ApiBearerAuth('bearer')
@Controller('user-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  @Permissions('role:create')
  async create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateUserRoleDto) {
    const data = await this.userRolesService.create(dto, req.user);
    return { success: true, message: 'Rol muvaffaqiyatli yaratildi', data };
  }

  @Get()
  @Permissions('role:read')
  async findMany(@Query() query: GetUserRolesQueryDto) {
    const data = await this.userRolesService.findMany(query);
    return { success: true, message: 'Rollar ro\'yxati', data };
  }

  @Get('all')
  @Permissions('role:read')
  async findAll() {
    const data = await this.userRolesService.findAll();
    return { success: true, message: 'Barcha rollar', data };
  }

  @Get(':id')
  @Permissions('role:read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userRolesService.findOne(id);
    return { success: true, message: 'Rol topildi', data };
  }

  @Patch(':id')
  @Permissions('role:update')
  async update(@Param('id', ParseIntPipe) id: number, @Request() req: { user: ICurrentUser }, @Body() dto: UpdateUserRoleDto) {
    const data = await this.userRolesService.update(id, dto, req.user);
    return { success: true, message: 'Rol yangilandi', data };
  }

  @Delete(':id')
  @Permissions('role:delete')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.userRolesService.remove(id);
    return { success: true, message: 'Rol o\'chirildi', data };
  }
}

