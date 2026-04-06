import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
  Matches,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClientGenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateClientDto {
  @ApiProperty({ description: "Mijozning to'liq ismi", example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Mijoz nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Mijoz nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/, {
    message: 'Mijoz nomi faqat harf, space, \', - belgilarini o\'z ichiga olishi mumkin',
  })
  full_name: string;

  @ApiProperty({ description: 'Telefon raqam', example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Telefon raqam +998901234567 formatda bo\'lishi kerak',
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Mijoz guruhi ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  group_id?: number;

  @ApiProperty({ description: 'Jinsi', enum: ClientGenderEnum })
  @IsEnum(ClientGenderEnum)
  @IsNotEmpty()
  gender: ClientGenderEnum;

  @ApiPropertyOptional({ description: 'Tug\'ilgan sana', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiPropertyOptional({ description: 'Viloyat ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  region_id?: number;

  @ApiPropertyOptional({ description: 'Tuman ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  district_id?: number;

  @ApiPropertyOptional({ description: 'Manzil', example: 'Toshkent shahar, Chilonzor tumani' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Manba ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  source_id?: number;

  @ApiPropertyOptional({ description: 'Qo\'shimcha ma\'lumot', example: 'Doimiy mijoz' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Holat', enum: RecordStatusEnum, default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}
