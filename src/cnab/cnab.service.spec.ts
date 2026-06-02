import { Test } from '@nestjs/testing';
import { CnabService } from './cnab.service';
import { CnabRepository } from './cnab.repository';

describe('CnabService.generateRemessa', () => {
  let service: CnabService;
  let repo: jest.Mocked<CnabRepository>;

  const mockSettings = {
    sicoob_cooperativa_prefix: '0756',
    sicoob_cooperativa_dv: '0',
    sicoob_conta: '123456789012',
    sicoob_conta_dv: '0',
    sicoob_carteira: '1',
    sicoob_modalidade: '01',
    sicoob_cnpj: '12345678000190',
    sicoob_nome_empresa: 'AEROCLUBE',
    sicoob_remessa_sequence: 1,
  };

  const mockBill = {
    id: 1,
    total_amount: { toString: () => '100.00' },
    due_date: new Date('2026-06-30'),
    issue_date: new Date('2026-06-01'),
    customer: {
      cpf: '12345678900',
      name: 'JOAO SILVA',
      address: 'RUA A',
      neighborhood: 'CENTRO',
      city: 'RIO CLARO',
      state: 'SP',
      zip_code: '13500000',
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CnabService,
        {
          provide: CnabRepository,
          useValue: {
            getSettings: jest.fn(),
            findBillsByIds: jest.fn(),
            incrementRemessaSequence: jest.fn(),
            markBillsPendingCnab: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(CnabService);
    repo = module.get(CnabRepository);
  });

  it('chama markBillsPendingCnab com os ids dos bills após gerar remessa', async () => {
    repo.getSettings.mockResolvedValue(mockSettings as any);
    repo.findBillsByIds.mockResolvedValue([mockBill as any]);
    repo.incrementRemessaSequence.mockResolvedValue(mockSettings as any);
    repo.markBillsPendingCnab.mockResolvedValue(undefined as any);

    await service.generateRemessa({ bill_ids: [1] });

    expect(repo.markBillsPendingCnab).toHaveBeenCalledWith([1]);
  });

  it('lança UnprocessableEntityException se settings estiverem incompletos', async () => {
    repo.getSettings.mockResolvedValue(null);
    await expect(service.generateRemessa({ bill_ids: [1] })).rejects.toThrow(
      'Configurações Sicoob incompletas',
    );
  });
});
