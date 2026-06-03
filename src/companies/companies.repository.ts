import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20) {
    const AND: Prisma.CompanyWhereInput[] = [];
    if (search) {
      AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { cnpj: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = endOfDay(dateTo);
      AND.push({ created_at: range });
    }
    const where: Prisma.CompanyWhereInput = AND.length > 0 ? { AND } : {};
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.company.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      this.prisma.company.count({ where }),
    ]);
    return { data, total };
  }

  findById(id: number) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        receivables: { orderBy: { created_at: 'desc' } },
        payables: { orderBy: { created_at: 'desc' } },
      },
    });
  }

  create(data: Prisma.CompanyCreateInput) {
    return this.prisma.company.create({ data });
  }

  update(id: number, data: Prisma.CompanyUpdateInput) {
    return this.prisma.company.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.company.delete({ where: { id } });
  }
}
