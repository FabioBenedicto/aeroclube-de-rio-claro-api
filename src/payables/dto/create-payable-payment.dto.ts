import { IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayablePaymentDto {
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  paid_at?: string;
}
