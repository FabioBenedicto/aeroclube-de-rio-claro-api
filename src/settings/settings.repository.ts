import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  find() {
    return this.prisma.settings.findUnique({ where: { id: 1 } });
  }

  upsert(dto: UpsertSettingsDto) {
    const base = {
      instructor_percentage: dto.instructor_percentage ?? 0,
      partner_monthly_dues: dto.partner_monthly_dues ?? 0,
      glider_initial_minutes: dto.glider_initial_minutes ?? 45,
      glider_initial_value: dto.glider_initial_value ?? 330,
      glider_minute_value: dto.glider_minute_value ?? 3,
    };

    const sicoob = {
      ...(dto.sicoob_cooperativa_prefix !== undefined && { sicoob_cooperativa_prefix: dto.sicoob_cooperativa_prefix }),
      ...(dto.sicoob_cooperativa_dv !== undefined && { sicoob_cooperativa_dv: dto.sicoob_cooperativa_dv }),
      ...(dto.sicoob_conta !== undefined && { sicoob_conta: dto.sicoob_conta }),
      ...(dto.sicoob_conta_dv !== undefined && { sicoob_conta_dv: dto.sicoob_conta_dv }),
      ...(dto.sicoob_carteira !== undefined && { sicoob_carteira: dto.sicoob_carteira }),
      ...(dto.sicoob_modalidade !== undefined && { sicoob_modalidade: dto.sicoob_modalidade }),
      ...(dto.sicoob_cnpj !== undefined && { sicoob_cnpj: dto.sicoob_cnpj }),
      ...(dto.sicoob_nome_empresa !== undefined && { sicoob_nome_empresa: dto.sicoob_nome_empresa }),
    };

    const data: Prisma.SettingsUpdateInput = { ...base, ...sicoob };

    return this.prisma.settings.upsert({
      where: { id: 1 },
      create: { id: 1, ...base, ...sicoob },
      update: data,
    });
  }

  incrementRemessaSequence() {
    return this.prisma.settings.update({
      where: { id: 1 },
      data: { sicoob_remessa_sequence: { increment: 1 } },
    });
  }
}
