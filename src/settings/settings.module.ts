import { Module } from '@nestjs/common';

import { SettingsRepository } from './repository/settings/settings.repository';
import { SETTINGS_REPOSITORY } from './repository/settings/settings-repository.interface';
import { SicoobSettingsRepository } from './repository/sicoob/sicoob-settings.repository';
import { SICOOB_SETTINGS_REPOSITORY } from './repository/sicoob/sicoob-settings-repository.interface';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController],
  providers: [
    SettingsService,
    {
      provide: SETTINGS_REPOSITORY,
      useClass: SettingsRepository,
    },
    {
      provide: SICOOB_SETTINGS_REPOSITORY,
      useClass: SicoobSettingsRepository,
    },
  ],
  exports: [SETTINGS_REPOSITORY, SICOOB_SETTINGS_REPOSITORY],
})
export class SettingsModule {}
