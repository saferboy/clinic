import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum VisitStatusEnum {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  DONE = 'DONE',
}

export class CreateVisitDto {
  @ApiProperty({ description: 'Mijoz ID', example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  client_id: number;

  @ApiPropertyOptional({ description: 'Shifokor ID', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  doctor_id?: number;

  @ApiPropertyOptional({ description: 'Qabul sanasi', example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  visit_date?: string;

  @ApiPropertyOptional({ description: 'Tavsif (shikoyat)', example: 'Bosh og\'rig\'i, harorat' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Status', enum: VisitStatusEnum, default: 'SCHEDULED' })
  @IsOptional()
  @IsEnum(VisitStatusEnum)
  status?: VisitStatusEnum;
}
