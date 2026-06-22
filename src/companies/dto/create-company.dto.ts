import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IsCnpj } from '@common/validators';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsCnpj()
  @IsNotEmpty()
  cnpj: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
