import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalReceivables,
      openReceivables,
      totalPayables,
      openPayables,
      flightsToday,
      inFlight,
      activeCustomers,
    ] = await Promise.all([
      this.prisma.receivable.aggregate({ _sum: { total_amount: true } }),
      this.prisma.receivable.aggregate({ where: { status: 0 }, _sum: { total_amount: true } }),
      this.prisma.payable.aggregate({ _sum: { amount: true } }),
      this.prisma.payable.aggregate({ where: { status: 'open' }, _sum: { amount: true } }),
      this.prisma.flight.count({ where: { start_date: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      this.prisma.flight.count({ where: { end_date: null } }),
      this.prisma.person.count(),
    ]);

    return {
      receivables: {
        total: totalReceivables._sum.total_amount ?? 0,
        open: openReceivables._sum.total_amount ?? 0,
      },
      payables: {
        total: totalPayables._sum.amount ?? 0,
        open: openPayables._sum.amount ?? 0,
      },
      flights: { today: flightsToday, in_flight: inFlight },
      customers: activeCustomers,
    };
  }
}
