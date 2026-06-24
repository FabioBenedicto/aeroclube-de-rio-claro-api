import { EPaymentMethod } from '@common/enums/payment-method.enum';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';

export class PayBillDto {
  @IsEnum(EPaymentMethod)
  payment_method: string;

  @IsDate()
  @Type(() => Date)
  payment_date: Date;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  use_credit?: boolean;
}
