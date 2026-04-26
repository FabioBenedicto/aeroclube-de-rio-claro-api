import { IsString, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePlaneDto {
  @ApiProperty({ example: 'PR-AEC' })
  @IsString()
  @IsNotEmpty()
  registration: string;

  @ApiPropertyOptional({ example: 'Cessna 152' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: 680.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  flight_hour_value: number;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'maintenance', 'inactive'] })
  @IsString()
  @IsOptional()
  status?: string;
}
