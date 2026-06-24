export const DASHBOARD_REPOSITORY = Symbol('IDashboardRepository');

export interface DashboardData {
  totalReceivables: number;
  openReceivables:  number;
  totalPayables:    number;
  openPayables:     number;
  flightsToday:     number;
  inFlight:         number;
  activePeople:     number;
}

export interface IDashboardRepository {
  getSummaryData(): Promise<DashboardData>;
}
