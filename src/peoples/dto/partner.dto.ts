import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PartnerDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthly_dues: number;

  @IsDateString()
  @IsOptional()
  next_due_date?: string;
}
