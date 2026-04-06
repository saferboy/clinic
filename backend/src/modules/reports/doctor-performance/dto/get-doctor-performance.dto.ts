import { IsDateString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetDoctorPerformanceDto {
  @ApiProperty({ description: 'Shifokor ID', example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  doctor_id: number;

  @ApiProperty({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Tugash sanasi', example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

export class GetDoctorRankingDto {
  @ApiProperty({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Tugash sanasi', example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({ description: 'Limit', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export enum TrendInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class GetDoctorTrendDto {
  @ApiProperty({ description: 'Shifokor ID', example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  doctor_id: number;

  @ApiProperty({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Tugash sanasi', example: '2024-03-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({ description: 'Interval', enum: TrendInterval, example: 'month' })
  @IsOptional()
  @IsEnum(TrendInterval)
  interval?: TrendInterval;
}

export class ExportDoctorPerformanceDto {
  @ApiProperty({ description: 'Shifokor ID', example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  doctorId: number;

  @ApiProperty({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Tugash sanasi', example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({ description: 'Format', enum: ['excel', 'pdf'], example: 'excel' })
  @IsEnum(['excel', 'pdf'])
  @IsNotEmpty()
  format: string;
}
