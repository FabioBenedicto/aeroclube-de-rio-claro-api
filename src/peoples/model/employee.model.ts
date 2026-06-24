import { Type } from 'class-transformer';

import { People } from './people.model';

export class Employee {
  id: number;
  people_id: number;
  created_at: Date;

  @Type(() => People)
  people?: People | null;
}
