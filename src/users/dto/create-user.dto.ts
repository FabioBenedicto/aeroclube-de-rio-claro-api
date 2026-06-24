import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { ERoles } from '../enums/roles.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(ERoles)
  role: ERoles;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
