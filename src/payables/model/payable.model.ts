import { Type } from 'class-transformer';

import { Aircraft } from '../../aircraft/model/aircraft.model';
import { Company } from '../../companies/model/company.model';
import { Employee } from '../../peoples/model/employee.model';
import { Instructor } from '../../peoples/model/instructor.model';
import { Partner } from '../../peoples/model/partner.model';
import { People } from '../../peoples/model/people.model';
import { Student } from '../../peoples/model/student.model';
import { EStakeholder } from '@common/enums/stakeholder.enum';
import { ETitleStatus } from '@common/enums/title-status.enum';
import { PayablePayment } from './payable-payment.model';

export class Payable {
  id: number;
  stakeholder: EStakeholder;
  title: string;
  description: string | null;
  payable_type_id: number | null;
  payable_type?: { id: number; name: string } | null;
  @Type(() => Number)
  total_amount: number;
  @Type(() => Number)
  amount_paid: number;
  status: ETitleStatus;
  expiration_date: Date | null;
  created_at: Date;
  updated_at: Date;

  @Type(() => People)
  people: People | null;
  @Type(() => Student)
  student: Student | null;
  company: Company | null;
  @Type(() => Aircraft)
  aircraft: Aircraft | null;
  @Type(() => Instructor)
  instructor: Instructor | null;
  @Type(() => Partner)
  partner: Partner | null;
  @Type(() => Employee)
  employee: Employee | null;
  @Type(() => PayablePayment)
  payments: PayablePayment[];
}
