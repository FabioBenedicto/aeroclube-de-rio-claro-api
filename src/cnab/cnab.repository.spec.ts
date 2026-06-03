import { Test } from '@nestjs/testing';
import { CnabRepository } from './cnab.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('CnabRepository', () => {
  let repo: CnabRepository;
  let prisma: { bill: jest.Mocked<any>; settings: jest.Mocked<any> };

  beforeEach(async () => {
    prisma = {
      bill: {
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      settings: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        CnabRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    repo = module.get(CnabRepository);
  });

  describe('markBillPaid', () => {
    it('updates paid_at, status=paid and payment_source=cnab only for bills in open state', async () => {
      prisma.bill.update.mockResolvedValue({ id: 1 });
      const date = new Date('2026-06-01');
      await repo.markBillPaid(1, date);
      expect(prisma.bill.update).toHaveBeenCalledWith({
        where: { id: 1, status: { in: ['open', 'pending_cnab'] } },
        data: { paid_at: date, status: 'paid', payment_source: 'cnab' },
      });
    });
  });

  describe('markBillsPendingCnab', () => {
    it('updates only bills with status=open to pending_cnab', async () => {
      prisma.bill.updateMany.mockResolvedValue({ count: 2 });
      await repo.markBillsPendingCnab([1, 2, 3]);
      expect(prisma.bill.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] }, status: 'open' },
        data: { status: 'pending_cnab' },
      });
    });
  });
});
