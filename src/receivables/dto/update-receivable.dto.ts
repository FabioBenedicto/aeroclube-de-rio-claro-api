import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

import { Stakeholder } from '../../shared/enums/stakeholder.enum';

export class UpdateReceivableDto {
  @IsEnum(Stakeholder)
  @IsOptional()
  stakeholder?: Stakeholder;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  person_id?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  student_id?: number;

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
  plane_id?: number;

  @IsOptional()
  @ValidateIf((o) => o.flight_id !== null)
  @IsInt()
  @Min(1)
  @Type(() => Number)
  flight_id?: number | null;

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

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiration_date?: Date;

  @IsInt()
  @IsOptional()
  receivable_type_id?: number;
}
