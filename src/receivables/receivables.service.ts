import { Injectable, NotFoundException } from '@nestjs/common';
import { ReceivablesRepository } from './receivables.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class ReceivablesService {
  constructor(private readonly receivablesRepository: ReceivablesRepository) {}

  registerPayment(receivableId: number, dto: CreatePaymentDto) {
    return this.receivablesRepository.registerPayment(receivableId, dto);
  }

  findAll(status?: string) {
    return this.receivablesRepository.findAll(status);
  }

  async findOne(id: number) {
    const r = await this.receivablesRepository.findById(id);
    if (!r) throw new NotFoundException(`Título ${id} não encontrado`);
    return r;
  }
}
