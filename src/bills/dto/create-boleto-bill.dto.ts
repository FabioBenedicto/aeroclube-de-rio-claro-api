import { IsInt, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBoletoBillDto {
  @IsInt()
  @Type(() => Number)
  customer_id: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  total_amount: number;

  @IsDateString()
  due_date: string;
}
