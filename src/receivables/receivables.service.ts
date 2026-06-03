import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReceivablesRepository } from './receivables.repository';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class ReceivablesService {
  constructor(private readonly repo: ReceivablesRepository) {}

  async findAll(status?: string, search?: string, dateFrom?: string, dateTo?: string, page = 1, limit = 20) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    const { data, total } = await this.repo.findAll(status, search, from, to, page, limit);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Receivable ${id} not found`);
    return r;
  }

  create(dto: CreateReceivableDto) {
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateReceivableDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async delete(id: number) {
    const r = await this.findOne(id);
    if (r.status === 1) throw new BadRequestException('Cannot delete a receivable that is already settled');
    return this.repo.delete(id);
  }

  registerPayment(receivableId: number, dto: CreatePaymentDto) {
    return this.repo.registerPayment(receivableId, dto);
  }

  async deletePayment(paymentId: number) {
    const payment = await this.repo.deletePayment(paymentId);
    if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);
    return payment;
  }

  async getPayment(paymentId: number) {
    const p = await this.repo.findPaymentById(paymentId);
    if (!p) throw new NotFoundException(`Payment ${paymentId} not found`);
    return p;
  }

  setPaymentNotaFiscal(paymentId: number, path: string | null) {
    return this.repo.setPaymentNotaFiscal(paymentId, path);
  }
}
