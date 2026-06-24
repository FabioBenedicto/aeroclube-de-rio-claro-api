import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CnabRemittent } from '../model/cnab-remittent.model';
import { ICnabRepository, SaveRemessaData } from './cnab-repository.interface';

const remittentInclude: Prisma.CnabRemessaInclude = {
  file: true,
};

type RemittentRaw = Prisma.CnabRemessaGetPayload<{
  include: typeof remittentInclude;
}>;

function toRemessa(raw: RemittentRaw): CnabRemittent {
  return plainToInstance(CnabRemittent, {
    ...raw,
    bill_ids: raw.bill_ids as number[],
    bills: [],
  });
}

@Injectable()
export class CnabRepository implements ICnabRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listRemittent(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.cnabRemessa.findMany({
        orderBy: { created_at: 'desc' },
        include: remittentInclude,
        skip,
        take: limit,
      }),
      this.prisma.cnabRemessa.count(),
    ]);

    return {
      data: data.map(toRemessa),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRemittent(id: number): Promise<CnabRemittent | null> {
    const raw = await this.prisma.cnabRemessa.findUnique({
      where: { id },
      include: remittentInclude,
    });

    return raw ? toRemessa(raw) : null;
  }

  async createRemittent(data: SaveRemessaData): Promise<CnabRemittent> {
    const raw = await this.prisma.$transaction(async (tx) => {
      const file = await tx.file.create({ data: data.file });

      return tx.cnabRemessa.create({
        data: {
          sequence_number: data.sequence_number,
          bill_ids: data.bill_ids,
          bill_count: data.bill_count,
          total_amount: data.total_amount,
          file: {
            connect: {
              id: file.id,
            },
          },
        },
        include: remittentInclude,
      });
    });

    return toRemessa(raw);
  }

  async deleteRemessa(id: number): Promise<void> {
    await this.prisma.cnabRemessa.delete({
      where: {
        id,
      },
    });
  }
}
