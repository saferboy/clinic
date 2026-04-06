import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Login yoki email',
    example: 'admin',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Login kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Login 100 belgidan oshmasligi kerak' })
  login: string;

  @ApiProperty({
    description: 'Parol',
    example: '12345',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  password: string;
}
