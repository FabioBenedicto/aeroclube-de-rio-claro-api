import { Injectable, NotFoundException } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly repo: SettingsRepository) {}

  async get() {
    const settings = await this.repo.find();
    if (!settings) throw new NotFoundException('Configurações ainda não definidas');
    return settings;
  }

  upsert(dto: UpsertSettingsDto) {
    return this.repo.upsert(dto);
  }
}
