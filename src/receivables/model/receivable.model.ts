import { EStakeholder } from '@common/enums/stakeholder.enum';
import { ETitleStatus } from '@common/enums/title-status.enum';
import { Type } from 'class-transformer';

import { Aircraft } from '../../aircraft/model/aircraft.model';
import { Company } from '../../companies/model/company.model';
import { Flight } from '../../flights/model/flight.model';
import { Employee } from '../../peoples/model/employee.model';
import { Instructor } from '../../peoples/model/instructor.model';
import { Partner } from '../../peoples/model/partner.model';
import { People } from '../../peoples/model/people.model';
import { Student } from '../../peoples/model/student.model';
import { ReceivablePayment } from './receivable-payment.model';

export class Receivable {
  id: number;
  stakeholder: EStakeholder;
  title: string;
  description: string | null;

  receivable_type_id: number | null;
  receivable_type?: { id: number; name: string } | null;

  adds_credit: boolean;

  @Type(() => Number)
  total_amount: number;

  @Type(() => Number)
  amount_received: number;

  status: ETitleStatus;
  expiration_date: Date;
  created_at: Date;
  updated_at: Date;

  people_id: number | null;
  @Type(() => People)
  people?: People | null;

  student_id: number | null;
  @Type(() => Student)
  student?: Student | null;

  partner_id: number | null;
  @Type(() => Partner)
  partner?: Partner | null;

  instructor_id: number | null;
  @Type(() => Instructor)
  instructor?: Instructor | null;

  employee_id: number | null;
  @Type(() => Employee)
  employee?: Employee | null;

  company_id: number | null;
  company?: Company | null;

  aircraft_id: number | null;
  @Type(() => Aircraft)
  aircraft?: Aircraft | null;

  flight_id: number | null;
  @Type(() => Flight)
  flight: Flight | null;

  @Type(() => ReceivablePayment)
  payments?: ReceivablePayment[];
}
