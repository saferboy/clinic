import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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
  create(@Request() req: { user: ICurrentUser }, @Body() dto: CreateUserRoleDto) {
    return this.userRolesService.create(dto, req.user);
  }

  @Get()
  @Permissions('role:read')
  findMany() {
    return this.userRolesService.findMany();
  }

  @Get(':id')
  @Permissions('role:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userRolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('role:update')
  update(@Param('id', ParseIntPipe) id: number, @Request() req: { user: ICurrentUser }, @Body() dto: UpdateUserRoleDto) {
    return this.userRolesService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Permissions('role:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userRolesService.remove(id);
  }
}

