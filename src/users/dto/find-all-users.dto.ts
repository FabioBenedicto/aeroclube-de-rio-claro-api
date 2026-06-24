import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';
import { ERoles } from '../enums/roles.enum';

export class FindAllUsersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ERoles)
  role?: ERoles;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_to?: Date;
}
