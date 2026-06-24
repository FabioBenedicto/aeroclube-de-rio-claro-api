import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class BillItemDto {
  @IsInt()
  receivable_id: number;

  @IsNumber()
  @Min(0.01)
  amount: number;
}

export class UpdateBillDto {
  @IsInt()
  people_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  @IsOptional()
  items?: BillItemDto[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiration_date?: Date;
}
