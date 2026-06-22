import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { PayableType } from '../model/payable-type.model';
import { IPayableTypesRepository } from './payable-types-repository.interface';

@Injectable()
export class PayableTypesRepository implements IPayableTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<PayableType[]> {
    return this.prisma.payableType.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: number): Promise<PayableType | null> {
    return this.prisma.payableType.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<PayableType | null> {
    return this.prisma.payableType.findUnique({ where: { name } });
  }

  create(name: string): Promise<PayableType> {
    return this.prisma.payableType.create({ data: { name } });
  }

  update(id: number, name: string): Promise<PayableType> {
    return this.prisma.payableType.update({ where: { id }, data: { name } });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.payableType.delete({ where: { id } });
  }

  countUsages(id: number): Promise<number> {
    return this.prisma.payable.count({ where: { payable_type_id: id } });
  }
}
