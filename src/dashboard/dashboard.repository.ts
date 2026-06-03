import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryData() {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [
      totalReceivables,
      openReceivables,
      totalPayables,
      openPayables,
      flightsToday,
      inFlight,
      activePersons,
    ] = await Promise.all([
      this.prisma.receivable.aggregate({ _sum: { total_amount: true } }),
      this.prisma.receivable.aggregate({ where: { status: 0 }, _sum: { total_amount: true } }),
      this.prisma.payable.aggregate({ _sum: { amount: true } }),
      this.prisma.payable.aggregate({ where: { status: 'open' }, _sum: { amount: true } }),
      this.prisma.flight.count({ where: { start_date: { gte: startOfToday } } }),
      this.prisma.flight.count({ where: { end_date: null } }),
      this.prisma.person.count(),
    ]);

    return {
      totalReceivables,
      openReceivables,
      totalPayables,
      openPayables,
      flightsToday,
      inFlight,
      activePersons,
    };
  }
}
