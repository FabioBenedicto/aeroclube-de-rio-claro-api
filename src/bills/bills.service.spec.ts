import { Test, TestingModule } from '@nestjs/testing';
import { BillsService } from './bills.service';
import { BillsRepository } from './bills.repository';

describe('BillsService.createBoleto', () => {
  let service: BillsService;
  let repo: jest.Mocked<BillsRepository>;

  const mockBill = {
    id: 1,
    customer_id: 10,
    total_amount: { toString: () => '150.00' },
    due_date: new Date('2026-06-30'),
    paid_at: null,
    issue_date: new Date(),
    nota_fiscal_path: null,
    created_at: new Date(),
    customer: { id: 10, name: 'JOAO SILVA', cpf: '12345678900' },
    receivable_payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillsService,
        {
          provide: BillsRepository,
          useValue: {
            findById: jest.fn(),
            createBoleto: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            setNotaFiscal: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(BillsService);
    repo = module.get(BillsRepository);
  });

  it('calls repo.createBoleto and returns result with paid_at null', async () => {
    repo.createBoleto.mockResolvedValue(mockBill as any);
    const result = await service.createBoleto({ customer_id: 10, total_amount: 150, due_date: '2026-06-30' });
    expect(repo.createBoleto).toHaveBeenCalledWith({ customer_id: 10, total_amount: 150, due_date: '2026-06-30' });
    expect(result.paid_at).toBeNull();
  });
});
