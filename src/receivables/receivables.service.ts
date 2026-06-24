import { ETitleStatus } from '@common/enums/title-status.enum';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFileData } from 'src/file/interfaces/create-file-data';

import { CreateReceivablePaymentDto } from './dto/create-payment.dto';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { FindAllReceivablesDto } from './dto/find-all-receivables.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import {
  IReceivablesRepository,
  RECEIVABLES_REPOSITORY,
} from './repository/receivables-repository.interface';

@Injectable()
export class ReceivablesService {
  constructor(
    @Inject(RECEIVABLES_REPOSITORY)
    private readonly receivablesRepository: IReceivablesRepository,
  ) {}

  findAll(dto: FindAllReceivablesDto) {
    return this.receivablesRepository.findAll(dto);
  }

  async findOne(id: number) {
    const receivable = await this.receivablesRepository.findById(id);

    if (!receivable)
      throw new NotFoundException(`Título recebível ${id} não encontrado`);

    return receivable;
  }

  create(dto: CreateReceivableDto) {
    return this.receivablesRepository.create(dto);
  }

  async update(id: number, dto: UpdateReceivableDto) {
    await this.findOne(id);
    return this.receivablesRepository.update(id, dto);
  }

  async delete(id: number) {
    const receivable = await this.findOne(id);

    if (receivable.status === ETitleStatus.PAID)
      throw new BadRequestException(
        'Não é possível excluir um recebível já liquidado',
      );

    return this.receivablesRepository.delete(id);
  }

  async getPayment(paymentId: number) {
    const payment = await this.receivablesRepository.findPaymentById(paymentId);

    if (!payment)
      throw new NotFoundException(`Pagamento ${paymentId} não encontrado`);

    return payment;
  }

  createPayment(receivableId: number, dto: CreateReceivablePaymentDto) {
    return this.receivablesRepository.createPayment(receivableId, dto);
  }

  async deletePayment(paymentId: number) {
    await this.getPayment(paymentId);
    await this.receivablesRepository.deletePayment(paymentId);
  }

  async attachPaymentInvoice(paymentId: number, fileData: CreateFileData) {
    await this.getPayment(paymentId);
    return this.receivablesRepository.attachPaymentInvoice(paymentId, fileData);
  }

  async removePaymentInvoice(paymentId: number) {
    await this.getPayment(paymentId);
    return this.receivablesRepository.removePaymentInvoice(paymentId);
  }

  bulkDelete(ids: number[]) {
    return this.receivablesRepository.bulkDelete(ids);
  }
}
