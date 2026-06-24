import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ETitleStatus } from '@common/enums/title-status.enum';
import { PayablesService } from './payables.service';
import { PAYABLES_REPOSITORY } from './repository/payables-repository.interface';
import { FakePayablesRepository } from './repository/fake-payables.repository';

describe('PayablesService', () => {
  let service: PayablesService;
  let repo: FakePayablesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayablesService,
        { provide: PAYABLES_REPOSITORY, useClass: FakePayablesRepository },
      ],
    }).compile();
    service = module.get(PayablesService);
    repo = module.get<FakePayablesRepository>(PAYABLES_REPOSITORY);
    repo.payables = [];
    repo.payments = [];
  });

  describe('findOne', () => {
    it('returns payable when found', async () => {
      repo.payables = [
        {
          id: 1,
          description: 'Rent',
          total_amount: 500,
          status: ETitleStatus.OPEN,
        },
      ];
      expect(await service.findOne(1)).toMatchObject({ id: 1 });
    });

    it('throws NotFoundException when not found', async () => {
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates payable when found', async () => {
      repo.payables = [{ id: 1, total_amount: 500, status: ETitleStatus.OPEN }];
      const result = await service.update(1, { total_amount: 600 } as any);
      expect(result.total_amount).toBe(600);
    });

    it('throws NotFoundException when payable not found', async () => {
      await expect(service.update(99, { amount: 600 } as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes payable when found', async () => {
      repo.payables = [{ id: 1, total_amount: 500, status: ETitleStatus.OPEN }];
      await service.remove(1);
      expect(repo.payables).toHaveLength(0);
    });

    it('throws NotFoundException when payable not found', async () => {
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPayment', () => {
    it('returns payment when found', async () => {
      repo.payments = [{ id: 10, payable_id: 1, amount: 500 }];
      expect(await service.getPayment(10)).toMatchObject({ id: 10 });
    });

    it('throws NotFoundException when payment not found', async () => {
      await expect(service.getPayment(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePayment', () => {
    it('deletes payment when found', async () => {
      repo.payments = [{ id: 10, payable_id: 1, amount: 500 }];
      await service.deletePayment(10);
      expect(repo.payments).toHaveLength(0);
    });

    it('throws NotFoundException when payment not found', async () => {
      await expect(service.deletePayment(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
