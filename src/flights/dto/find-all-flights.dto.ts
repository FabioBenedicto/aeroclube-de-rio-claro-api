import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindAllFlightsDto extends PaginationDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  aircraft_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  people_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  instructor_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  student_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  partner_id?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_from?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_to?: Date;

  @IsString()
  @IsOptional()
  search?: string;
}
