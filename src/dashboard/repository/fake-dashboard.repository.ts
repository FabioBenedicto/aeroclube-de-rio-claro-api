import { Injectable } from '@nestjs/common';

import {
  DashboardData,
  IDashboardRepository,
} from './dashboard-repository.interface';

@Injectable()
export class FakeDashboardRepository implements IDashboardRepository {
  data: DashboardData = {
    totalReceivables: 0,
    openReceivables:  0,
    totalPayables:    0,
    openPayables:     0,
    flightsToday:     0,
    inFlight:         0,
    activePeople:     0,
  };

  async getSummaryData(): Promise<DashboardData> {
    return this.data;
  }
}
