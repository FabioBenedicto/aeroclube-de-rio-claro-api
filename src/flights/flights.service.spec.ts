import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PayableTypesService } from '../payable-types/payable-types.service';
import { ReceivableTypesService } from '../receivable-types/receivable-types.service';
import { FlightsService } from './flights.service';
import { FakeFlightsRepository } from './repository/fake-flights.repository';
import { FLIGHTS_REPOSITORY } from './repository/flights-repository.interface';

const mockAircraft = { id: 1, flight_hour_value: 500, type: 'airplane' };

describe('FlightsService', () => {
  let service: FlightsService;
  let fakeRepo: FakeFlightsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        { provide: FLIGHTS_REPOSITORY, useClass: FakeFlightsRepository },
        {
          provide: ReceivableTypesService,
          useValue: {
            findByName: jest.fn().mockResolvedValue({ id: 1, name: 'Voo' }),
          },
        },
        {
          provide: PayableTypesService,
          useValue: {
            findByName: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Instrução' }),
          },
        },
      ],
    }).compile();

    service = module.get(FlightsService);
    fakeRepo = module.get<FakeFlightsRepository>(FLIGHTS_REPOSITORY);
    fakeRepo.aircraft = mockAircraft;
  });

  const baseDto = {
    aircraft_id: 1,
    people_id: 10,
    type: 'solo',
    origin: 'SDRP',
    destination: 'SDTC',
    start_date: '2024-01-15T14:00:00Z',
    end_date: '2024-01-15T15:30:00Z',
  };

  it('creates flight and receivable for solo flight', async () => {
    await service.registerFlight(baseDto);

    expect(fakeRepo.flights).toHaveLength(1);
    expect(fakeRepo.receivables).toHaveLength(1);
    expect(fakeRepo.payables).toHaveLength(0);
  });

  it('receivable title includes flight id', async () => {
    await service.registerFlight(baseDto);

    const flightId = fakeRepo.flights[0].id;
    expect(fakeRepo.receivables[0].title).toBe(`Flight ${flightId}`);
    expect(fakeRepo.receivables[0].flightId).toBe(flightId);
  });

  it('creates flight, receivable AND payable for flight with instructor', async () => {
    await service.registerFlight({
      ...baseDto,
      instructor_id: 5,
      type: 'instrucao',
    });

    expect(fakeRepo.receivables).toHaveLength(1);
    expect(fakeRepo.payables).toHaveLength(1);
    expect(fakeRepo.payables[0].instructorId).toBe(5);
  });

  it('throws NotFoundException for unknown aircraft', async () => {
    fakeRepo.aircraft = null;
    await expect(service.registerFlight(baseDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('saves start_date strictly in UTC regardless of input timezone', async () => {
    await service.registerFlight({
      ...baseDto,
      start_date: '2024-01-15T14:00:00-03:00',
      end_date: '2024-01-15T15:30:00-03:00',
    });

    expect(fakeRepo.flights[0].start_date.toISOString()).toBe(
      '2024-01-15T17:00:00.000Z',
    );
    expect(fakeRepo.flights[0].end_date!.toISOString()).toBe(
      '2024-01-15T18:30:00.000Z',
    );
  });

  it('does not create receivable when no end_date is provided', async () => {
    await service.registerFlight({ ...baseDto, end_date: undefined });

    expect(fakeRepo.receivables).toHaveLength(0);
    expect(fakeRepo.payables).toHaveLength(0);
  });
});
