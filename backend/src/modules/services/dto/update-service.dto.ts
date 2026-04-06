import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';
import { IsInt, Min, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class UpdateServicePriceDto {
  @IsInt()
  @Min(0, { message: 'Narx manfiy bo\'lishi mumkin emas' })
  @IsNotEmpty()
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
