import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateFlightDto {
  @IsInt()
  @IsOptional()
  aircraft_id?: number;

  @IsInt()
  @IsOptional()
  people_id?: number;

  @IsInt()
  @IsOptional()
  instructor_id?: number | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  type?: string;

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
