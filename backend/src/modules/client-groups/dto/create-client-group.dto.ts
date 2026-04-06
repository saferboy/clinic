import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class CreateClientGroupDto {
  @ApiProperty({ example: 'Default' })
  @IsString()
  @MaxLength(100)
  @IsUnique('client_groups', 'name', { message: 'Client group name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSanitized({ message: 'Description contains dangerous content' })
  description?: string;

  @ApiPropertyOptional({ enum: RecordStatus, default: RecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus = RecordStatus.ACTIVE;
}

