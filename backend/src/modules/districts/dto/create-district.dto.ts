import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class CreateDistrictDto {
  @ApiProperty({ example: 'Yunusobod' })
  @IsString()
  @MaxLength(100)
  @IsUnique('loc_districts', 'name', { message: 'District name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name!: string;

  @ApiProperty({ example: 1, description: 'Region ID' })
  @IsInt()
  @Min(1)
  region_id!: number;

  @ApiPropertyOptional({ enum: RecordStatus, default: RecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus = RecordStatus.ACTIVE;
}

