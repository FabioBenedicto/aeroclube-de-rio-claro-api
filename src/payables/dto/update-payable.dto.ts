import { IsString, IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PayerType } from '../../receivables/enums/payer-type.enum';

export class UpdatePayableDto {
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
  plane_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  instructor_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  partner_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  employee_id?: number;

  @IsEnum(PayerType)
  @IsOptional()
  payer_type?: PayerType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  product?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;
}
