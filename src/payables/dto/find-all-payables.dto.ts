import { ETitleStatus } from '@common/enums/title-status.enum';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindAllPayablesDto extends PaginationDto {
  @IsEnum(ETitleStatus)
  @IsOptional()
  status?: ETitleStatus;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  person_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  instructor_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  employee_id?: number;

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
