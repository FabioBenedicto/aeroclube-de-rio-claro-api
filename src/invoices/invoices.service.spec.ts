import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesRepository } from './invoices.repository';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let repo: jest.Mocked<InvoicesRepository>;

  const makeBill = (status: string) =>
    ({
      id: 1,
      status,
      customer_id: 1,
      total_amount: 100,
      paid_at: null,
      payment_source: null,
      payment_method: null,
      customer: { id: 1, name: 'JOAO' },
    }) as any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: InvoicesRepository,
          useValue: {
            findMany: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(InvoicesService);
    repo = module.get(InvoicesRepository);
  });

  describe('getInvoice', () => {
    it('throws NotFoundException when invoice does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getInvoice(99)).rejects.toThrow(NotFoundException);
    });

    it('returns the invoice when it exists', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      await expect(service.getInvoice(1)).resolves.toEqual(bill);
    });
  });

  describe('updateInvoice', () => {
    it('throws ConflictException when trying to cancel an already paid invoice', async () => {
      repo.findById.mockResolvedValue(makeBill('paid'));
      await expect(service.updateInvoice(1, { status: 'cancelled' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('allows cancelling an invoice with status open', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue({ ...bill, status: 'cancelled' } as any);
      await service.updateInvoice(1, { status: 'cancelled' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'cancelled' }),
      );
    });

    it('allows cancelling an invoice with status pending_cnab', async () => {
      const bill = makeBill('pending_cnab');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue({ ...bill, status: 'cancelled' } as any);
      await service.updateInvoice(1, { status: 'cancelled' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'cancelled' }),
      );
    });

    it('updates due_date without changing status', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue(bill as any);
      await service.updateInvoice(1, { due_date: '2026-07-01' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ due_date: new Date('2026-07-01') }),
      );
    });

    it('throws ConflictException when trying to update a cancelled invoice', async () => {
      repo.findById.mockResolvedValue(makeBill('cancelled'));
      await expect(
        service.updateInvoice(1, { due_date: '2026-07-01' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('payInvoice', () => {
    it('throws ConflictException when invoice is already paid', async () => {
      repo.findById.mockResolvedValue(makeBill('paid'));
      await expect(service.payInvoice(1, { payment_method: 'PIX' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws ConflictException when invoice is cancelled', async () => {
      repo.findById.mockResolvedValue(makeBill('cancelled'));
      await expect(service.payInvoice(1, { payment_method: 'dinheiro' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('saves status=paid, payment_source=manual, payment_method and paid_at', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue({ ...bill, status: 'paid' } as any);
      await service.payInvoice(1, { payment_method: 'PIX', paid_at: '2026-06-01' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          status: 'paid',
          payment_source: 'manual',
          payment_method: 'PIX',
          paid_at: new Date('2026-06-01'),
        }),
      );
    });

    it('uses today as paid_at when it is not provided', async () => {
      const bill = makeBill('pending_cnab');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue({ ...bill, status: 'paid' } as any);
      const before = new Date();
      await service.payInvoice(1, { payment_method: 'dinheiro' });
      const after = new Date();
      const call = repo.update.mock.calls[0][1] as any;
      expect(call.paid_at.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(call.paid_at.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
