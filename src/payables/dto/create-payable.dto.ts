import { ERecurrence } from '@common/enums/recurrence.enum';
import { EStakeholder } from '@common/enums/stakeholder.enum';
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

export class CreatePayableDto {
  @IsEnum(EStakeholder)
  stakeholder: EStakeholder;

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
  payable_type_id?: number;

  @IsEnum(ERecurrence)
  @IsOptional()
  recurrence?: ERecurrence;

  @IsInt()
  @Min(2)
  @ValidateIf((o) => o.recurrence !== undefined)
  occurrences: number;
}
