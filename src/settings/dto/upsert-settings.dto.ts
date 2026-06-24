import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpsertSettingsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  instructor_percentage?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  glider_initial_minutes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  glider_initial_value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  glider_minute_value?: number;
}
