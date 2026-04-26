import { Injectable, ConflictException } from '@nestjs/common';
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

  async create(data: Prisma.CustomerCreateInput) {
    try {
      return await this.prisma.customer.create({
        data,
        include: { instructors: true, students: true, partners: true },
      });
    } catch (err) {
      this.handleUniqueViolation(err);
      throw err;
    }
  }

  async update(id: number, data: Prisma.CustomerUpdateInput) {
    try {
      return await this.prisma.customer.update({
        where: { id },
        data,
        include: { instructors: true, students: true, partners: true },
      });
    } catch (err) {
      this.handleUniqueViolation(err);
      throw err;
    }
  }

  private handleUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const fields = (err.meta?.target as string[]) ?? [];
      if (fields.includes('cpf')) throw new ConflictException('CPF já cadastrado');
      if (fields.includes('email')) throw new ConflictException('E-mail já cadastrado');
      throw new ConflictException('Dado duplicado');
    }
  }
}
