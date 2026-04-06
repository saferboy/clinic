import { IsDateString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetDebtReportDto {
  @ApiProperty({
    description: 'Boshlanish sanasi (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'Tugash sanasi (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;
}

export class GetDebtClientsDto {
  @ApiProperty({
    description: 'Boshlanish sanasi',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'Tugash sanasi',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({
    description: 'Sahifa raqami',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Limit (1-100)',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Minimal qarz summasi',
    example: 1000000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_debt?: number;

  @ApiPropertyOptional({
    description: 'Minimal kun soni',
    example: 30,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  days_overdue?: number;

  @ApiPropertyOptional({
    description: 'Sort maydoni',
    enum: ['debt_amount', 'days_overdue', 'client_name'],
    example: 'debt_amount',
  })
  @IsOptional()
  @IsEnum(['debt_amount', 'days_overdue', 'client_name'])
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Sort tartibi',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: string;
}

export enum FollowupType {
  SMS = 'SMS',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  VISIT = 'VISIT',
  LEGAL = 'LEGAL',
}

export class CreateFollowupDto {
  @ApiProperty({
    description: 'Follow-up turi',
    enum: FollowupType,
    example: 'SMS',
  })
  @IsEnum(FollowupType)
  @IsNotEmpty()
  type: FollowupType;

  @ApiPropertyOptional({
    description: 'Izoh',
    example: 'Qarzdorlik bo\'yicha eslatma',
  })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Vada qilingan summa',
    example: 2000000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  promisedAmount?: number;

  @ApiPropertyOptional({
    description: 'Vada qilingan sana',
    example: '2024-02-15',
  })
  @IsOptional()
  @IsDateString()
  promisedDate?: string;

  @ApiPropertyOptional({
    description: 'Keyingi follow-up sana',
    example: '2024-02-10',
  })
  @IsOptional()
  @IsDateString()
  followupDate?: string;
}

export class ExportDebtReportDto {
  @ApiProperty({
    description: 'Boshlanish sanasi',
    example: '2024-01-01',
  })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({
    description: 'Tugash sanasi',
    example: '2024-01-31',
  })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiProperty({
    description: 'Export formati',
    enum: ['excel', 'pdf'],
    example: 'excel',
  })
  @IsEnum(['excel', 'pdf'])
  @IsNotEmpty()
  format: string;

  @ApiPropertyOptional({
    description: 'Tafsilotlarni qo\'shish',
    example: true,
  })
  @IsOptional()
  includeDetails?: boolean;
}
