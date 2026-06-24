import { Type } from 'class-transformer';

import { EPaymentMethod } from '../../common/enums/payment-method.enum';
import { FileModel } from 'src/file/model/file.model';

export class PayablePayment {
  id: number;
  payable_id: number;
  @Type(() => Number)
  amount: number;
  method: EPaymentMethod | null;
  payment_date: Date;
  file_id: number | null;
  file: FileModel | null;
}
