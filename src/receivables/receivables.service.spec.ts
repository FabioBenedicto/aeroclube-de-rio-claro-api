import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReceivablesService } from './receivables.service';
import { ReceivablesRepository } from './receivables.repository';

const mockRepo = {
  registerPayment: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
};

describe('ReceivablesService', () => {
  let service: ReceivablesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceivablesService,
        { provide: ReceivablesRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ReceivablesService>(ReceivablesService);
    jest.clearAllMocks();
  });

  it('delegates registerPayment to repository', async () => {
    const expected = { payment: { id: 1 }, applied_credits: 0, status: 'paid' };
    mockRepo.registerPayment.mockResolvedValue(expected);

    const result = await service.registerPayment(1, { amount_received: 500 });

    expect(mockRepo.registerPayment).toHaveBeenCalledWith(1, { amount_received: 500 });
    expect(result).toBe(expected);
  });

  it('propagates NotFoundException from repository', async () => {
    mockRepo.registerPayment.mockRejectedValue(new NotFoundException('Título 99 não encontrado'));

    await expect(service.registerPayment(99, { amount_received: 100 })).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException in findOne for unknown receivable', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
