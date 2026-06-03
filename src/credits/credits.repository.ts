import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findPerson(personId: number) {
    return this.prisma.person.findUnique({ where: { id: personId } });
  }

  getMovements(personId: number) {
    return this.prisma.receivablePayment.findMany({
      where: { receivable: { client_id: personId } },
      orderBy: { payment_date: 'desc' },
      take: 20,
      include: { receivable: { select: { title: true } } },
    });
  }

  addCredit(personId: number, amount: number) {
    return this.prisma.person.update({
      where: { id: personId },
      data: { flight_hour_balance: { increment: amount } },
    });
  }
}
