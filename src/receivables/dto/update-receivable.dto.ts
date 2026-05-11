import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayerType } from '../enums/payer-type.enum';

export class UpdateReceivableDto {
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
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  @Type(() => Number)
  total_amount?: number;

  @IsDateString()
  @IsOptional()
  expiration_date?: string;

  @IsString()
  @IsOptional()
  product?: string;
}
