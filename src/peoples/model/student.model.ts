import { Type } from 'class-transformer';

import { People } from './people.model';

export class Student {
  id: number;
  people_id: number;
  created_at: Date;

  @Type(() => People)
  people?: People | null;
}
