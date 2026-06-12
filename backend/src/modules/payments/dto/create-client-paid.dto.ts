import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientPaidDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  client_id: number;

  @ApiProperty({ example: 50000 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  visit_id?: number;

  @ApiPropertyOptional({ example: "Avans to'lov" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-19T10:00:00Z' })
  @IsOptional()
  @IsString()
  payment_date?: string;
}
