import {
  IsString, IsEmail, IsNumber, IsOptional, IsNotEmpty, Min, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstructorDto } from './instructor.dto';
import { StudentDto } from './student.dto';
import { PartnerDto } from './partner.dto';
import { EmployeeDto } from './employee.dto';

export class CreatePersonDto {
  @IsString() @IsNotEmpty() cpf: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @IsString() @IsOptional() phone_number?: string;
  @IsNumber() @Min(0) @IsOptional() @Type(() => Number) flight_hour_balance?: number;
  @ValidateNested() @IsOptional() @Type(() => InstructorDto) instructor?: InstructorDto;
  @ValidateNested() @IsOptional() @Type(() => StudentDto)    student?:    StudentDto;
  @ValidateNested() @IsOptional() @Type(() => PartnerDto)    partner?:    PartnerDto;
  @ValidateNested() @IsOptional() @Type(() => EmployeeDto)   employee?:   EmployeeDto;
}
