import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.invoice.findMany({
      orderBy: { issue_date: 'desc' },
      include: { customer: true, receivables: true },
    });
  }

  findById(id: number) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, receivables: { include: { payments: true } } },
    });
  }

  update(id: number, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({ where: { id }, data });
  }
}
