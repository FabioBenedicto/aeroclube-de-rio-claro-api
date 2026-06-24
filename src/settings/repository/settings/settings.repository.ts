import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../../prisma/prisma.service';
import { UpsertSettingsDto } from '../../dto/upsert-settings.dto';
import { Settings } from '../../model/settings.model';
import { ISettingsRepository } from './settings-repository.interface';

@Injectable()
export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<Settings | null> {
    const raw = await this.prisma.settings.findUnique({ where: { id: 1 } });
    return raw ? plainToInstance(Settings, raw) : null;
  }

  async upsert(dto: UpsertSettingsDto): Promise<Settings> {
    const raw = await this.prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: dto,
    });

    return plainToInstance(Settings, raw);
  }
}
