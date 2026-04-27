import { Injectable, NotFoundException } from '@nestjs/common';
import { PayablesRepository } from './payables.repository';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';

@Injectable()
export class PayablesService {
  constructor(private readonly repo: PayablesRepository) {}

  findAll(status?: string) {
    return this.repo.findAll(status);
  }

  async findOne(id: number) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundException(`Título a pagar ${id} não encontrado`);
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
}
