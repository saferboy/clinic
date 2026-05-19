import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetBirthdayReportDto {
  @ApiPropertyOptional({ example: 30, description: 'Necha kun oldinga qaralsin' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days_ahead?: number;
}
