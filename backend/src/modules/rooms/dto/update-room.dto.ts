import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

export class UpdateRoomStatusDto {
  @ApiProperty({ 
    description: 'Xona statusi', 
    enum: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED'],
    example: 'OCCUPIED'
  })
  @IsEnum({
    AVAILABLE: 'AVAILABLE',
    OCCUPIED: 'OCCUPIED',
    MAINTENANCE: 'MAINTENANCE',
    CLOSED: 'CLOSED',
  })
  @IsNotEmpty()
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';

  @ApiPropertyOptional({ 
    description: 'Status o\'zgarish sababi', 
    example: 'Visit boshlandi' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
