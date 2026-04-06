import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPasswordStrong } from '../../../common/decorators/is-password-strong.decorator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Eski parol',
    example: 'Admin@123',
  })
  @IsString()
  @IsNotEmpty()
  old_password: string;

  @ApiProperty({
    description: 'Yangi parol',
    example: 'NewAdmin@456',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @IsPasswordStrong({
    message: 'Yangi parol kamida 8 belgi, katta harf, kichik harf, raqam va maxsus belgi bo\'lishi kerak',
  })
  @MaxLength(255)
  new_password: string;
}
