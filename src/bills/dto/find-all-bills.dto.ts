import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';

import { PaginationDto } from '../../common/dto/pagination.dto';
import { EBillStatus } from '../enums/bill-status.enum';

export class FindAllBillsDto extends PaginationDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  people_id?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_from?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  date_to?: Date;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  pending?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  due_from?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  due_to?: Date;

  @IsEnum(EBillStatus)
  @IsOptional()
  status?: EBillStatus;
}
