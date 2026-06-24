import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateReceivablePaymentDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount_received: number;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsBoolean()
  @IsOptional()
  use_credit?: boolean;
}
