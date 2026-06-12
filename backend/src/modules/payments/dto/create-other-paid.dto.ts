import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentType } from '@prisma/client';

export class CreateOtherPaidDto {
  @ApiProperty({ enum: PaymentType, example: 'OUTCOME' })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ example: 200000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  group_id?: number;

  @ApiPropertyOptional({ example: "Elektr to'lovi" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-19T10:00:00Z' })
  @IsOptional()
  @IsString()
  payment_date?: string;
}
