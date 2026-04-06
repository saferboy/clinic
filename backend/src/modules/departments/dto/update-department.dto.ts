import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { CreateDepartmentDto } from './create-department.dto';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiPropertyOptional({
    description: 'Bo\'lim nomi, 3-100 belgi, faqat lotin, kirill, sonlar, space, \', - belgilari ruxsat',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Bo\'lim nomi kamida 3 belgi bo\'lishi kerak' })
  @MaxLength(100, { message: 'Bo\'lim nomi 100 belgidan oshmasligi kerak' })
  @Matches(/^[a-zA-Z\u0400-\u04FF0-9\s'-]+$/, {
    message: 'Bo\'lim nomi faqat harf, sonlar, space, \', - belgilarini o\'z ichiga olishi mumkin',
  })
  @IsUnique('departments', 'name', {
    message: 'Department name already exists',
  })
  @IsSanitized({ message: 'Department name contains dangerous content' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Bo\'lim tavsifi, maksimal 255 belgi',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tavsif 255 belgidan oshmasligi kerak' })
  @IsSanitized({ message: 'Description contains dangerous content' })
  description?: string;
}

