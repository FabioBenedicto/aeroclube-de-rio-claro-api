import { Type } from 'class-transformer';

import { FileModel } from 'src/file/model/file.model';
import { People } from '../../peoples/model/people.model';
import { ReceivablePayment } from '../../receivables/model/receivable-payment.model';
import { EPaymentMethod } from '@common/enums/payment-method.enum';
import { EBillStatus } from '../enums/bill-status.enum';

export class Bill {
  id: number;
  @Type(() => Number)
  total_amount: number;
  status: EBillStatus;
  expiration_date: Date;
  payment_date: Date | null;
  payment_method: EPaymentMethod | null;
  created_at: Date;

  people_id: number;
  @Type(() => People)
  people: People;

  file_id: number | null;
  file: FileModel | null;

  @Type(() => ReceivablePayment)
  receivable_payments: ReceivablePayment[];
}
