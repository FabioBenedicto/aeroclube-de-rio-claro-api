import { Settings } from 'src/settings/model/settings.model';

import { UpsertSettingsDto } from '../../dto/upsert-settings.dto';

export interface ISettingsRepository {
  find(): Promise<Settings | null>;
  upsert(dto: UpsertSettingsDto): Promise<Settings>;
}

export const SETTINGS_REPOSITORY = Symbol('ISettingsRepository');
