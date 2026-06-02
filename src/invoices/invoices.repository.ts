import { Injectable } from '@nestjs/common';
import { BillStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const billInclude = { customer: true };

@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(status?: BillStatus) {
    return this.prisma.bill.findMany({
      where: status ? { status } : undefined,
      include: billInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.bill.findUnique({
      where: { id },
      include: billInclude,
    });
  }

  update(id: number, data: Parameters<PrismaService['bill']['update']>[0]['data']) {
    return this.prisma.bill.update({ where: { id }, data });
  }
}
