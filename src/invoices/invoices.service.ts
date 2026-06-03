import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { BillStatus } from '@prisma/client';
import { InvoicesRepository } from './invoices.repository';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly repo: InvoicesRepository) {}

  listInvoices(status?: BillStatus) {
    return this.repo.findMany(status);
  }

  async getInvoice(id: number) {
    const bill = await this.repo.findById(id);
    if (!bill) throw new NotFoundException(`Invoice ${id} not found`);
    return bill;
  }

  async updateInvoice(id: number, dto: UpdateInvoiceDto) {
    const bill = await this.getInvoice(id);
    if (bill.status === 'paid' || bill.status === 'cancelled') {
      throw new ConflictException(
        `Cannot update an invoice with status "${bill.status}"`,
      );
    }
    return this.repo.update(id, {
      due_date: dto.due_date ? new Date(dto.due_date) : undefined,
      status: dto.status as BillStatus | undefined,
    });
  }

  async payInvoice(id: number, dto: PayInvoiceDto) {
    const bill = await this.getInvoice(id);
    if (bill.status === 'paid' || bill.status === 'cancelled') {
      throw new ConflictException(
        `Cannot pay an invoice with status "${bill.status}"`,
      );
    }
    return this.repo.update(id, {
      status: 'paid' as BillStatus,
      payment_source: 'manual',
      payment_method: dto.payment_method,
      paid_at: dto.paid_at ? new Date(dto.paid_at) : new Date(),
    });
  }
}
