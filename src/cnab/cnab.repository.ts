import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const billInclude = {
  customer: true,
};

@Injectable()
export class CnabRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBillsByIds(ids: number[]) {
    const bills = await this.prisma.bill.findMany({
      where: { id: { in: ids } },
      include: billInclude,
    });
    const missing = ids.filter((id) => !bills.find((b) => b.id === id));
    if (missing.length > 0) {
      throw new NotFoundException(`Faturas não encontradas: ${missing.join(', ')}`);
    }
    return bills;
  }

  getSettings() {
    return this.prisma.settings.findUnique({ where: { id: 1 } });
  }

  markBillPaid(id: number, paidAt: Date) {
    return this.prisma.bill.update({
      where: { id, status: { in: ['open', 'pending_cnab'] } },
      data: { paid_at: paidAt, status: 'paid', payment_source: 'cnab' },
    });
  }

  markBillsPendingCnab(ids: number[]) {
    return this.prisma.bill.updateMany({
      where: { id: { in: ids }, status: 'open' },
      data: { status: 'pending_cnab' },
    });
  }

  incrementRemessaSequence() {
    return this.prisma.settings.update({
      where: { id: 1 },
      data: { sicoob_remessa_sequence: { increment: 1 } },
    });
  }

  saveRemessa(data: {
    sequence_number: number;
    bill_ids: number[];
    bill_count: number;
    total_amount: number;
    file_path: string;
  }) {
    return this.prisma.cnabRemessa.create({ data });
  }

  async listRemessas(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.cnabRemessa.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cnabRemessa.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findRemessa(id: number) {
    return this.prisma.cnabRemessa.findUnique({ where: { id } });
  }

  saveRetorno(data: {
    paid_ids: number[];
    rejected_ids: number[];
    errors: string[];
    paid_count: number;
    rejected_count: number;
  }) {
    return this.prisma.cnabRetorno.create({ data });
  }

  async listRetornos(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.cnabRetorno.findMany({
        orderBy: { processed_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.cnabRetorno.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
