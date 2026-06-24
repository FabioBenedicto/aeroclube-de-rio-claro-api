import { Transform, Type } from 'class-transformer';

import { People } from './people.model';

export class Partner {
  id: number;
  people_id: number;
  @Type(() => Number)
  @Transform(({ value }) => (value != null ? Number(value) : 0))
  monthly_dues: number;
  next_due_date: Date | null;
  last_payment_date: Date | null;
  status: string;
  created_at: Date;
  updated_at: Date;

  @Type(() => People)
  people?: People | null;
}
