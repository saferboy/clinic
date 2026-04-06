import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetMonthlyReportDto {
  @ApiPropertyOptional({
    description: 'Hisobot oyi (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({
    description: 'Hisobot yili',
    example: 2024,
    minimum: 2020,
    maximum: 2100,
  })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year?: number;

  @ApiPropertyOptional({
    description: 'Oldingi oy bilan solishtirma',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  compare?: boolean;
}
