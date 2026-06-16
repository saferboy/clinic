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
  @IsString({ message: "To'liq ism matn bo'lishi kerak" })
  @IsNotEmpty({ message: "To'liq ism bo'sh bo'lmasligi kerak" })
  @MinLength(3, { message: "To'liq ism kamida 3 belgi bo'lishi kerak" })
  @MaxLength(100, { message: "To'liq ism 100 belgidan oshmasligi kerak" })
  @Matches(/^[a-zA-ZЀ-ӿ\s'-]+$/, {
    message: "To'liq ism faqat harf, bo'shliq, ' va - belgilarini o'z ichiga olishi mumkin",
  })
  full_name: string;

  @ApiProperty({ description: 'Telefon raqam', example: '+998901234567' })
  @IsString({ message: 'Telefon raqam matn bo\'lishi kerak' })
  @IsNotEmpty({ message: 'Telefon raqam bo\'sh bo\'lmasligi kerak' })
  @Matches(/^\+998[0-9]{9}$/, {
    message: "Telefon raqam +998901234567 formatda bo'lishi kerak",
  })
  phone: string;

  @ApiPropertyOptional({ description: 'Mijoz guruhi ID', example: 1 })
  @IsOptional()
  @IsInt({ message: 'Guruh ID butun son bo\'lishi kerak' })
  @Min(1, { message: 'Guruh ID noto\'g\'ri' })
  group_id?: number;

  @ApiProperty({ description: 'Jinsi', enum: ClientGenderEnum })
  @IsNotEmpty({ message: 'Jins bo\'sh bo\'lmasligi kerak' })
  @IsEnum(ClientGenderEnum, { message: 'Jins MALE, FEMALE yoki OTHER bo\'lishi kerak' })
  gender: ClientGenderEnum;

  @ApiPropertyOptional({ description: "Tug'ilgan sana", example: '1990-01-01' })
  @IsOptional()
  @IsDateString({}, { message: "Tug'ilgan sana to'g'ri formatda bo'lishi kerak (YYYY-MM-DD)" })
  date_of_birth?: string;

  @ApiPropertyOptional({ description: 'Viloyat ID', example: 1 })
  @IsOptional()
  @IsInt({ message: 'Viloyat ID butun son bo\'lishi kerak' })
  @Min(1, { message: 'Viloyat ID noto\'g\'ri' })
  region_id?: number;

  @ApiPropertyOptional({ description: 'Tuman ID', example: 1 })
  @IsOptional()
  @IsInt({ message: 'Tuman ID butun son bo\'lishi kerak' })
  @Min(1, { message: 'Tuman ID noto\'g\'ri' })
  district_id?: number;

  @ApiPropertyOptional({ description: 'Manzil', example: 'Toshkent shahar, Chilonzor tumani' })
  @IsOptional()
  @IsString({ message: 'Manzil matn bo\'lishi kerak' })
  @MaxLength(255, { message: 'Manzil 255 belgidan oshmasligi kerak' })
  address?: string;

  @ApiPropertyOptional({ description: 'Manba ID', example: 1 })
  @IsOptional()
  @IsInt({ message: 'Manba ID butun son bo\'lishi kerak' })
  @Min(1, { message: 'Manba ID noto\'g\'ri' })
  source_id?: number;

  @ApiPropertyOptional({ description: "Qo'shimcha ma'lumot", example: 'Doimiy mijoz' })
  @IsOptional()
  @IsString({ message: "Qo'shimcha ma'lumot matn bo'lishi kerak" })
  @MaxLength(1000, { message: "Qo'shimcha ma'lumot 1000 belgidan oshmasligi kerak" })
  description?: string;

  @ApiPropertyOptional({ description: 'Holat', enum: RecordStatusEnum, default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatusEnum, { message: 'Holat ACTIVE, INACTIVE yoki ARCHIVED bo\'lishi kerak' })
  status?: RecordStatusEnum;
}
