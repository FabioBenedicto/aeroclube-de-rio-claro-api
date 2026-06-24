import { Paginated } from '../../common/dto/pagination.dto';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { CreatePayableDto } from '../dto/create-payable.dto';
import { CreatePayablePaymentDto } from '../dto/create-payable-payment.dto';
import { FindAllPayablesDto } from '../dto/find-all-payables.dto';
import { UpdatePayableDto } from '../dto/update-payable.dto';
import { Payable } from '../model/payable.model';
import { PayablePayment } from '../model/payable-payment.model';

export const PAYABLES_REPOSITORY = Symbol('IPayablesRepository');

export type PaginatedPayables = Paginated<Payable>;

export interface PayableStats {
  total_amount: number;
  amount_paid: number;
}

export interface IPayablesRepository {
  findAll(dto: FindAllPayablesDto): Promise<PaginatedPayables>;
  getStats(dto: FindAllPayablesDto): Promise<PayableStats>;
  findById(id: number): Promise<Payable | null>;
  create(dto: CreatePayableDto): Promise<Payable | Payable[]>;
  update(id: number, dto: UpdatePayableDto): Promise<Payable>;
  delete(id: number): Promise<Payable | null>;

  findPaymentById(paymentId: number): Promise<PayablePayment | null>;
  createPayment(id: number, dto: CreatePayablePaymentDto): Promise<Payable>;
  deletePayment(paymentId: number): Promise<PayablePayment | null>;

  addPaymentInvoice(
    paymentId: number,
    fileData: CreateFileData,
  ): Promise<PayablePayment>;
  deletePaymentInvoice(paymentId: number): Promise<PayablePayment>;
  bulkDelete(ids: number[]): Promise<void>;
}
