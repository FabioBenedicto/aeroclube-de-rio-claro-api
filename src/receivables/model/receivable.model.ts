import { Aircraft } from '../../aircraft/model/aircraft.model';
import { Company } from '../../companies/model/company.model';
import { Flight } from '../../flights/model/flight.model';
import { Employee } from '../../peoples/model/employee.model';
import { Instructor } from '../../peoples/model/instructor.model';
import { Partner } from '../../peoples/model/partner.model';
import { People } from '../../peoples/model/people.model';
import { Student } from '../../peoples/model/student.model';
import { Stakeholder } from '../../shared/enums/stakeholder.enum';
import { TitleStatus } from '../../shared/enums/title-status.enum';
import { ReceivablePayment } from './receivable-payment.model';

export class Receivable {
  id: number;
  stakeholder: Stakeholder;
  title: string;
  description: string | null;
  receivable_type_id: number;
  receivable_type?: { id: number; name: string } | null;
  total_amount: number;
  amount_received: number;
  status: TitleStatus;
  expiration_date: Date;
  created_at: Date;
  updated_at: Date;

  people_id: number | null;
  people?: People | null;

  student_id: number | null;
  student?: Student | null;

  partner_id: number | null;
  partner?: Partner | null;

  instructor_id: number | null;
  instructor?: Instructor | null;

  employee_id: number | null;
  employee?: Employee | null;

  company_id: number | null;
  company?: Company | null;

  aircraft_id: number | null;
  aircraft?: Aircraft | null;

  flight_id: number | null;
  flight: Flight | null;

  payments?: ReceivablePayment[];
}
