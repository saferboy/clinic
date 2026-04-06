import { IsOptional, IsInt, Min, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetClientReportDto {
  @ApiPropertyOptional({
    description: 'Boshlanish sanasi',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'Tugash sanasi',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Guruh ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  group_id?: number;

  @ApiPropertyOptional({
    description: 'Manba ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  source_id?: number;

  @ApiPropertyOptional({
    description: 'Qarzдор mijozlar',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  has_debt?: boolean;

  @ApiPropertyOptional({
    description: 'Sahifa',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: 'Limit',
    example: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}
