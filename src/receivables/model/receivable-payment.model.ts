import { Type } from 'class-transformer';
import { FileModel } from 'src/file/model/file.model';

export class ReceivablePayment {
  id: number;

  @Type(() => Number)
  amount: number;

  method: string | null;
  payment_date: Date | null;

  receivable_id: number;
  bill_id: number | null;

  file_id: number | null;
  file: FileModel | null;
}
