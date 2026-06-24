import { UnprocessableEntityException } from '@nestjs/common';
import { Bill } from '../model/bill.model';
import { CreateBillDto } from '../dto/create-bill.dto';
import { FindAllBillsDto } from '../dto/find-all-bills.dto';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { PayBillDto } from '../dto/pay-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';
import { EBillStatus } from '../enums/bill-status.enum';
import { IBillsRepository } from './bills-repository.interface';

export class FakeBillsRepository implements IBillsRepository {
  bills: any[] = [];
  private nextId = 1;

  async findAll({ page = 1, limit = 20 }: FindAllBillsDto) {
    const total = this.bills.length;
    return { data: this.bills.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number) {
    return (this.bills.find((b) => b.id === id) ?? null) as Bill | null;
  }

  async create(dto: CreateBillDto) {
    const bill = {
      ...dto,
      id: this.nextId++,
      status: 'open',
      payment_date: null,
      payment_method: null,
      total_amount: 0,
      expiration_date: dto.expiration_date ? new Date(dto.expiration_date) : new Date(),
      created_at: new Date(),
      file_id: null,
      file: null,
      people: null,
      receivable_payments: [],
    };
    this.bills.push(bill);
    return bill as unknown as Bill;
  }

  async update(id: number, data: Pick<UpdateBillDto, 'expiration_date'>) {
    const idx = this.bills.findIndex((b) => b.id === id);
    if (idx === -1) return null as unknown as Bill;
    this.bills[idx] = { ...this.bills[idx], ...data };
    return this.bills[idx] as Bill;
  }

  async pay(id: number, data: PayBillDto & { status: EBillStatus; use_credit?: boolean }) {
    const idx = this.bills.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Bill ${id} not found`);
    this.bills[idx] = { ...this.bills[idx], ...data };
    return this.bills[idx] as Bill;
  }

  async delete(id: number): Promise<void> {
    const idx = this.bills.findIndex((b) => b.id === id);
    if (idx !== -1) this.bills.splice(idx, 1);
  }

  async attachInvoice(id: number, fileData: CreateFileData): Promise<Bill | null> {
    const bill = this.bills.find((b) => b.id === id);
    if (bill) {
      bill.file = { id: 1, ...fileData, created_at: new Date() };
      bill.file_id = bill.file.id;
    }
    return (bill ?? null) as Bill | null;
  }

  async deleteInvoice(_id: number): Promise<void> {}

  async findByIds(ids: number[]) {
    return this.bills.filter((b) => ids.includes(b.id)) as Bill[];
  }

  async markPendingCnab(ids: number[]): Promise<void> {
    this.bills.filter((b) => ids.includes(b.id)).forEach((b) => {
      b.status = 'pending_cnab';
    });
  }

  async revertFromPendingCnab(ids: number[]): Promise<void> {
    this.bills
      .filter((b) => ids.includes(b.id) && b.status === 'pending_cnab')
      .forEach((b) => {
        b.status = 'open';
      });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.bills.filter((b) => ids.includes(b.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Uma ou mais faturas não foram encontradas');
    this.bills = this.bills.filter((b) => !ids.includes(b.id));
  }
}
