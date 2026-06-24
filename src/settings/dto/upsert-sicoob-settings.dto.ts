import { IsCNPJ } from '@common/decorators/is-cnpj.decorator';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class UpsertSicoobSettingsDto {
  @IsString()
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'cooperative_prefix must have 5 digits' })
  cooperative_prefix?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1}$/, { message: 'cooperative_digit must have 1 digit' })
  cooperative_digit?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1,4}$/, { message: 'branch must have up to 4 digits' })
  branch?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1,12}$/, { message: 'account must have up to 12 digits' })
  account?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1}$/, { message: 'account_digit must have 1 digit' })
  account_digit?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1}$/, { message: 'wallet must have 1 digit' })
  wallet?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}$/, { message: 'modality must have 2 digits' })
  modality?: string;

  @IsCNPJ()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  company_name?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  interest_rate?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  interest_period?: number;

  @IsString()
  @IsOptional()
  @Matches(/^[012]$/, { message: 'interest_type must be 0, 1 or 2' })
  interest_type?: string;
}
