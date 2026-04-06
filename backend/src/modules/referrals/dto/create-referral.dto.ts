import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RecordStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class CreateReferralDto {
  @ApiProperty({ description: 'Tavsiya qiluvchi F.I.O', example: 'Dr. John Smith' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Tavsiya nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Tavsiya nomi 100 belgidan oshmasligi kerak' })
  full_name: string;

  @ApiPropertyOptional({ description: 'Telefon raqam', example: '+998901234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+998[0-9]{9}$/, {
    message: 'Telefon raqam +998901234567 formatda bo\'lishi kerak',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'Qo\'shimcha tavsif', example: 'Doimiy tavsiya qiluvchi' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Holat', enum: RecordStatusEnum, default: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatusEnum)
  status?: RecordStatusEnum;
}

export class CreateVisitReferralDto {
  @IsString()
  @IsNotEmpty()
  referral_id: number;
}
