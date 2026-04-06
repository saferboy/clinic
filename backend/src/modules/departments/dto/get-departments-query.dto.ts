import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecordStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetDepartmentsQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Sahifa raqami' })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 100, description: 'Bir sahifadagi elementlar soni' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 100;

  @ApiPropertyOptional({ enum: RecordStatus, example: 'ACTIVE' })
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @ApiPropertyOptional({ example: 'Terapiya', description: 'Nom bo\'yicha qidiruv' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Saralash maydoni (name, created_at, status)',
  })
  @IsOptional()
  @IsString()
  @IsEnum(['name', 'created_at', 'status', 'id'], {
    message: 'sortBy faqat: name, created_at, status, id qiymatlarini qabul qiladi',
  })
  sortBy?: string = 'name';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'sortOrder faqat: asc, desc qiymatlarini qabul qiladi',
  })
  sortOrder?: 'asc' | 'desc' = 'asc';
}
