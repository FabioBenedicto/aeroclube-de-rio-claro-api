import { IsEmail, IsOptional, IsString } from 'class-validator';

import { IsCnpj } from '@common/validators';

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsCnpj()
  @IsOptional()
  cnpj?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
