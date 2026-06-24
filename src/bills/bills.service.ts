import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFileData } from 'src/file/interfaces/create-file-data';

import { CreateBillDto } from './dto/create-bill.dto';
import { FindAllBillsDto } from './dto/find-all-bills.dto';
import { PayBillDto } from './dto/pay-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { EBillStatus } from './enums/bill-status.enum';
import {
  BILLS_REPOSITORY,
  IBillsRepository,
} from './repository/bills-repository.interface';

@Injectable()
export class BillsService {
  constructor(
    @Inject(BILLS_REPOSITORY)
    private readonly billsRepository: IBillsRepository,
  ) {}

  findAll(dto: FindAllBillsDto) {
    return this.billsRepository.findAll(dto);
  }

  async findOne(id: number) {
    const bill = await this.billsRepository.findById(id);

    if (!bill) throw new NotFoundException(`Boleto ${id} não encontrado`);

    return bill;
  }

  create(dto: CreateBillDto) {
    return this.billsRepository.create(dto);
  }

  async update(id: number, dto: UpdateBillDto) {
    await this.findOne(id);
    return this.billsRepository.update(id, dto);
  }

  async pay(id: number, dto: PayBillDto) {
    const bill = await this.findOne(id);

    if (bill.status !== EBillStatus.OPEN && bill.status !== EBillStatus.PENDING_CNAB) {
      throw new ConflictException(
        `Não é possível pagar um boleto com status "${bill.status}"`,
      );
    }

    return this.billsRepository.pay(id, {
      status: EBillStatus.PAID,
      payment_method: dto.payment_method,
      payment_date: dto.payment_date,
      use_credit: dto.use_credit,
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.billsRepository.delete(id);
  }

  async attachInvoice(id: number, fileData: CreateFileData) {
    await this.findOne(id);
    return this.billsRepository.attachInvoice(id, fileData);
  }

  async deleteInvoice(id: number) {
    await this.findOne(id);
    return this.billsRepository.deleteInvoice(id);
  }

  bulkDelete(ids: number[]) {
    return this.billsRepository.bulkDelete(ids);
  }
}
