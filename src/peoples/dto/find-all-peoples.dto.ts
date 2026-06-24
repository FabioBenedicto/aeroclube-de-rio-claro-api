import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindAllPeoplesDto extends PaginationDto {
  @IsString() @IsOptional() search?: string;
  @IsString() @IsOptional() category?: string;
  @IsDate() @IsOptional() @Type(() => Date) date_from?: Date;
  @IsDate() @IsOptional() @Type(() => Date) date_to?: Date;
}
