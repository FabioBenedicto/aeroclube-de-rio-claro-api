import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCreditDto } from './dto/add-credit.dto';

@Injectable()
export class CreditsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerCredits(customerId: number) {
    const customer = await this.prisma.person.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Cliente ${customerId} não encontrado`);
    const movements = await this.prisma.receivablePayment.findMany({
      where: { receivable: { client_id: customerId } },
      orderBy: { payment_date: 'desc' },
      take: 20,
      include: { receivable: { select: { title: true } } },
    });
    return {
      customer_id: customerId,
      flight_hour_balance: customer.flight_hour_balance,
      movements,
    };
  }

  async addCredit(customerId: number, dto: AddCreditDto) {
    const customer = await this.prisma.person.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException(`Cliente ${customerId} não encontrado`);
    const updated = await this.prisma.person.update({
      where: { id: customerId },
      data: { flight_hour_balance: { increment: dto.amount } },
    });
    return { customer_id: customerId, flight_hour_balance: updated.flight_hour_balance, added: dto.amount };
  }
}
