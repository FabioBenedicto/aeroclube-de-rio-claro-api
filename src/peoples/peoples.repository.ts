import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

@Injectable()
export class PeoplesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, category?: string, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20) {
    const AND: Prisma.PersonWhereInput[] = [];

    if (search) {
      AND.push({
        OR: [
          { name:  { contains: search, mode: 'insensitive' } },
          { cpf:   { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category === 'instructor') AND.push({ instructors: { some: {} } });
    else if (category === 'student')  AND.push({ students:    { some: {} } });
    else if (category === 'partner')  AND.push({ partners:    { some: {} } });
    else if (category === 'employee') AND.push({ employees:   { some: {} } });

    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo)   range.lte = endOfDay(dateTo);
      AND.push({ created_at: range });
    }

    const where: Prisma.PersonWhereInput = AND.length > 0 ? { AND } : {};
    const skip    = (page - 1) * limit;
    const include = { instructors: true, students: true, partners: true, employees: true };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.person.findMany({ where, orderBy: { name: 'asc' }, include, skip, take: limit }),
      this.prisma.person.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number) {
    return this.prisma.person.findUnique({
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
        students:  true,
        partners:  true,
        employees: true,
        flights: {
          orderBy: { start_date: 'desc' },
          take: 10,
          include: { plane: true },
        },
        receivables: { orderBy: { created_at: 'desc' } },
      },
    });
  }

  findByCpf(cpf: string) {
    return this.prisma.person.findUnique({ where: { cpf } });
  }

  findByEmail(email: string) {
    return this.prisma.person.findUnique({ where: { email } });
  }

  create(data: Prisma.PersonCreateInput) {
    return this.prisma.person.create({
      data,
      include: { instructors: true, students: true, partners: true, employees: true },
    });
  }

  update(id: number, data: Prisma.PersonUpdateInput) {
    return this.prisma.person.update({
      where: { id },
      data,
      include: { instructors: true, students: true, partners: true, employees: true },
    });
  }

  delete(id: number) {
    return this.prisma.person.delete({ where: { id } });
  }

  async getStats() {
    const [received, paid, hours, flightCount] = await Promise.all([
      this.prisma.receivable.aggregate({ _sum: { amount_received: true }, where: { payer_type: 'customer' } }),
      this.prisma.payable.aggregate({ _sum: { amount_paid: true } }),
      this.prisma.flight.aggregate({ _sum: { total_hours: true } }),
      this.prisma.flight.count(),
    ]);
    return {
      total_received: Number(received._sum.amount_received ?? 0),
      total_paid:     Number(paid._sum.amount_paid ?? 0),
      total_hours:    Number(hours._sum.total_hours ?? 0),
      total_flights:  flightCount,
    };
  }
}
