import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: {
        instructors: true,
        students: true,
        partners: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        instructors: true,
        students: true,
        partners: true,
        flights: {
          orderBy: { start_date: 'desc' },
          take: 10,
          include: {
            plane: true,
          },
        },
        receivables: {
          orderBy: {
            created_at: 'desc',
          },
          take: 10,
        },
      },
    });
  }

  findByCpf(cpf: string) {
    return this.prisma.customer.findUnique({ where: { cpf } });
  }

  findByEmail(email: string) {
    return this.prisma.customer.findUnique({ where: { email } });
  }

  create(data: Prisma.CustomerCreateInput) {
    return this.prisma.customer.create({
      data,
      include: { instructors: true, students: true, partners: true },
    });
  }

  update(id: number, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({
      where: { id },
      data,
      include: { instructors: true, students: true, partners: true },
    });
  }
}
