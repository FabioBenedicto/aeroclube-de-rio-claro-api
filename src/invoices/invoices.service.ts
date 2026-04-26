import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';

export class UpdateInvoiceDto {
  status?: string;
  due_date?: string;
}

@Injectable()
export class InvoicesService {
  constructor(private readonly repo: InvoicesRepository) {}

  findAll() { return this.repo.findAll(); }

  async findOne(id: number) {
    const inv = await this.repo.findById(id);
    if (!inv) throw new NotFoundException(`Fatura ${id} não encontrada`);
    return inv;
  }

  async update(id: number, dto: UpdateInvoiceDto) {
    await this.findOne(id);
    return this.repo.update(id, {
      status: dto.status,
      due_date: dto.due_date ? new Date(dto.due_date) : undefined,
    });
  }
}
