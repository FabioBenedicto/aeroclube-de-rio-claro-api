import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindAllReceivablesDto extends PaginationDto {
  @IsString()
  @IsOptional()
  status?: string;

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

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  people_id?: number;
}
