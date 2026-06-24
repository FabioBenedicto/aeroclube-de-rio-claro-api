import { Type } from 'class-transformer';

export class SicoobSettings {
  id: number;
  cooperative_prefix: string | null;
  cooperative_digit: string | null;
  branch: string | null;
  account: string | null;
  account_digit: string | null;
  wallet: string | null;
  modality: string | null;
  cnpj: string | null;
  company_name: string | null;
  remittance_sequence: number;

  @Type(() => Number)
  interest_rate: number;

  interest_period: number;
  interest_type: string;
}
