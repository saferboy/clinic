import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';

export class CreatePaymentDto {
  @ApiProperty({ enum: PaymentType, example: 'INCOME' })
  @IsEnum(PaymentType)
  payment_type: PaymentType;

  @ApiProperty({ example: 150000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: "Visit uchun to'lov" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  client_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  visit_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiPropertyOptional({ example: '2026-05-19T10:00:00Z' })
  @IsOptional()
  @IsString()
  payment_date?: string;
}
