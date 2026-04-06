import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DashboardPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class GetDashboardMetricsDto {
  @ApiPropertyOptional({ description: 'Period', enum: DashboardPeriod, example: 'month' })
  @IsOptional()
  @IsEnum(DashboardPeriod)
  period?: DashboardPeriod;

  @ApiPropertyOptional({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Tugash sanasi', example: '2024-01-31' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class ExportDashboardDto {
  @ApiPropertyOptional({ description: 'Period', enum: DashboardPeriod, example: 'month' })
  @IsEnum(DashboardPeriod)
  period: DashboardPeriod;

  @ApiPropertyOptional({ description: 'Format', enum: ['pdf', 'excel'], example: 'excel' })
  @IsEnum(['pdf', 'excel'])
  format: string;
}
