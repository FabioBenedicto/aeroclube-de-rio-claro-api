import { Paginated } from '../../common/dto/pagination.dto';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { CreateBillDto } from '../dto/create-bill.dto';
import { FindAllBillsDto } from '../dto/find-all-bills.dto';
import { PayBillDto } from '../dto/pay-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';
import { EBillStatus } from '../enums/bill-status.enum';
import { Bill } from '../model/bill.model';

export const BILLS_REPOSITORY = Symbol('IBillsRepository');

export type PaginatedBills = Paginated<Bill>;

export interface IBillsRepository {
  findAll(dto: FindAllBillsDto): Promise<PaginatedBills>;
  findById(id: number): Promise<Bill | null>;
  findByIds(ids: number[]): Promise<Bill[]>;
  create(dto: CreateBillDto): Promise<Bill>;
  update(id: number, data: Pick<UpdateBillDto, 'expiration_date'>): Promise<Bill>;
  delete(id: number): Promise<void>;
  pay(id: number, data: PayBillDto & { status: EBillStatus; use_credit?: boolean }): Promise<Bill>;
  attachInvoice(id: number, fileData: CreateFileData): Promise<Bill | null>;
  deleteInvoice(id: number): Promise<void>;
  markPendingCnab(ids: number[]): Promise<void>;
  revertFromPendingCnab(ids: number[]): Promise<void>;
  bulkDelete(ids: number[]): Promise<void>;
}
