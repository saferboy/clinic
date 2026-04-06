import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RoomStatusEnum {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLOSED = 'CLOSED',
}

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateRoomDto {
  @ApiProperty({ description: 'Xona nomi', example: 'Terapiya Kabineti 1' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Xona nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Xona nomi 100 belgidan oshmasligi kerak' })
  name: string;

  @ApiPropertyOptional({ description: 'Xona raqami', example: '101' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @Matches(/^[0-9A-Za-z]+$/, {
    message: 'Xona raqami faqat harf va raqamlardan iborat bo\'lishi kerak',
  })
  room_number?: string;

  @ApiPropertyOptional({ description: 'Bo\'lim ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  department_id?: number;

  @ApiPropertyOptional({ description: 'Xona statusi', enum: RoomStatusEnum, default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(RoomStatusEnum)
  status?: RoomStatusEnum;

  @ApiPropertyOptional({ description: 'Qo\'shimcha tavsif', example: '2 ta karavot, kompyuter' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Yozuv holati', enum: RecordStatusEnum, default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatusEnum)
  record_status?: RecordStatusEnum;
}
