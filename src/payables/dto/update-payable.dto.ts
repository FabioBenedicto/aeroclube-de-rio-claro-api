import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { Stakeholder } from '../../shared/enums/stakeholder.enum';

export class UpdatePayableDto {
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

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  payable_type_id?: number;

  @IsDateString()
  @IsOptional()
  expiration_date?: string;
}
