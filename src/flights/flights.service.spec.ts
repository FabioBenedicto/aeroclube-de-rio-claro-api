import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsRepository } from './flights.repository';
import { Decimal } from '@prisma/client-runtime-utils';
import { AircraftType } from './enums/aircraft-type.enum';

const mockPlane = {
  id: 1,
  registration: 'PT-ABC',
  model: 'Cessna 152',
  flight_hour_value: new Decimal('500.00'),
  status: 'active',
};

const mockFlight = { id: 42, plane_id: 1, customer_id: 10 };

const mockRepo = {
  findPlane: jest.fn(),
  findSettings: jest.fn(),
  registerFlight: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  updateFlight: jest.fn(),
};

describe('FlightsService', () => {
  let service: FlightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        { provide: FlightsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
    jest.clearAllMocks();
    mockRepo.findPlane.mockResolvedValue(mockPlane);
    mockRepo.findSettings.mockResolvedValue(null);
    mockRepo.registerFlight.mockResolvedValue(mockFlight);
  });

  const baseDto = {
    plane_id: 1,
    customer_id: 10,
    aircraft_type: AircraftType.AIRPLANE,
    type: 'solo',
    double_command: false,
    origin: 'SDRP',
    destination: 'SDTC',
    start_date: '2024-01-15T14:00:00Z',
    end_date: '2024-01-15T15:30:00Z',
  };

  it('creates flight and receivable for solo flight', async () => {
    await service.registerFlight(baseDto);

    expect(mockRepo.registerFlight).toHaveBeenCalledTimes(1);
    const input = mockRepo.registerFlight.mock.calls[0][0];
    expect(input.buildReceivable).toBeDefined();
    expect(input.buildPayable).toBeUndefined();
  });

  it('buildReceivable includes flight id in title', async () => {
    await service.registerFlight(baseDto);

    const input = mockRepo.registerFlight.mock.calls[0][0];
    const receivable = input.buildReceivable(42);
    expect(receivable.title).toBe('Flight 42');
    expect(receivable.flight).toEqual({ connect: { id: 42 } });
  });

  it('creates flight, receivable AND payable for double_command flight', async () => {
    await service.registerFlight({
      ...baseDto,
      instructor_id: 5,
      type: 'instrucao',
      double_command: true,
    });

    const input = mockRepo.registerFlight.mock.calls[0][0];
    expect(input.buildReceivable).toBeDefined();
    expect(input.buildPayable).toBeDefined();

    const payable = input.buildPayable(42);
    expect(payable.title).toBe('Instruction 42');
  });

  it('throws NotFoundException for unknown plane', async () => {
    mockRepo.findPlane.mockResolvedValue(null);

    await expect(service.registerFlight(baseDto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException when double_command has no instructor', async () => {
    await expect(
      service.registerFlight({ ...baseDto, double_command: true }),
    ).rejects.toThrow(BadRequestException);
  });

  it('saves start_date strictly in UTC regardless of input timezone', async () => {
    await service.registerFlight({
      ...baseDto,
      start_date: '2024-01-15T14:00:00-03:00',
      end_date: '2024-01-15T15:30:00-03:00',
    });

    const { flightData } = mockRepo.registerFlight.mock.calls[0][0];
    expect(flightData.start_date.toISOString()).toBe(
      '2024-01-15T17:00:00.000Z',
    );
    expect(flightData.end_date.toISOString()).toBe('2024-01-15T18:30:00.000Z');
  });

  it('does not create receivable when no end_date is provided', async () => {
    await service.registerFlight({ ...baseDto, end_date: undefined });

    const input = mockRepo.registerFlight.mock.calls[0][0];
    expect(input.buildReceivable).toBeUndefined();
    expect(input.buildPayable).toBeUndefined();
  });
});
