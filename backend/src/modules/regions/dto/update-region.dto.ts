import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateRegionDto } from './create-region.dto';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsUnique('loc_regions', 'name', { message: 'Region name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name?: string;
}
