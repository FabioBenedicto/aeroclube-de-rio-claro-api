import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { PayablesRepository } from './payables.repository';

const mockRepo = () => ({
  findAll:            jest.fn(),
  findById:           jest.fn(),
  create:             jest.fn(),
  update:             jest.fn(),
  delete:             jest.fn(),
  registerPayment:    jest.fn(),
  deletePayment:      jest.fn(),
  findPaymentById:    jest.fn(),
  setPaymentNotaFiscal: jest.fn(),
});

const basePayable = { id: 1, description: 'Rent', amount: 500, status: 'open' };
const basePayment = { id: 10, payable_id: 1, amount: 500 };

describe('PayablesService', () => {
  let service: PayablesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayablesService,
        { provide: PayablesRepository, useFactory: mockRepo },
      ],
    }).compile();
    service = module.get(PayablesService);
    repo    = module.get(PayablesRepository);
  });

  describe('findOne', () => {
    it('returns payable when found', async () => {
      repo.findById.mockResolvedValue(basePayable);
      expect(await service.findOne(1)).toEqual(basePayable);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates payable when found', async () => {
      repo.findById.mockResolvedValue(basePayable);
      repo.update.mockResolvedValue({ ...basePayable, amount: 600 });
      const result = await service.update(1, { amount: 600 } as any);
      expect(repo.update).toHaveBeenCalledWith(1, { amount: 600 });
      expect(result.amount).toBe(600);
    });

    it('throws NotFoundException when payable not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update(99, { amount: 600 } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes payable when found', async () => {
      repo.findById.mockResolvedValue(basePayable);
      repo.delete.mockResolvedValue(basePayable);
      await service.remove(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when payable not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPayment', () => {
    it('returns payment when found', async () => {
      repo.findPaymentById.mockResolvedValue(basePayment);
      expect(await service.getPayment(10)).toEqual(basePayment);
    });

    it('throws NotFoundException when payment not found', async () => {
      repo.findPaymentById.mockResolvedValue(null);
      await expect(service.getPayment(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePayment', () => {
    it('deletes payment when found', async () => {
      repo.deletePayment.mockResolvedValue(basePayment);
      const result = await service.deletePayment(10);
      expect(result).toEqual(basePayment);
    });

    it('throws NotFoundException when payment not found', async () => {
      repo.deletePayment.mockResolvedValue(null);
      await expect(service.deletePayment(99)).rejects.toThrow(NotFoundException);
    });
  });
});
