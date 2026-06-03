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

export class CreateFlightDto {
  @IsInt()
  plane_id: number;

  @IsInt()
  customer_id: number;

  @IsInt()
  @IsOptional()
  instructor_id?: number;

  @IsEnum(AircraftType)
  aircraft_type: AircraftType;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsBoolean()
  double_command: boolean;

  @IsString()
  @IsNotEmpty()
  origin: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  receivable_title?: string;

  @IsDateString()
  @IsOptional()
  receivable_expiration_date?: string;

  @IsString()
  @IsOptional()
  receivable_product?: string;

  @IsString()
  @IsOptional()
  payable_title?: string;

  @IsDateString()
  @IsOptional()
  payable_due_date?: string;
}
