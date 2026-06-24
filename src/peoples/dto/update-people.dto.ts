import { IsCPF } from '@common/decorators/is-cpf.decorator';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

import { EmployeeDto } from './employee.dto';
import { InstructorDto } from './instructor.dto';
import { PartnerDto } from './partner.dto';
import { StudentDto } from './student.dto';

export class UpdatePeopleDto {
  @IsCPF() @IsOptional() cpf?: string;
  @IsString() @IsOptional() name?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() phone_number?: string;
  @ValidateNested()
  @IsOptional()
  @Type(() => InstructorDto)
  instructor?: InstructorDto;
  @ValidateNested() @IsOptional() @Type(() => StudentDto) student?: StudentDto;
  @ValidateNested() @IsOptional() @Type(() => PartnerDto) partner?: PartnerDto;
  @ValidateNested()
  @IsOptional()
  @Type(() => EmployeeDto)
  employee?: EmployeeDto;
  @IsString() @IsOptional() street?: string;
  @IsString() @IsOptional() neighborhood?: string;
  @IsString() @IsOptional() city?: string;
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, {
    message: 'state must be a 2-letter uppercase abbreviation',
  })
  state?: string;
  @IsString()
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'zip_code must be 8 digits without hyphen' })
  zip_code?: string;
}
