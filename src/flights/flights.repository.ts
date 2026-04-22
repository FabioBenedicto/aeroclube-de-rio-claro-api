import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

@Injectable()
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFlight(data: Prisma.FlightCreateInput, tx?: Tx) {
    const client: Tx = (tx ?? this.prisma) as Tx;
    return client.flight.create({
      data,
      include: { plane: true, customer: true, instructor: true },
    });
  }

  async createReceivable(data: Prisma.ReceivableCreateInput, tx?: Tx) {
    const client: Tx = (tx ?? this.prisma) as Tx;
    return client.receivable.create({ data });
  }

  async createPayable(data: Prisma.PayableCreateInput, tx?: Tx) {
    const client: Tx = (tx ?? this.prisma) as Tx;
    return client.payable.create({ data });
  }

  async createPayableInstallment(data: Prisma.PayableInstallmentCreateInput, tx?: Tx) {
    const client: Tx = (tx ?? this.prisma) as Tx;
    return client.payableInstallment.create({ data });
  }
}
