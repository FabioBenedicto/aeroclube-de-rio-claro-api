import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Recurrence } from '../enums/recurrence.enum';
import { PayerType } from '../enums/payer-type.enum';

export class CreateReceivableDto {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  client_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  company_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  bill_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  instructor_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  plane_id?: number;

  @IsEnum(PayerType)
  @IsOptional()
  payer_type?: PayerType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  total_amount: number;

  @IsDateString()
  expiration_date: string;

  @IsString()
  @IsOptional()
  product?: string;

  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @IsInt()
  @Min(2)
  @ValidateIf((o) => o.recurrence !== undefined)
  @Type(() => Number)
  occurrences?: number;
}
