import { Type } from 'class-transformer';

import { Aircraft } from '../../aircraft/model/aircraft.model';
import { Instructor } from '../../peoples/model/instructor.model';
import { People } from '../../peoples/model/people.model';

export class Flight {
  id: number;
  aircraft_id: number;
  people_id: number;
  instructor_id: number | null;
  type: string;
  origin: string;
  destination: string;
  start_date: Date;
  end_date: Date | null;

  @Type(() => Number)
  total_hours: number | null;

  @Type(() => Number)
  total_amount: number | null;

  calculation_breakdown: object | null;
  created_at: Date;

  @Type(() => Aircraft)
  aircraft?: Aircraft | null;

  @Type(() => People)
  people?: People | null;

  @Type(() => Instructor)
  instructor?: Instructor | null;

  receivables?: {
    id: number;
    total_amount: number;
    amount_received: number;
    receivable_type_id: number;
  }[];
}
