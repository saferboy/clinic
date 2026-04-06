import { IsDateString, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetDailyTrendDto {
  @ApiProperty({
    description: 'Hisobot sanasi',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiPropertyOptional({
    description: 'Solishtirma kunlar soni (1-30)',
    example: 7,
    minimum: 1,
    maximum: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  @Type(() => Number)
  compare_days?: number;
}
