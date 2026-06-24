import { ETitleStatus } from '@common/enums/title-status.enum';
import { UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreatePayableDto } from '../dto/create-payable.dto';
import { CreatePayablePaymentDto } from '../dto/create-payable-payment.dto';
import { FindAllPayablesDto } from '../dto/find-all-payables.dto';
import { UpdatePayableDto } from '../dto/update-payable.dto';
import { Payable } from '../model/payable.model';
import { PayablePayment } from '../model/payable-payment.model';
import { IPayablesRepository, PayableStats } from './payables-repository.interface';

export class FakePayablesRepository implements IPayablesRepository {
  payables: any[] = [];
  payments: any[] = [];
  private nextId = 1;
  private nextPaymentId = 1;

  async findAll({ page = 1, limit = 20 }: FindAllPayablesDto) {
    const data = this.payables.map((p) => plainToInstance(Payable, p));
    const total = data.length;
    return {
      data: data.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(dto: FindAllPayablesDto): Promise<PayableStats> {
    const { data } = await this.findAll(dto);
    const total_amount = data.reduce((s, p) => s + Number(p.total_amount ?? 0), 0);
    const amount_paid = data.reduce((s, p) => s + Number(p.amount_paid ?? 0), 0);
    return { total_amount, amount_paid };
  }

  async findById(id: number) {
    const p = this.payables.find((p) => p.id === id);
    return p ? plainToInstance(Payable, p) : null;
  }

  async create(dto: CreatePayableDto) {
    const payable = {
      ...dto,
      id: this.nextId++,
      amount_paid: 0,
      status: ETitleStatus.PENDING,
      payments: [],
    };
    this.payables.push(payable);
    return plainToInstance(Payable, payable);
  }

  async update(id: number, dto: UpdatePayableDto) {
    const idx = this.payables.findIndex((p) => p.id === id);
    this.payables[idx] = { ...this.payables[idx], ...dto };
    return plainToInstance(Payable, this.payables[idx]);
  }

  async delete(id: number) {
    const idx = this.payables.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const [removed] = this.payables.splice(idx, 1);
    return plainToInstance(Payable, removed);
  }

  async createPayment(id: number, dto: CreatePayablePaymentDto) {
    const payable = this.payables.find((p) => p.id === id);
    const newPaid = Number(payable.amount_paid) + Number(dto.amount);
    payable.amount_paid = newPaid;
    payable.status =
      newPaid >= Number(payable.amount)
        ? ETitleStatus.PAID
        : ETitleStatus.PARTIAL;
    const payment = { ...dto, id: this.nextPaymentId++, payable_id: id };
    this.payments.push(payment);
    return plainToInstance(Payable, payable);
  }

  async deletePayment(paymentId: number) {
    const idx = this.payments.findIndex((p) => p.id === paymentId);
    if (idx === -1) return null;
    const [removed] = this.payments.splice(idx, 1);
    return plainToInstance(PayablePayment, removed);
  }

  async findPaymentById(paymentId: number) {
    const p = this.payments.find((p) => p.id === paymentId);
    return p ? plainToInstance(PayablePayment, p) : null;
  }

  async addPaymentInvoice(
    paymentId: number,
    fileData: import('src/file/interfaces/create-file-data').CreateFileData,
  ) {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (payment) {
      payment.file = { id: Date.now(), ...fileData, created_at: new Date() };
      payment.file_id = payment.file.id;
    }
    return plainToInstance(PayablePayment, payment);
  }

  async deletePaymentInvoice(paymentId: number) {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (payment) {
      payment.file = null;
      payment.file_id = null;
    }
    return plainToInstance(PayablePayment, payment);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.payables.filter((p) => ids.includes(p.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Um ou mais pagáveis não foram encontrados');
    this.payables = this.payables.filter((p) => !ids.includes(p.id));
  }
}
