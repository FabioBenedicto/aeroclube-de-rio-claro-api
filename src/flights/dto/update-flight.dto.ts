import {
  IsInt,
  IsString,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { AircraftType } from '../enums/aircraft-type.enum';

export class UpdateFlightDto {
  @IsInt()
  @IsOptional()
  plane_id?: number;

  @IsInt()
  @IsOptional()
  customer_id?: number;

  @IsInt()
  @IsOptional()
  instructor_id?: number | null;

  @IsEnum(AircraftType)
  @IsOptional()
  aircraft_type?: AircraftType;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  double_command?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  origin?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  destination?: string;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;
}
