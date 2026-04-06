import { IsInt, Min, Max, IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
}

export class ExportMonthlyReportDto {
  @ApiProperty({
    description: 'Oy (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  @Type(() => Number)
  month: number;

  @ApiProperty({
    description: 'Yil',
    example: 2024,
    minimum: 2020,
    maximum: 2100,
  })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsNotEmpty()
  @Type(() => Number)
  year: number;

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
  @IsBoolean()
  includeDetails?: boolean;
}
