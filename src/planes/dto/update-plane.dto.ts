import { IsString, IsNumber, IsOptional, IsEnum, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { AircraftType } from './create-plane.dto';

export class UpdatePlaneDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  registration?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsEnum(AircraftType)
  @IsOptional()
  aircraft_type?: AircraftType;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  @Type(() => Number)
  flight_hour_value?: number;
}
