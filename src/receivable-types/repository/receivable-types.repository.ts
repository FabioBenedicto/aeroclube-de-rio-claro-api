import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { ReceivableType } from '../model/receivable-type.model';
import { IReceivableTypesRepository } from './receivable-types-repository.interface';

@Injectable()
export class ReceivableTypesRepository implements IReceivableTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ReceivableType[]> {
    return this.prisma.receivableType.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: number): Promise<ReceivableType | null> {
    return this.prisma.receivableType.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<ReceivableType | null> {
    return this.prisma.receivableType.findUnique({ where: { name } });
  }

  create(name: string): Promise<ReceivableType> {
    return this.prisma.receivableType.create({ data: { name } });
  }

  update(id: number, name: string): Promise<ReceivableType> {
    return this.prisma.receivableType.update({ where: { id }, data: { name } });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.receivableType.delete({ where: { id } });
  }

  countUsages(id: number): Promise<number> {
    return this.prisma.receivable.count({ where: { receivable_type_id: id } });
  }
}
