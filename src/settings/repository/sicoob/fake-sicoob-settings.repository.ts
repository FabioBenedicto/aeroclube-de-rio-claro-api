import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UpsertSicoobSettingsDto } from '../../dto/upsert-sicoob-settings.dto';
import { SicoobSettings } from '../../model/sicoob-settings.model';
import { ISicoobSettingsRepository } from './sicoob-settings-repository.interface';

const defaultSicoobSettings = {
  id: 1,
  cooperative_prefix: null,
  cooperative_digit: null,
  branch: null,
  account: null,
  account_digit: null,
  wallet: null,
  modality: null,
  cnpj: null,
  company_name: null,
  remittance_sequence: 0,
  interest_rate: 0,
  interest_period: 0,
  interest_type: '2',
};

@Injectable()
export class FakeSicoobSettingsRepository implements ISicoobSettingsRepository {
  sicoobSettings: SicoobSettings | null = null;

  async find() {
    return this.sicoobSettings;
  }

  async upsert(dto: UpsertSicoobSettingsDto) {
    const base = this.sicoobSettings ?? defaultSicoobSettings;

    this.sicoobSettings = plainToInstance(SicoobSettings, { ...base, ...dto });

    return this.sicoobSettings;
  }

  async incrementRemittanceSequence() {
    if (!this.sicoobSettings) this.sicoobSettings = defaultSicoobSettings;

    this.sicoobSettings = plainToInstance(SicoobSettings, {
      ...this.sicoobSettings,
      remittance_sequence: this.sicoobSettings.remittance_sequence + 1,
    });

    return this.sicoobSettings;
  }
}
