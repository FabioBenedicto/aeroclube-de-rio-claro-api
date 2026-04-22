import {
  IsInt,
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFlightDto {
  @ApiProperty()
  @IsInt()
  plane_id: number;

  @ApiProperty()
  @IsInt()
  customer_id: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  instructor_id?: number;

  @ApiProperty({ example: 'solo' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsBoolean()
  double_command: boolean;

  @ApiProperty({ example: 'SDRP' })
  @IsString()
  @IsNotEmpty()
  origin: string;

  @ApiProperty({ example: 'SDTC' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiProperty({ example: '2024-01-15T14:00:00Z' })
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ example: '2024-01-15T15:30:00Z' })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}
