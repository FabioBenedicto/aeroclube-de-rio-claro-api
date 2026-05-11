import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, category?: string, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20) {
    const AND: Prisma.CustomerWhereInput[] = [];

    if (search) {
      AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { cpf: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category === 'instrutor') AND.push({ instructors: { some: {} } });
    else if (category === 'aluno') AND.push({ students: { some: {} } });
    else if (category === 'socio') AND.push({ partners: { some: {} } });
    else if (category === 'funcionario') AND.push({ employees: { some: {} } });

    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = endOfDay(dateTo);
      AND.push({ created_at: range });
    }

    const where: Prisma.CustomerWhereInput = AND.length > 0 ? { AND } : {};

    const skip = (page - 1) * limit;
    const include = { instructors: true, students: true, partners: true, employees: true };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({ where, orderBy: { name: 'asc' }, include, skip, take: limit }),
      this.prisma.customer.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        instructors: {
          include: {
            receivables: {
              orderBy: { created_at: 'desc' },
              include: {
                customer: true,
                company: true,
                flight: { include: { plane: true } },
                instructor: { include: { customer: true } },
                plane: true,
              },
            },
          },
        },
        students: true,
        partners: true,
        employees: true,
        flights: {
          orderBy: { start_date: 'desc' },
          take: 10,
          include: { plane: true },
        },
        receivables: {
          orderBy: { created_at: 'desc' },
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
      include: { instructors: true, students: true, partners: true, employees: true },
    });
  }

  update(id: number, data: Prisma.CustomerUpdateInput) {
    return this.prisma.customer.update({
      where: { id },
      data,
      include: { instructors: true, students: true, partners: true, employees: true },
    });
  }

  async getCredits(customerId: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, credit_balance: true },
    });
    const movements = await this.prisma.receivablePayment.findMany({
      where: { payment_method: 'Crédito', receivable: { client_id: customerId } },
      orderBy: { payment_date: 'desc' },
    });
    return {
      customer_id: customerId,
      flight_hour_balance: Number(customer?.credit_balance ?? 0),
      movements,
    };
  }

  addCredit(customerId: number, amount: number) {
    return this.prisma.customer.update({
      where: { id: customerId },
      data: { credit_balance: { increment: amount } },
    });
  }

  delete(id: number) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
