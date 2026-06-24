import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, Min } from 'class-validator';

export class PartnerDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthly_dues: number;

  @IsDateString()
  @IsOptional()
  next_due_date?: string;
}
