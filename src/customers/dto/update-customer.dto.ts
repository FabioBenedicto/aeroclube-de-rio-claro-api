import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstructorDto } from './instructor.dto';
import { StudentDto } from './student.dto';
import { PartnerDto } from './partner.dto';
import { EmployeeDto } from './employee.dto';

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  flight_hour_balance?: number;

  @ValidateNested()
  @IsOptional()
  @Type(() => InstructorDto)
  instructor?: InstructorDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => StudentDto)
  student?: StudentDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => PartnerDto)
  partner?: PartnerDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => EmployeeDto)
  employee?: EmployeeDto;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'state deve ser a sigla do estado (2 letras maiúsculas)' })
  state?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'zip_code deve ter 8 dígitos sem hífen' })
  zip_code?: string;
}
