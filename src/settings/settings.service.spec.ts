import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FakeSettingsRepository } from './repository/settings/fake-settings.repository';
import {
  ISettingsRepository,
  SETTINGS_REPOSITORY,
} from './repository/settings/settings-repository.interface';
import { FakeSicoobSettingsRepository } from './repository/sicoob/fake-sicoob-settings.repository';
import {
  ISicoobSettingsRepository,
  SICOOB_SETTINGS_REPOSITORY,
} from './repository/sicoob/sicoob-settings-repository.interface';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let settingsService: SettingsService;
  let settingsRepository: ISettingsRepository;
  let sicoobSettingsRepository: ISicoobSettingsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SETTINGS_REPOSITORY,
          useClass: FakeSettingsRepository,
        },
        {
          provide: SICOOB_SETTINGS_REPOSITORY,
          useClass: FakeSicoobSettingsRepository,
        },
      ],
    }).compile();
    settingsService = module.get(SettingsService);
    settingsRepository = module.get<ISettingsRepository>(SETTINGS_REPOSITORY);
    sicoobSettingsRepository = module.get<ISicoobSettingsRepository>(
      SICOOB_SETTINGS_REPOSITORY,
    );
  });

  it('get returns settings when configured', async () => {
    const settings = await settingsRepository.upsert({
      instructor_percentage: 0,
      glider_initial_minutes: 0,
      glider_initial_value: 0,
      glider_minute_value: 0,
    });

    expect(await settingsService.getSettings()).toEqual(settings);
  });

  it('get throws NotFoundException when not configured', async () => {
    await expect(settingsService.getSettings()).rejects.toThrow(
      NotFoundException,
    );
  });

  it('get returns Sicoob settings when configured', async () => {
    const settings = await sicoobSettingsRepository.upsert({
      cooperative_prefix: '',
      cooperative_digit: '',
      branch: '',
      account: '',
      account_digit: '',
      wallet: '',
      modality: '',
      cnpj: '',
      company_name: '',
      interest_rate: 0,
      interest_period: 0,
      interest_type: '2',
    });

    expect(await settingsService.getSicoobSettings()).toEqual(settings);
  });

  it('get throws NotFoundException when Sicoob not configured', async () => {
    await expect(settingsService.getSicoobSettings()).rejects.toThrow(
      NotFoundException,
    );
  });
});
