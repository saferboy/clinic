import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateSourceDto } from './create-source.dto';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class UpdateSourceDto extends PartialType(CreateSourceDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsUnique('sources', 'name', { message: 'Source name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSanitized({ message: 'Description contains dangerous content' })
  description?: string;
}
