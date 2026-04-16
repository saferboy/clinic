import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { IsOptional, IsEnum, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetClientGroupsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 8;

  @ApiPropertyOptional({ enum: RecordStatus })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}