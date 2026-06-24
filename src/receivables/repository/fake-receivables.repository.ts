import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateFileData } from 'src/file/interfaces/create-file-data';

import { CreateReceivablePaymentDto } from '../dto/create-payment.dto';
import { CreateReceivableDto } from '../dto/create-receivable.dto';
import { FindAllReceivablesDto } from '../dto/find-all-receivables.dto';
import { UpdateReceivableDto } from '../dto/update-receivable.dto';
import { Receivable } from '../model/receivable.model';
import { ReceivablePayment } from '../model/receivable-payment.model';
import { IReceivablesRepository } from './receivables-repository.interface';

@Injectable()
export class FakeReceivablesRepository implements IReceivablesRepository {
  receivables: Receivable[] = [];
  payments: ReceivablePayment[] = [];

  private nextId = 1;
  private nextPaymentId = 1;

  async findAll({ page = 1, limit = 20 }: FindAllReceivablesDto) {
    const data = this.receivables.map((r) => plainToInstance(Receivable, r));

    const total = data.length;

    return {
      data: data.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const r = this.receivables.find((r) => r.id === id);
    return r ? plainToInstance(Receivable, r) : null;
  }

  async create(dto: CreateReceivableDto) {
    const receivable = {
      ...dto,
      id: this.nextId++,
      amount_received: 0,
      status: 0,
      payments: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.receivables.push(receivable as any);

    return plainToInstance(Receivable, receivable);
  }

  async update(id: number, dto: UpdateReceivableDto) {
    const idx = this.receivables.findIndex((r) => r.id === id);

    if (idx === -1) return plainToInstance(Receivable, {});

    this.receivables[idx] = { ...this.receivables[idx], ...dto };

    return plainToInstance(Receivable, this.receivables[idx]);
  }

  async delete(id: number) {
    const idx = this.receivables.findIndex((r) => r.id === id);

    if (idx === -1) return;

    this.receivables.splice(idx, 1);
  }

  async findPaymentById(paymentId: number) {
    const payment = this.payments.find((p) => p.id === paymentId);
    return payment ? plainToInstance(ReceivablePayment, payment) : null;
  }

  async createPayment(receivableId: number, dto: CreateReceivablePaymentDto) {
    const receivable = this.receivables.find((r) => r.id === receivableId);

    if (!receivable) throw new Error('Register not found');

    const applied = Number(dto.amount_received);

    receivable.amount_received = Number(receivable.amount_received) + applied;

    const payment = {
      ...dto,
      id: this.nextPaymentId++,
      receivable_id: receivableId,
    };

    this.payments.push(payment as any);

    return plainToInstance(ReceivablePayment, payment);
  }

  async deletePayment(paymentId: number) {
    const idx = this.payments.findIndex((p) => p.id === paymentId);

    if (idx === -1) return;

    this.payments.splice(idx, 1);
  }

  async attachPaymentInvoice(paymentId: number, fileData: CreateFileData) {
    const payment = this.payments.find((p) => p.id === paymentId);

    if (!payment) throw new Error('Register not found');

    payment.file = { id: Date.now(), ...fileData, created_at: new Date() };
    payment.file_id = payment.file.id;

    return plainToInstance(ReceivablePayment, payment ?? {});
  }

  async removePaymentInvoice(paymentId: number) {
    const payment = this.payments.find((p) => p.id === paymentId);

    if (payment) {
      payment.file = null;
      payment.file_id = null;
    }
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.receivables.filter((r) => ids.includes(r.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Um ou mais recebíveis não foram encontrados');
    const hasPaid = found.some((r) => (r as any).status === 'PAID' || (r as any).status === 2);
    if (hasPaid)
      throw new UnprocessableEntityException('Não é possível excluir recebíveis já pagos');
    this.receivables = this.receivables.filter((r) => !ids.includes(r.id));
  }
}
