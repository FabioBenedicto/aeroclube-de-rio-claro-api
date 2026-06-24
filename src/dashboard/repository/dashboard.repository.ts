import { Injectable } from '@nestjs/common';
import { TitleStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import {
  DashboardData,
  IDashboardRepository,
} from './dashboard-repository.interface';

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryData(): Promise<DashboardData> {
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
      this.prisma.receivable.aggregate({
        where: { status: TitleStatus.OPEN },
        _sum: { total_amount: true },
      }),
      this.prisma.payable.aggregate({ _sum: { total_amount: true } }),
      this.prisma.payable.aggregate({
        where: { status: TitleStatus.OPEN },
        _sum: { total_amount: true },
      }),
      this.prisma.flight.count({
        where: { start_date: { gte: startOfToday } },
      }),
      this.prisma.flight.count({ where: { end_date: null } }),
      this.prisma.people.count(),
    ]);

    return {
      totalReceivables: totalReceivables as DashboardData['totalReceivables'],
      openReceivables: openReceivables as DashboardData['openReceivables'],
      totalPayables: totalPayables as DashboardData['totalPayables'],
      openPayables: openPayables as DashboardData['openPayables'],
      flightsToday,
      inFlight,
      activePersons,
    };
  }
}
