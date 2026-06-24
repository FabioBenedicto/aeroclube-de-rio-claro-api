import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ReceivablesService } from './receivables.service';
import { FakeReceivablesRepository } from './repository/fake-receivables.repository';
import { RECEIVABLES_REPOSITORY } from './repository/receivables-repository.interface';

describe('ReceivablesService', () => {
  let service: ReceivablesService;
  let repo: FakeReceivablesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceivablesService,
        {
          provide: RECEIVABLES_REPOSITORY,
          useClass: FakeReceivablesRepository,
        },
      ],
    }).compile();

    service = module.get(ReceivablesService);
    repo = module.get<FakeReceivablesRepository>(RECEIVABLES_REPOSITORY);
    repo.receivables = [];
    repo.payments = [];
  });

  it('delegates createPayment to repository', async () => {
    repo.receivables = [
      { id: 1, total_amount: 500, amount_received: 0, status: 0 },
    ];
    const result = await service.createPayment(1, { amount_received: 500 });

    expect(result).toBeDefined();
    expect(repo.payments).toHaveLength(1);
  });

  it('throws NotFoundException in findOne for unknown receivable', async () => {
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('returns receivable when found', async () => {
    repo.receivables = [
      { id: 1, total_amount: 500, amount_received: 0, status: 0 },
    ];

    const result = await service.findOne(1);

    expect(result).toMatchObject({ id: 1 });
  });
});
