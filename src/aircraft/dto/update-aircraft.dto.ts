import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import { EAircraftType } from '../enums/aircraft-type.enum';

export class UpdateAircraftDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  registration?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsEnum(EAircraftType)
  @IsOptional()
  type: EAircraftType;

  @ValidateIf((o) => o.type === EAircraftType.AIRPLANE)
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  flight_hour_value?: number;
}
