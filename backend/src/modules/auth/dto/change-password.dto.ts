import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Eski parol',
    example: '12345',
  })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({
    description: 'Yangi parol',
    example: 'newpass',
    minLength: 4,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Parol kamida 4 belgi bo\'lishi kerak' })
  @MaxLength(255)
  new_password: string;
}
