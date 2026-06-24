import { Transform, Type } from 'class-transformer';

import { Receivable } from '../../receivables/model/receivable.model';
import { Address } from './address.model';
import { Employee } from './employee.model';
import { Instructor } from './instructor.model';
import { Partner } from './partner.model';
import { Student } from './student.model';

export class People {
  id: number;
  cpf: string;
  name: string;
  email: string;
  phone_number: string | null;
  @Type(() => Number)
  @Transform(({ value }) => (value != null ? Number(value) : null))
  credit_balance: number | null;

  created_at: Date;
  updated_at: Date;

  @Type(() => Address)
  address?: Address | null;

  @Type(() => Instructor)
  instructors?: Instructor | null;

  @Type(() => Student)
  students?: Student | null;

  @Type(() => Partner)
  partners?: Partner | null;

  @Type(() => Employee)
  employees?: Employee | null;

  @Type(() => Receivable)
  receivables?: Receivable[];

  categories?: string[];
}
