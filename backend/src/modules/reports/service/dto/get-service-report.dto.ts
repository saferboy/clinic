import { IsDateString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetServiceReportDto {
  @ApiProperty({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Tugash sanasi', example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

export class GetServiceRankingDto {
  @ApiProperty({ description: 'Boshlanish sanasi', example: '2024-01-01' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ description: 'Tugash sanasi', example: '2024-01-31' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({ description: 'Limit (1-100)', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}

export class ExportServiceReportDto {
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
