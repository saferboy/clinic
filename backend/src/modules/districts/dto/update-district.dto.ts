import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CreateDistrictDto } from './create-district.dto';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class UpdateDistrictDto extends PartialType(CreateDistrictDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsUnique('loc_districts', 'name', { message: 'District name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name?: string;

  @ApiPropertyOptional({ example: 1, description: 'Region ID' })
  @IsOptional()
  @IsInt()
  @Min(1)
  region_id?: number;
}
