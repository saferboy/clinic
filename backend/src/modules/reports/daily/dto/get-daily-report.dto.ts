import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetDailyReportDto {
  @ApiPropertyOptional({
    description: 'Hisobot sanasi (YYYY-MM-DD format)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
