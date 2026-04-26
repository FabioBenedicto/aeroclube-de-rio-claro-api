import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePlaneDto {
  @ApiPropertyOptional({ example: 'Cessna 172N' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 890.0 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  @Type(() => Number)
  flight_hour_value?: number;

  @ApiPropertyOptional({ example: 'maintenance', enum: ['active', 'maintenance', 'inactive'] })
  @IsString()
  @IsOptional()
  status?: string;
}
