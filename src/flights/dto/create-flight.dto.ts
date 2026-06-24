import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFlightDto {
  @IsInt()
  aircraft_id: number;

  @IsInt()
  people_id: number;

  @IsInt()
  @IsOptional()
  instructor_id?: number;

  @IsString()
  @IsNotEmpty()
  type: string;

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

  @IsString()
  @IsOptional()
  receivable_description?: string;

  @IsDateString()
  @IsOptional()
  receivable_expiration_date?: string;

  @IsInt()
  @Type(() => Number)
  receivable_type_id: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  payable_type_id?: number;

  @IsString()
  @IsOptional()
  payable_description?: string;

  @IsString()
  @IsOptional()
  payable_title?: string;

  @IsDateString()
  @IsOptional()
  payable_due_date?: string;
}
