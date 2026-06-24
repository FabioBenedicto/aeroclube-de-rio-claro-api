import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PrismaService } from '../../../prisma/prisma.service';
import { UpsertSicoobSettingsDto } from '../../dto/upsert-sicoob-settings.dto';
import { SicoobSettings } from '../../model/sicoob-settings.model';
import { ISicoobSettingsRepository } from './sicoob-settings-repository.interface';

@Injectable()
export class SicoobSettingsRepository implements ISicoobSettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(): Promise<SicoobSettings | null> {
    const raw = await this.prisma.sicoobSettings.findUnique({
      where: { id: 1 },
    });

    return raw ? plainToInstance(SicoobSettings, raw) : null;
  }

  async upsert(dto: UpsertSicoobSettingsDto): Promise<SicoobSettings> {
    const raw = await this.prisma.sicoobSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...dto },
      update: dto,
    });

    return plainToInstance(SicoobSettings, raw);
  }

  async incrementRemittanceSequence(): Promise<SicoobSettings> {
    const raw = await this.prisma.sicoobSettings.upsert({
      where: { id: 1 },
      create: { id: 1, remittance_sequence: 1 },
      update: { remittance_sequence: { increment: 1 } },
    });

    return plainToInstance(SicoobSettings, raw);
  }
}
