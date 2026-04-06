import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IsPhoneUz } from '../../../common/decorators/is-phone-uz.decorator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  role_id?: number;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: 'jdoe' })
  @IsString()
  @MaxLength(50)
  @IsUnique('users', 'login', { message: 'Login already exists' })
  login!: string;

  @ApiProperty({ minLength: 4, example: '1234' })
  @IsString()
  @MinLength(4)
  @MaxLength(255)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
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
  description?: string;

  @ApiPropertyOptional({ enum: RecordStatus, default: RecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus = RecordStatus.ACTIVE;
}

// Debug: log decorators
console.log('CreateUserDto loaded - password MinLength: 4');

