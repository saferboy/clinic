import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateUserRoleDto } from './create-user-role.dto';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class UpdateUserRoleDto extends PartialType(CreateUserRoleDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsUnique('user_roles', 'name', { message: 'Role name already exists' })
  @IsSanitized({ message: 'Role name contains dangerous content' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSanitized({ message: 'Description contains dangerous content' })
  description?: string;
}
