import {
  IsInt,
  IsArray,
  ArrayMinSize,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentItemDto {
  @IsInt()
  @Type(() => Number)
  receivable_id: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}

export class CreateBillDto {
  @IsInt()
  @Type(() => Number)
  customer_id: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items: PaymentItemDto[];

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;
}
