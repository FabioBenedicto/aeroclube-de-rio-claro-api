import { Inject, Injectable } from '@nestjs/common';

import {
  DASHBOARD_REPOSITORY,
  IDashboardRepository,
} from './repository/dashboard-repository.interface';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async getSummary() {
    const d = await this.dashboardRepository.getSummaryData();

    return {
      receivables: { total: d.totalReceivables, open: d.openReceivables },
      payables:    { total: d.totalPayables,    open: d.openPayables    },
      flights:     { today: d.flightsToday,     in_flight: d.inFlight   },
      people:      d.activePeople,
    };
  }
}
