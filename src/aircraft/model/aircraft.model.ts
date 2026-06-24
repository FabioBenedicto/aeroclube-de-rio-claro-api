import { Type } from 'class-transformer';

import { Flight } from '../../flights/model/flight.model';
import { Payable } from '../../payables/model/payable.model';
import { Receivable } from '../../receivables/model/receivable.model';
import { EAircraftType } from '../enums/aircraft-type.enum';

export class Aircraft {
  id: number;
  registration: string;
  model: string;
  type: EAircraftType;

  @Type(() => Number)
  flight_hour_value: number | null;

  created_at: Date;
  updated_at: Date;

  @Type(() => Flight)
  flights?: Flight[];

  @Type(() => Payable)
  payables?: Payable[];

  @Type(() => Receivable)
  receivables?: Receivable[];
}
