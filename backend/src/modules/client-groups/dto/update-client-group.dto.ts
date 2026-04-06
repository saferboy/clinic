import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateClientGroupDto } from './create-client-group.dto';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';
import { IsSanitized } from '../../../common/decorators/is-sanitized.decorator';

export class UpdateClientGroupDto extends PartialType(CreateClientGroupDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @IsUnique('client_groups', 'name', { message: 'Client group name already exists' })
  @IsSanitized({ message: 'Name contains dangerous content' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsSanitized({ message: 'Description contains dangerous content' })
  description?: string;
}
