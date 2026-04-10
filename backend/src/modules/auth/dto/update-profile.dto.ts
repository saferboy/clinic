import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'To\'liq ism',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  @MinLength(2, { message: 'Ism kamida 2 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Ism 100 belgidan oshmasligi kerak' })
  full_name?: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsEmail({}, { message: 'Noto\'g\'ri email formati' })
  email?: string;

  @ApiProperty({
    description: 'Telefon raqami',
    example: '+998901234567',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  @MaxLength(20, { message: 'Telefon raqami 20 belgidan oshmasligi kerak' })
  phone?: string;
}
