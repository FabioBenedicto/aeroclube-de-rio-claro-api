import { ERecurrence } from '@common/enums/recurrence.enum';
import { EStakeholder } from '@common/enums/stakeholder.enum';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateReceivableDto {
  @IsEnum(EStakeholder)
  @IsOptional()
  stakeholder?: EStakeholder;

  @IsInt()
  @IsOptional()
  person_id?: number;

  @IsInt()
  @IsOptional()
  student_id?: number;

  @IsInt()
  @IsOptional()
  company_id?: number;

  @IsInt()
  @IsOptional()
  instructor_id?: number;

  @IsInt()
  @IsOptional()
  partner_id?: number;

  @IsInt()
  @IsOptional()
  employee_id?: number;

  @IsInt()
  @IsOptional()
  plane_id?: number;

  @IsInt()
  @IsOptional()
  flight_id?: number;

  @IsInt()
  @IsOptional()
  bill_id?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0.01)
  total_amount: number;

  @IsDate()
  @Type(() => Date)
  expiration_date: Date;

  @IsInt()
  @IsOptional()
  receivable_type_id?: number;

  @IsBoolean()
  @IsOptional()
  adds_credit?: boolean;

  @IsEnum(ERecurrence)
  @IsOptional()
  recurrence?: ERecurrence;

  @IsInt()
  @Min(2)
  @ValidateIf((o) => o.recurrence)
  occurrences: number;
}
