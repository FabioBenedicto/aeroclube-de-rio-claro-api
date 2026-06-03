import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async getSummary() {
    const d = await this.repo.getSummaryData();
    return {
      receivables: {
        total: d.totalReceivables._sum.total_amount ?? 0,
        open: d.openReceivables._sum.total_amount ?? 0,
      },
      payables: {
        total: d.totalPayables._sum.amount ?? 0,
        open: d.openPayables._sum.amount ?? 0,
      },
      flights: { today: d.flightsToday, in_flight: d.inFlight },
      persons: d.activePersons,
    };
  }
}
