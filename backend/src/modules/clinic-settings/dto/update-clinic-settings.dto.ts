import { IsString, IsOptional, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClinicSettingsDto {
  @ApiProperty({ description: 'Klinika nomi', example: 'MedClinic' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'INN', example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tin?: string;

  @ApiPropertyOptional({ description: 'Manzil', example: 'Toshkent, Yunusobod tumani' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Telefon', example: '+998712345678' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'info@medclinic.uz' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Veb-sayt', example: 'www.medclinic.uz' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @ApiPropertyOptional({ description: 'Ish boshlanishi', example: '08:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Vaqt formati HH:MM bo\'lishi kerak' })
  work_start?: string;

  @ApiPropertyOptional({ description: 'Ish tugashi', example: '18:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Vaqt formati HH:MM bo\'lishi kerak' })
  work_end?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo_url?: string;
}
