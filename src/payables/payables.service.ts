import { Injectable, NotFoundException } from '@nestjs/common';
import { PayablesRepository, RegisterPayablePaymentInput } from './payables.repository';

export class CreatePayablePaymentDto implements RegisterPayablePaymentInput {
  installment_id: number;
  amount_paid: number;
  payment_date?: string;
}

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

  registerPayment(payableId: number, dto: CreatePayablePaymentDto) {
    return this.repo.registerPayment(payableId, dto);
  }
}
