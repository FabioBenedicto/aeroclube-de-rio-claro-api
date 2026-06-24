import { Type } from 'class-transformer';

import { Bill } from 'src/bills/model/bill.model';
import { FileModel } from 'src/file/model/file.model';

export class CnabRemittent {
  id: number;
  sequence_number: number;
  bill_count: number;
  @Type(() => Number)
  total_amount: number;
  created_at: Date;

  file_id: number;
  file: FileModel;

  bill_ids: number[];
  bills?: Bill[];
}
