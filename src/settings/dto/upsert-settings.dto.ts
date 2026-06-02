import { IsNumber, IsInt, IsOptional, IsString, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertSettingsDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  instructor_percentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  partner_monthly_dues?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  glider_initial_minutes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  glider_initial_value?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  glider_minute_value?: number;

  @IsString()
  @IsOptional()
  @Matches(/^\d{5}$/, { message: 'sicoob_cooperativa_prefix deve ter 5 dígitos' })
  sicoob_cooperativa_prefix?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1}$/, { message: 'sicoob_cooperativa_dv deve ter 1 dígito' })
  sicoob_cooperativa_dv?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1,12}$/, { message: 'sicoob_conta deve ter até 12 dígitos' })
  sicoob_conta?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1}$/, { message: 'sicoob_conta_dv deve ter 1 dígito' })
  sicoob_conta_dv?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{1}$/, { message: 'sicoob_carteira deve ter 1 dígito' })
  sicoob_carteira?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}$/, { message: 'sicoob_modalidade deve ter 2 dígitos' })
  sicoob_modalidade?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{14}$/, { message: 'sicoob_cnpj deve ter 14 dígitos sem formatação' })
  sicoob_cnpj?: string;

  @IsString()
  @IsOptional()
  sicoob_nome_empresa?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  sicoob_juros?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  sicoob_juros_prazo?: number;
}
