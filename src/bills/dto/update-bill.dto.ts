import { IsDateString, IsOptional } from 'class-validator';

export class UpdateBillDto {
  @IsDateString()
  @IsOptional()
  due_date?: string;
}
