import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { UpsertSettingsDto } from './dto/upsert-settings.dto';
import { UpsertSicoobSettingsDto } from './dto/upsert-sicoob-settings.dto';
import {
  ISettingsRepository,
  SETTINGS_REPOSITORY,
} from './repository/settings/settings-repository.interface';
import {
  ISicoobSettingsRepository,
  SICOOB_SETTINGS_REPOSITORY,
} from './repository/sicoob/sicoob-settings-repository.interface';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(SETTINGS_REPOSITORY)
    private readonly settingsRepository: ISettingsRepository,

    @Inject(SICOOB_SETTINGS_REPOSITORY)
    private readonly sicoobSettingsRepository: ISicoobSettingsRepository,
  ) {}

  async getSettings() {
    const settings = await this.settingsRepository.find();

    if (!settings)
      throw new NotFoundException('Configurações ainda não definidas');

    return settings;
  }

  upsertSettings(dto: UpsertSettingsDto) {
    return this.settingsRepository.upsert(dto);
  }

  async getSicoobSettings() {
    const sicoobSettings = await this.sicoobSettingsRepository.find();

    if (!sicoobSettings)
      throw new NotFoundException(
        'Configurações do Sicoob ainda não definidas',
      );

    return sicoobSettings;
  }

  upsertSicoobSettings(dto: UpsertSicoobSettingsDto) {
    return this.sicoobSettingsRepository.upsert(dto);
  }
}
