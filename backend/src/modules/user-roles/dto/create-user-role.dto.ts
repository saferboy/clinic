import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export interface UserRolePermissions {
  client?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  role?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  user?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  department?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  region?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  district?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  source?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  'client-group'?: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean };
  all?: boolean;
  [key: string]:
    | { create?: boolean; read?: boolean; update?: boolean; delete?: boolean }
    | boolean
    | undefined;
}

export class CreateUserRoleDto {
  @ApiProperty({ example: 'ADMIN', description: 'Role nomi (noyob bo\'lishi kerak)' })
  @IsString()
  @MaxLength(50)
  @IsUnique('user_roles', 'name', { message: 'Role name already exists' })
  @IsSanitized({ message: 'Role name contains dangerous content' })
  name!: string;

  @ApiPropertyOptional({ example: 'Tizim administratori' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSanitized({ message: 'Description contains dangerous content' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ruxsatnomalar obyekti',
    example: { client: { create: true, read: true, update: true, delete: true } },
  })
  @IsOptional()
  @IsObject()
  permissions?: UserRolePermissions;

  @ApiPropertyOptional({ enum: RecordStatus, default: RecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}

