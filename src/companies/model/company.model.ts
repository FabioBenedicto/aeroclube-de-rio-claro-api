import { Type } from 'class-transformer';

import { Payable } from '../../payables/model/payable.model';
import { Receivable } from '../../receivables/model/receivable.model';

export class Company {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;

  @Type(() => Receivable)
  receivables?: Receivable[];

  @Type(() => Payable)
  payables?: Payable[];
}
