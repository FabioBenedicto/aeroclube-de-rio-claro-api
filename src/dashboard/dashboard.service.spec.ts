import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';

import { DashboardService } from './dashboard.service';
import { DASHBOARD_REPOSITORY } from './repository/dashboard-repository.interface';
import { FakeDashboardRepository } from './repository/fake-dashboard.repository';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let dashboardRepository: FakeDashboardRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DASHBOARD_REPOSITORY,
          useClass: FakeDashboardRepository,
        },
      ],
    }).compile();
    dashboardService = module.get(DashboardService);
    dashboardRepository = module.get<FakeDashboardRepository>(DASHBOARD_REPOSITORY);
  });

  it('getSummary maps repository data to response shape', async () => {
    const totalReceivables = faker.number.int({ min: 1000, max: 9000 });
    const openReceivables  = faker.number.int({ min: 100,  max: 999  });
    const totalPayables    = faker.number.int({ min: 1000, max: 9000 });
    const openPayables     = faker.number.int({ min: 100,  max: 999  });
    const flightsToday     = faker.number.int({ min: 1,    max: 10   });
    const inFlight         = faker.number.int({ min: 0,    max: 5    });
    const activePeople     = faker.number.int({ min: 1,    max: 100  });

    dashboardRepository.data = {
      totalReceivables,
      openReceivables,
      totalPayables,
      openPayables,
      flightsToday,
      inFlight,
      activePeople,
    };

    const result = await dashboardService.getSummary();

    expect(result.receivables.total).toBe(totalReceivables);
    expect(result.receivables.open).toBe(openReceivables);
    expect(result.payables.total).toBe(totalPayables);
    expect(result.payables.open).toBe(openPayables);
    expect(result.flights.today).toBe(flightsToday);
    expect(result.flights.in_flight).toBe(inFlight);
    expect(result.people).toBe(activePeople);
  });
});
