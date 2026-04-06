import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FilterRegionQueryDto {
  @ApiPropertyOptional({ example: 'Toshkent', description: 'Nom bo\'yicha qidiruv' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RecordStatus, example: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @ApiPropertyOptional({ example: 1, description: 'Sahifa raqami', minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Bir sahifadagi elementlar soni', minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'created_at', description: 'Saralash maydoni' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ example: 'desc', description: 'Saralash tartibi', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';
}
