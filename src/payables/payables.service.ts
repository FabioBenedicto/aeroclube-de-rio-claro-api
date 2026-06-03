import { Injectable, NotFoundException } from '@nestjs/common';
import { PayablesRepository } from './payables.repository';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';

@Injectable()
export class PayablesService {
  constructor(private readonly repo: PayablesRepository) {}

  async findAll(status?: string, clientId?: number, search?: string, dateFrom?: string, dateTo?: string, page = 1, limit = 20, instructorId?: number, employeeId?: number) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    const { data, total } = await this.repo.findAll(status, clientId, search, from, to, page, limit, instructorId, employeeId);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundException(`Payable ${id} not found`);
    return p;
  }

  create(dto: CreatePayableDto) {
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdatePayableDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  registerPayment(id: number, dto: CreatePayablePaymentDto) {
    return this.repo.registerPayment(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
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
