import { Test } from '@nestjs/testing';
import { CnabService } from './cnab.service';
import { CnabRepository } from './cnab.repository';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock-file')),
}));

describe('CnabService', () => {
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
    sicoob_juros: 0,
    sicoob_juros_prazo: 0,
    sicoob_agencia: null,
  };

  const mockBill = {
    id: 1,
    total_amount: { toString: () => '100.00' },
    due_date: new Date(Date.UTC(2026, 6, 30)),
    issue_date: new Date(Date.UTC(2026, 5, 1)),
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

  const mockRemessa = {
    id: 1,
    sequence_number: 1,
    bill_ids: [1],
    bill_count: 1,
    total_amount: 100,
    file_path: '/uploads/cnab/remessa_20260602_1.rem',
    created_at: new Date(),
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
            saveRemessa: jest.fn(),
            saveRetorno: jest.fn(),
            markBillPaid: jest.fn(),
            findRemessa: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(CnabService);
    repo = module.get(CnabRepository);
  });

  describe('generateRemessa', () => {
    it('saves file, calls saveRemessa and returns CnabRemessa', async () => {
      repo.getSettings.mockResolvedValue(mockSettings as any);
      repo.findBillsByIds.mockResolvedValue([mockBill as any]);
      repo.incrementRemessaSequence.mockResolvedValue(undefined as any);
      repo.markBillsPendingCnab.mockResolvedValue(undefined as any);
      repo.saveRemessa.mockResolvedValue(mockRemessa as any);

      const result = await service.generateRemessa({ bill_ids: [1] });

      expect(repo.saveRemessa).toHaveBeenCalledWith(
        expect.objectContaining({ sequence_number: 1, bill_ids: [1], bill_count: 1 }),
      );
      expect(result).toEqual(mockRemessa);
    });

    it('calls markBillsPendingCnab with the bill ids', async () => {
      repo.getSettings.mockResolvedValue(mockSettings as any);
      repo.findBillsByIds.mockResolvedValue([mockBill as any]);
      repo.incrementRemessaSequence.mockResolvedValue(undefined as any);
      repo.markBillsPendingCnab.mockResolvedValue(undefined as any);
      repo.saveRemessa.mockResolvedValue(mockRemessa as any);
      await service.generateRemessa({ bill_ids: [1] });
      expect(repo.markBillsPendingCnab).toHaveBeenCalledWith([1]);
    });

    it('throws UnprocessableEntityException when settings are incomplete', async () => {
      repo.getSettings.mockResolvedValue(null);
      await expect(service.generateRemessa({ bill_ids: [1] })).rejects.toThrow('Sicoob settings are incomplete');
    });
  });

  describe('downloadRemessa', () => {
    it('returns buffer and filename when remessa exists', async () => {
      repo.findRemessa.mockResolvedValue(mockRemessa as any);
      const result = await service.downloadRemessa(1);
      expect(result.filename).toBe('remessa_20260602_1.rem');
      expect(result.buffer).toBeDefined();
    });

    it('throws NotFoundException when remessa does not exist', async () => {
      repo.findRemessa.mockResolvedValue(null);
      await expect(service.downloadRemessa(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('processRetorno', () => {
    it('calls saveRetorno and returns retorno_id', async () => {
      const fakeRetorno = { id: 5, paid_count: 0, rejected_count: 0 };
      repo.saveRetorno.mockResolvedValue(fakeRetorno as any);
      const emptyContent = ['756' + '0000' + '0', '756' + '9999' + '9']
        .map(l => l.padEnd(240, ' ')).join('\r\n');
      const result = await service.processRetorno(Buffer.from(emptyContent));
      expect(result.retorno_id).toBe(5);
      expect(repo.saveRetorno).toHaveBeenCalled();
    });
  });
});
