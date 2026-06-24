import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';
import { EAircraftType } from '../enums/aircraft-type.enum';

export class FindAllAircraftDto extends PaginationDto {
  @IsEnum(EAircraftType)
  @IsOptional()
  aircraft_type?: EAircraftType;

  @IsString()
  @IsOptional()
  search?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_from?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_to?: Date;
}
