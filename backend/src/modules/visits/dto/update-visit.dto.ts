import { PartialType } from '@nestjs/swagger';
import { CreateVisitDto } from './create-visit.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsInt,
  Min,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {}

export class UpdateVisitStatusDto {
  @ApiProperty({ 
    description: 'Yangi status', 
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DONE'],
    example: 'IN_PROGRESS'
  })
  @IsEnum({
    SCHEDULED: 'SCHEDULED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
    DONE: 'DONE',
  })
  @IsNotEmpty()
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'DONE';
}

export class AddVisitServiceDto {
  @ApiProperty({ description: 'Xizmat ID', example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  service_id: number;

  @ApiPropertyOptional({ description: 'Miqdor', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Narx (so\'m)', example: 100000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;
}

export class AssignVisitRoomDto {
  @ApiPropertyOptional({ description: 'Xona ID (bo\'sh bo\'lsa avtomatik tanlanadi)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  room_id?: number;

  @ApiPropertyOptional({ description: 'Boshlanish vaqti', example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  started_at?: string;
}

export class LinkVisitReferralDto {
  @ApiProperty({ description: 'Tavsiya ID', example: 1 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  referral_id: number;
}

export class CreateVisitPaymentDto {
  @ApiProperty({ description: 'To\'lov summasi (so\'m)', example: 250000 })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'To\'lov tavsifi', example: 'Naqd to\'lov' })
  @IsOptional()
  @IsString()
  description?: string;
}
