import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import { EAircraftType } from '../enums/aircraft-type.enum';

export class CreateAircraftDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  registration: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsEnum(EAircraftType)
  type: EAircraftType;

  @ValidateIf((o) => o.type === EAircraftType.AIRPLANE)
  @IsNumber()
  @Min(0.01)
  flight_hour_value?: number;
}
