import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum AircraftType {
  AIRPLANE = 'airplane',
  GLIDER = 'glider',
}

export class CreatePlaneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  registration: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsEnum(AircraftType)
  aircraft_type: AircraftType;

  @ValidateIf(o => o.aircraft_type !== AircraftType.GLIDER)
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  flight_hour_value?: number;
}
