import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BillsService } from './bills.service';
import { BILLS_REPOSITORY } from './repository/bills-repository.interface';
import { FakeBillsRepository } from './repository/fake-bills.repository';

describe('BillsService', () => {
  let service: BillsService;
  let repo: FakeBillsRepository;

  const mockBill = {
    id: 1,
    people_id: 10,
    total_amount: 150,
    expiration_date: new Date('2026-06-30'),
    payment_date: null,
    created_at: new Date(),
    file: null,
    file_id: null,
    People: { id: 10, name: 'JOAO SILVA', cpf: '12345678900' },
    receivable_payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        { provide: BILLS_REPOSITORY, useClass: FakeBillsRepository },
      ],
    }).compile();
    service = module.get(BillsService);
    repo = module.get<FakeBillsRepository>(BILLS_REPOSITORY);
    repo.bills = [];
  });

  describe('findOne', () => {
    it('returns bill when found', async () => {
      repo.bills = [mockBill];
      const result = await service.findOne(1);
      expect(result).toMatchObject({ id: 1 });
    });

    it('throws NotFoundException when not found', async () => {
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('throws NotFoundException when bill not found', async () => {
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
