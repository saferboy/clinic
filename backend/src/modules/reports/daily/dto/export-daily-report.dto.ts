import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
}

export class ExportDailyReportDto {
  @ApiProperty({
    description: 'Hisobot sanasi',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Export formati',
    enum: ExportFormat,
    example: 'excel',
  })
  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format: ExportFormat;

  @ApiPropertyOptional({
    description: 'Tafsilotlarni qo\'shish',
    example: true,
  })
  @IsOptional()
  includeDetails?: boolean;
}
