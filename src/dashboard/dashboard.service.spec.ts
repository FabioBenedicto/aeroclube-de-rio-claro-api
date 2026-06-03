import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

const mockRepo = () => ({ getSummaryData: jest.fn() });

describe('DashboardService', () => {
  let service: DashboardService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useFactory: mockRepo },
      ],
    }).compile();
    service = module.get(DashboardService);
    repo    = module.get(DashboardRepository);
  });

  it('getSummary maps repository data to response shape', async () => {
    repo.getSummaryData.mockResolvedValue({
      totalReceivables: { _sum: { total_amount: 1000 } },
      openReceivables:  { _sum: { total_amount: 400  } },
      totalPayables:    { _sum: { amount: 500 } },
      openPayables:     { _sum: { amount: 200 } },
      flightsToday: 3,
      inFlight:     1,
      activePersons: 42,
    });

    const result = await service.getSummary();
    expect(result.receivables.total).toBe(1000);
    expect(result.receivables.open).toBe(400);
    expect(result.payables.total).toBe(500);
    expect(result.flights.today).toBe(3);
    expect(result.persons).toBe(42);
  });
});
