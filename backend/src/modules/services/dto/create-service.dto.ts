import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Xizmat nomi', example: 'Terapevt ko\'rigi' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Xizmat nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Xizmat nomi 100 belgidan oshmasligi kerak' })
  name: string;

  @ApiProperty({ description: 'Narx (so\'m)', example: 100000 })
  @IsInt()
  @Min(0, { message: 'Narx manfiy bo\'lishi mumkin emas' })
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({ description: 'Bo\'lim ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @ApiPropertyOptional({ description: 'Davomiyligi (daqiqa)', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(5, { message: 'Davomiylik kamida 5 daqiqa bo\'lishi kerak' })
  @Max(480, { message: 'Davomiylik 480 daqiqadan oshmasligi kerak' })
  duration_min?: number;

  @ApiPropertyOptional({ description: 'Qo\'shimcha tavsif', example: 'Bosh terapevt ko\'rigi va maslahati' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Holat', enum: RecordStatusEnum, default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}
