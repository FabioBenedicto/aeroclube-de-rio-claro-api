import { Type } from 'class-transformer';
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

export class CreateBillDto {
  @IsInt()
  people_id: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];

  @IsDate()
  @Type(() => Date)
  expiration_date: Date;
}
