import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ETitleStatus } from '@common/enums/title-status.enum';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { CreatePayableDto } from './dto/create-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';
import { FindAllPayablesDto } from './dto/find-all-payables.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { PAYABLES_REPOSITORY, IPayablesRepository } from './repository/payables-repository.interface';

@Injectable()
export class PayablesService {
  constructor(
    @Inject(PAYABLES_REPOSITORY)
    private readonly payablesRepository: IPayablesRepository,
  ) {}

  findAll(query: FindAllPayablesDto) {
    return this.payablesRepository.findAll(query);
  }

  getStats(query: FindAllPayablesDto) {
    return this.payablesRepository.getStats(query);
  }

  async findOne(id: number) {
    const payable = await this.payablesRepository.findById(id);

    if (!payable)
      throw new NotFoundException(`Título a pagar ${id} não encontrada`);

    return payable;
  }

  create(dto: CreatePayableDto) {
    return this.payablesRepository.create(dto);
  }

  async update(id: number, dto: UpdatePayableDto) {
    await this.findOne(id);
    return this.payablesRepository.update(id, dto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.payablesRepository.delete(id);
  }

  async getPayment(paymentId: number) {
    const payment = await this.payablesRepository.findPaymentById(paymentId);

    if (!payment)
      throw new NotFoundException(`Pagamento ${paymentId} não encontrado`);

    return payment;
  }

  async createPayment(id: number, dto: CreatePayablePaymentDto) {
    const payable = await this.findOne(id);

    if (payable.status === ETitleStatus.PAID)
      throw new BadRequestException('Conta a pagar já liquidada');

    return this.payablesRepository.createPayment(id, dto);
  }

  async deletePayment(paymentId: number) {
    await this.getPayment(paymentId);
    await this.payablesRepository.deletePayment(paymentId);
  }

  async addPaymentInvoice(paymentId: number, fileData: CreateFileData) {
    await this.getPayment(paymentId);
    return this.payablesRepository.addPaymentInvoice(paymentId, fileData);
  }

  async deletePaymentInvoice(paymentId: number) {
    await this.getPayment(paymentId);
    return this.payablesRepository.deletePaymentInvoice(paymentId);
  }

  bulkDelete(ids: number[]) {
    return this.payablesRepository.bulkDelete(ids);
  }
}
