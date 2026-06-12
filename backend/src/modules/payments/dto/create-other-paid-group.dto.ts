import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOtherPaidGroupDto {
  @ApiProperty({ example: "Kommunal to'lovlar" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Elektr, gaz, suv' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateOtherPaidGroupDto {
  @ApiPropertyOptional({ example: "Kommunal to'lovlar" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
