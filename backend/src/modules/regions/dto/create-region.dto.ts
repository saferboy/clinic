import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class CreateRegionDto {
  @ApiProperty({ example: 'Toshkent' })
  @IsString()
  @MaxLength(100)
  @IsUnique('loc_regions', 'name', { message: 'Region name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name!: string;

  @ApiPropertyOptional({ enum: RecordStatus, default: RecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus = RecordStatus.ACTIVE;
}

