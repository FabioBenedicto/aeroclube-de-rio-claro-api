import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

import { EPaymentMethod } from '../../common/enums/payment-method.enum';

export class CreatePayablePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(EPaymentMethod)
  @IsOptional()
  method?: EPaymentMethod;

  @IsDateString()
  @IsOptional()
  payment_date?: string;
}
