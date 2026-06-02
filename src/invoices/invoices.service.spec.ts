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
    it('lança NotFoundException quando fatura não existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getInvoice(99)).rejects.toThrow(NotFoundException);
    });

    it('retorna a fatura quando existe', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      await expect(service.getInvoice(1)).resolves.toEqual(bill);
    });
  });

  describe('updateInvoice', () => {
    it('lança ConflictException ao tentar cancelar fatura já paga', async () => {
      repo.findById.mockResolvedValue(makeBill('paid'));
      await expect(service.updateInvoice(1, { status: 'cancelled' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('permite cancelar fatura com status open', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue({ ...bill, status: 'cancelled' } as any);
      await service.updateInvoice(1, { status: 'cancelled' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'cancelled' }),
      );
    });

    it('permite cancelar fatura com status pending_cnab', async () => {
      const bill = makeBill('pending_cnab');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue({ ...bill, status: 'cancelled' } as any);
      await service.updateInvoice(1, { status: 'cancelled' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ status: 'cancelled' }),
      );
    });

    it('atualiza due_date sem alterar status', async () => {
      const bill = makeBill('open');
      repo.findById.mockResolvedValue(bill);
      repo.update.mockResolvedValue(bill as any);
      await service.updateInvoice(1, { due_date: '2026-07-01' });
      expect(repo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ due_date: new Date('2026-07-01') }),
      );
    });
  });

  describe('payInvoice', () => {
    it('lança ConflictException quando fatura já está paga', async () => {
      repo.findById.mockResolvedValue(makeBill('paid'));
      await expect(service.payInvoice(1, { payment_method: 'PIX' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('lança ConflictException quando fatura está cancelada', async () => {
      repo.findById.mockResolvedValue(makeBill('cancelled'));
      await expect(service.payInvoice(1, { payment_method: 'dinheiro' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('grava status=paid, payment_source=manual, payment_method e paid_at', async () => {
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

    it('usa a data de hoje quando paid_at não é fornecido', async () => {
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
