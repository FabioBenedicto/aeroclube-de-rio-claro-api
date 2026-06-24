import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { BILLS_REPOSITORY } from '../bills/repository/bills-repository.interface';
import { FakeBillsRepository } from '../bills/repository/fake-bills.repository';
import { AZURE_BLOB_SERVICE } from '../common/providers/azure-blob/azure-blob.service.interface';
import { FakeAzureBlobService } from '../common/providers/azure-blob/fake-azure-blob.service';
import { FakeSicoobSettingsRepository } from '../settings/repository/sicoob/fake-sicoob-settings.repository';
import { SICOOB_SETTINGS_REPOSITORY } from '../settings/repository/sicoob/sicoob-settings-repository.interface';
import { CnabService } from './cnab.service';
import { CNAB_REPOSITORY } from './repository/cnab-repository.interface';
import { FakeCnabRepository } from './repository/fake-cnab.repository';

describe('CnabService', () => {
  let service: CnabService;
  let repo: FakeCnabRepository;
  let billsRepo: FakeBillsRepository;
  let sicoobSettings: FakeSicoobSettingsRepository;

  const mockSettings = {
    id: 1,
    cooperative_prefix: '0756',
    cooperative_digit: '0',
    account: '123456789012',
    account_digit: '0',
    wallet: '1',
    modality: '01',
    cnpj: '12345678000190',
    company_name: 'AEROCLUBE',
    remittance_sequence: 1,
    interest_rate: 0,
    interest_period: 0,
    interest_type: '2',
    branch: null,
  };

  const mockBill = {
    id: 1,
    total_amount: { toString: () => '100.00' },
    expiration_date: new Date(Date.UTC(2026, 6, 30)),
    People: {
      cpf: '12345678900',
      name: 'JOAO SILVA',
      address: {
        street: 'RUA A',
        neighborhood: 'CENTRO',
        city: 'RIO CLARO',
        state: 'SP',
        zip_code: '13500000',
      },
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CnabService,
        {
          provide: CNAB_REPOSITORY,
          useClass: FakeCnabRepository,
        },
        {
          provide: BILLS_REPOSITORY,
          useClass: FakeBillsRepository,
        },
        {
          provide: SICOOB_SETTINGS_REPOSITORY,
          useClass: FakeSicoobSettingsRepository,
        },
        {
          provide: AZURE_BLOB_SERVICE,
          useClass: FakeAzureBlobService,
        },
      ],
    }).compile();
    service = module.get(CnabService);
    repo = module.get<FakeCnabRepository>(CNAB_REPOSITORY);
    billsRepo = module.get<FakeBillsRepository>(BILLS_REPOSITORY);
    sicoobSettings = module.get<FakeSicoobSettingsRepository>(SICOOB_SETTINGS_REPOSITORY);
    repo.remessas = [];
    billsRepo.bills = [];
  });

  describe('generateRemessa', () => {
    it('saves file, calls saveRemessa and returns CnabRemessa', async () => {
      sicoobSettings.config = { ...mockSettings };
      billsRepo.bills = [mockBill as any];

      const result = await service.generateRemittent({ bill_ids: [1] });

      expect(result).toMatchObject({
        sequence_number: 1,
        bill_ids: [1],
        bill_count: 1,
      });
      expect(repo.remessas).toHaveLength(1);
    });

    it('marks bills as pending_cnab', async () => {
      sicoobSettings.config = { ...mockSettings };
      billsRepo.bills = [mockBill as any];
      await service.generateRemittent({ bill_ids: [1] });
      expect(billsRepo.bills[0].status).toBe('pending_cnab');
    });

    it('throws UnprocessableEntityException when settings are incomplete', async () => {
      sicoobSettings.config = null;
      await expect(
        service.generateRemittent({ bill_ids: [1] }),
      ).rejects.toThrow('Configurações do Sicoob incompletas');
    });
  });

  describe('downloadRemessa', () => {
    it('returns buffer and filename when remessa exists', async () => {
      repo.remessas = [
        {
          id: 1,
          sequence_number: 1,
          bill_ids: [],
          bill_count: 0,
          total_amount: 0,
          file_id: 1,
          file: {
            id: 1,
            blob_path: 'uploads/cnab/remessa_20260602_1.rem',
            original_name: 'remessa_20260602_1.rem',
            url: '',
            mime_type: 'application/octet-stream',
            size: 0,
            created_at: new Date(),
          },
          created_at: new Date(),
        },
      ];
      const result = await service.downloadRemessa(1);
      expect(result.filename).toBe('remessa_20260602_1.rem');
      expect(result.buffer).toBeDefined();
    });

    it('throws NotFoundException when remessa does not exist', async () => {
      await expect(service.downloadRemessa(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
