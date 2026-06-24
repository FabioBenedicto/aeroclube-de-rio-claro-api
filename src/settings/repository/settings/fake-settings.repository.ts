import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { UpsertSettingsDto } from '../../dto/upsert-settings.dto';
import { Settings } from '../../model/settings.model';
import { ISettingsRepository } from './settings-repository.interface';

const defaultSettings = {
  id: 1,
  instructor_percentage: 0,
  glider_initial_minutes: 0,
  glider_initial_value: 0,
  glider_minute_value: 0,
};

@Injectable()
export class FakeSettingsRepository implements ISettingsRepository {
  settings: Settings | null = null;

  async find() {
    return this.settings;
  }

  async upsert(dto: UpsertSettingsDto) {
    const base = this.settings ?? defaultSettings;

    this.settings = plainToInstance(Settings, { ...base, ...dto });

    return this.settings;
  }
}
