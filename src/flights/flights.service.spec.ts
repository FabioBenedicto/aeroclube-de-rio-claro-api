import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsRepository } from './flights.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client-runtime-utils';

const mockPlane = {
  id: 1,
  registration: 'PT-ABC',
  model: 'Cessna 152',
  flight_hour_value: new Decimal('500.00'),
  status: 'active',
};

const mockFlight = { id: 1, plane_id: 1, customer_id: 10 };

const mockPrisma = {
  plane: { findUnique: jest.fn() },
  $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => cb({})),
};

const mockRepo = {
  createFlight: jest.fn(),
  createReceivable: jest.fn(),
  createPayable: jest.fn(),
  createPayableInstallment: jest.fn(),
};

describe('FlightsService', () => {
  let service: FlightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: FlightsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
    jest.clearAllMocks();
    mockPrisma.plane.findUnique.mockResolvedValue(mockPlane);
    mockRepo.createFlight.mockResolvedValue(mockFlight);
    mockRepo.createPayable.mockResolvedValue({ id: 99 });
  });

  const baseDto = {
    plane_id: 1,
    customer_id: 10,
    type: 'solo',
    double_command: false,
    origin: 'SDRP',
    destination: 'SDTC',
    start_date: '2024-01-15T14:00:00Z',
    end_date: '2024-01-15T15:30:00Z',
  };

  it('creates flight and receivable for solo flight', async () => {
    await service.registerFlight(baseDto);

    expect(mockRepo.createFlight).toHaveBeenCalledTimes(1);
    expect(mockRepo.createReceivable).toHaveBeenCalledTimes(1);
    expect(mockRepo.createPayable).not.toHaveBeenCalled();
  });

  it('creates flight, receivable AND payable for double_command flight', async () => {
    await service.registerFlight({
      ...baseDto,
      instructor_id: 5,
      type: 'instrucao',
      double_command: true,
    });

    expect(mockRepo.createReceivable).toHaveBeenCalledTimes(1);
    expect(mockRepo.createPayable).toHaveBeenCalledTimes(1);
    expect(mockRepo.createPayableInstallment).toHaveBeenCalledTimes(1);
  });

  it('throws NotFoundException for unknown plane', async () => {
    mockPrisma.plane.findUnique.mockResolvedValue(null);

    await expect(service.registerFlight(baseDto)).rejects.toThrow(NotFoundException);
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

    const arg = mockRepo.createFlight.mock.calls[0][0];
    expect(arg.start_date.toISOString()).toBe('2024-01-15T17:00:00.000Z');
    expect(arg.end_date.toISOString()).toBe('2024-01-15T18:30:00.000Z');
  });

  it('does not create receivable when no end_date is provided', async () => {
    await service.registerFlight({ ...baseDto, end_date: undefined });

    expect(mockRepo.createReceivable).not.toHaveBeenCalled();
  });
});
