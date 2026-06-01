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
      where: { id },
      data: { paid_at: paidAt },
    });
  }

  incrementRemessaSequence() {
    return this.prisma.settings.update({
      where: { id: 1 },
      data: { sicoob_remessa_sequence: { increment: 1 } },
    });
  }
}
