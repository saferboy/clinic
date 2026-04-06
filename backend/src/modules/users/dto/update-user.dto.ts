import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { IsPhoneUz } from '../../../common/decorators/is-phone-uz.decorator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ description: 'Set a new password (plain text)', example: '1234' })
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(255)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @IsPhoneUz({ message: 'Invalid phone number. Expected: +998901234567 or 901234567' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  @IsUnique('users', 'email', { message: 'Email already exists' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsUnique('users', 'login', { message: 'Login already exists' })
  login?: string;
}

