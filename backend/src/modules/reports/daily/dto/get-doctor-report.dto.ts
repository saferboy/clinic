import { IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetDoctorReportDto {
  @ApiProperty({
    description: 'Shifokor ID',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  doctor_id: number;

  @ApiPropertyOptional({
    description: 'Hisobot sanasi (YYYY-MM-DD format)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
