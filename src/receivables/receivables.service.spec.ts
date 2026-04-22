import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { ReceivablesRepository } from './receivables.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client-runtime-utils';

const mockPrisma = {
  $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => cb({})),
};

const mockRepo = {
  findById: jest.fn(),
  updateReceivable: jest.fn(),
  createPayment: jest.fn(),
  updateCustomerBalance: jest.fn(),
};

const openReceivable = {
  id: 1,
  client_id: 10,
  status: 0,
  total_amount: new Decimal('500'),
  amount_received: new Decimal('0'),
  customer: { id: 10, flight_hour_balance: 0 },
};

describe('ReceivablesService', () => {
  let service: ReceivablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceivablesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ReceivablesRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ReceivablesService>(ReceivablesService);
    jest.clearAllMocks();
    mockRepo.createPayment.mockResolvedValue({ id: 1 });
    mockRepo.updateReceivable.mockResolvedValue({});
    mockRepo.updateCustomerBalance.mockResolvedValue({});
  });

  it('throws NotFoundException for unknown receivable', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      service.registerPayment(99, { amount_received: 100 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException for already paid receivable', async () => {
    mockRepo.findById.mockResolvedValue({
      ...openReceivable,
      status: 1,
      amount_received: new Decimal('500'),
    });

    await expect(
      service.registerPayment(1, { amount_received: 100 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('marks receivable as paid when full amount received', async () => {
    mockRepo.findById.mockResolvedValue(openReceivable);

    const result = await service.registerPayment(1, { amount_received: 500 });

    expect(result.status).toBe('paid');
    expect(mockRepo.updateReceivable).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ status: 1 }),
      {},
    );
  });

  it('marks receivable as partial when amount is less than total', async () => {
    mockRepo.findById.mockResolvedValue(openReceivable);

    const result = await service.registerPayment(1, { amount_received: 200 });

    expect(result.status).toBe('partial');
    expect(result.applied_credits).toBe(0);
  });

  it('deducts flight_hour_balance credits before registering cash payment', async () => {
    mockRepo.findById.mockResolvedValue({
      ...openReceivable,
      customer: { id: 10, flight_hour_balance: 200 },
    });

    const result = await service.registerPayment(1, { amount_received: 300 });

    expect(result.applied_credits).toBe(200);
    expect(result.status).toBe('paid');
    expect(mockRepo.updateCustomerBalance).toHaveBeenCalledWith(10, -200, {});
  });

  it('caps credit deduction at outstanding balance', async () => {
    mockRepo.findById.mockResolvedValue({
      ...openReceivable,
      total_amount: new Decimal('100'),
      customer: { id: 10, flight_hour_balance: 200 },
    });

    const result = await service.registerPayment(1, { amount_received: 0 });

    expect(result.applied_credits).toBe(100);
    expect(result.status).toBe('paid');
    expect(mockRepo.updateCustomerBalance).toHaveBeenCalledWith(10, -100, {});
  });
});
