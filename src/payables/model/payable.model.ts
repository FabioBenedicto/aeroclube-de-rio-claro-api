import { Aircraft } from '../../aircraft/model/aircraft.model';
import { Company } from '../../companies/model/company.model';
import { Employee } from '../../peoples/model/employee.model';
import { Instructor } from '../../peoples/model/instructor.model';
import { Partner } from '../../peoples/model/partner.model';
import { People } from '../../peoples/model/people.model';
import { Student } from '../../peoples/model/student.model';
import { Stakeholder } from '../../shared/enums/stakeholder.enum';
import { TitleStatus } from '../../shared/enums/title-status.enum';
import { PayablePayment } from './payable-payment.model';

export class Payable {
  id: number;
  stakeholder: Stakeholder;
  title: string;
  description: string | null;
  payable_type_id: number | null;
  payable_type?: { id: number; name: string } | null;
  total_amount: number;
  amount_paid: number;
  status: TitleStatus;
  expiration_date: Date | null;
  created_at: Date;
  updated_at: Date;

  people: People | null;
  student: Student | null;
  company: Company | null;
  aircraft: Aircraft | null;
  instructor: Instructor | null;
  partner: Partner | null;
  employee: Employee | null;
  payments: PayablePayment[];
}
