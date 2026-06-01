import { Injectable, NotFoundException } from '@nestjs/common';
import { BillsRepository } from './bills.repository';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Injectable()
export class BillsService {
  constructor(private readonly repo: BillsRepository) {}

  async findAll(customerId?: number, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20, pending = false, dueFrom?: Date, dueTo?: Date) {
    const { data, total } = await this.repo.findAll(customerId, dateFrom, dateTo, page, limit, pending, dueFrom, dueTo);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const bill = await this.repo.findById(id);
    if (!bill) throw new NotFoundException(`Fatura ${id} não encontrada`);
    return bill;
  }

  create(dto: CreateBillDto) {
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateBillDto) {
    await this.findOne(id);
    return this.repo.update(id, {
      due_date: dto.due_date ? new Date(dto.due_date) : undefined,
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async setNotaFiscal(id: number, path: string | null) {
    await this.findOne(id);
    return this.repo.setNotaFiscal(id, path);
  }

  createBoleto(dto: import('./dto/create-boleto-bill.dto').CreateBoletoBillDto) {
    return this.repo.createBoleto(dto);
  }
}
