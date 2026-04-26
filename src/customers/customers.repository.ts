import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const INCLUDE_CATEGORIES = {
  instructors: true,
  students: true,
  partners: true,
};

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: INCLUDE_CATEGORIES,
    });
  }

  findById(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        ...INCLUDE_CATEGORIES,
        flights: { orderBy: { start_date: 'desc' }, take: 10, include: { plane: true } },
        receivables: { orderBy: { created_at: 'desc' }, take: 10 },
      },
    });
  }

  create(data: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({ data, include: INCLUDE_CATEGORIES });
  }

  update(id: number, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({ where: { id }, data, include: INCLUDE_CATEGORIES });
  }
}
