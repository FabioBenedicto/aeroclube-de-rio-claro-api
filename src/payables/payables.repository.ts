import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

@Injectable()
export class PayablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.payable.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      include: { instructor: { include: { customer: true } }, installments: true },
    });
  }

  findById(id: number) {
    return this.prisma.payable.findUnique({
      where: { id },
      include: { instructor: { include: { customer: true } }, installments: true },
    });
  }

  updateInstallment(id: number, data: Prisma.PayableInstallmentUpdateInput, tx?: Tx) {
    const client: Tx = tx ?? this.prisma;
    return client.payableInstallment.update({ where: { id }, data });
  }

  updatePayable(id: number, data: Prisma.PayableUpdateInput, tx?: Tx) {
    const client: Tx = tx ?? this.prisma;
    return client.payable.update({ where: { id }, data });
  }
}
