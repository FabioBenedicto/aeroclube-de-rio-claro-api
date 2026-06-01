import { IsInt, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBoletoBillDto {
  @IsInt()
  @Type(() => Number)
  customer_id: number;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  total_amount: number;

  @IsString()
  due_date: string;
}
