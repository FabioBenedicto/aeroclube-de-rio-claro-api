import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

@Injectable()
export class ReceivablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number, tx?: Tx) {
    const client: Tx = tx ?? this.prisma;
    return client.receivable.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async updateReceivable(id: number, data: Prisma.ReceivableUpdateInput, tx?: Tx) {
    const client: Tx = tx ?? this.prisma;
    return client.receivable.update({ where: { id }, data });
  }

  async createPayment(data: Prisma.ReceivablePaymentCreateInput, tx?: Tx) {
    const client: Tx = tx ?? this.prisma;
    return client.receivablePayment.create({ data });
  }

  async updateCustomerBalance(customerId: number, delta: number, tx?: Tx) {
    const client: Tx = tx ?? this.prisma;
    return client.customer.update({
      where: { id: customerId },
      data: { flight_hour_balance: { increment: delta } },
    });
  }
}
