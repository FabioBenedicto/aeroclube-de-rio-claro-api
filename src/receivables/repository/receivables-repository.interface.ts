import { CreateFileData } from 'src/file/interfaces/create-file-data';

import { Paginated } from '../../common/dto/pagination.dto';
import { CreateReceivablePaymentDto } from '../dto/create-payment.dto';
import { CreateReceivableDto } from '../dto/create-receivable.dto';
import { FindAllReceivablesDto } from '../dto/find-all-receivables.dto';
import { UpdateReceivableDto } from '../dto/update-receivable.dto';
import { Receivable } from '../model/receivable.model';
import { ReceivablePayment } from '../model/receivable-payment.model';

export interface IReceivablesRepository {
  findAll(dto: FindAllReceivablesDto): Promise<Paginated<Receivable>>;
  findById(id: number): Promise<Receivable | null>;
  create(dto: CreateReceivableDto): Promise<Receivable | Receivable[]>;
  update(id: number, dto: UpdateReceivableDto): Promise<Receivable>;
  delete(id: number): Promise<void>;

  findPaymentById(paymentId: number): Promise<ReceivablePayment | null>;
  createPayment(
    receivableId: number,
    dto: CreateReceivablePaymentDto,
  ): Promise<any>;
  deletePayment(paymentId: number): Promise<void>;

  attachPaymentInvoice(
    paymentId: number,
    fileData: CreateFileData,
  ): Promise<ReceivablePayment>;
  removePaymentInvoice(paymentId: number): Promise<void>;
  bulkDelete(ids: number[]): Promise<void>;
}

export const RECEIVABLES_REPOSITORY = Symbol('IReceivablesRepository');
