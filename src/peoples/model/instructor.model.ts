import { Type } from 'class-transformer';

import { Receivable } from '../../receivables/model/receivable.model';
import { People } from './people.model';

export class Instructor {
  id: number;
  people_id: number;
  created_at: Date;

  @Type(() => People)
  people?: People | null;

  @Type(() => Receivable)
  receivables?: Receivable[];
}
