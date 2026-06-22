import { Type } from 'class-transformer';
import {
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

import { Recurrence } from '../../shared/enums/recurrence.enum';
import { Stakeholder } from '../../shared/enums/stakeholder.enum';

export class CreateReceivableDto {
  @IsEnum(Stakeholder)
  @IsOptional()
  stakeholder?: Stakeholder;

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
  receivable_type_id: number;

  @IsEnum(Recurrence)
  @IsOptional()
  recurrence?: Recurrence;

  @IsInt()
  @Min(2)
  @ValidateIf((o) => o.recurrence)
  occurrences: number;
}
