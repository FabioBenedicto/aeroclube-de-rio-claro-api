import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { endOfDay, startOfDay } from 'date-fns';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { FindAllCompaniesDto } from '../dto/find-all-companies.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../model/company.model';
import { ICompaniesRepository } from './companies-repository.interface';

const companyInclude = {
  receivables: { orderBy: { created_at: Prisma.SortOrder.desc } },
  payables: { orderBy: { created_at: Prisma.SortOrder.desc } },
};

@Injectable()
export class CompaniesRepository implements ICompaniesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    search,
    date_from,
    date_to,
    page = 1,
    limit = 20,
  }: FindAllCompaniesDto) {
    const AND: Prisma.CompanyWhereInput[] = [];

    if (search) {
      AND.push({
        OR: [
          { cnpj: { contains: search } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (date_from || date_to) {
      AND.push({
        created_at: {
          ...(date_from && { gte: startOfDay(date_from) }),
          ...(date_to && { lte: endOfDay(date_to) }),
        },
      });
    }

    const where: Prisma.CompanyWhereInput = AND.length > 0 ? { AND } : {};

    const skip = (page - 1) * limit;

    const args: Prisma.CompanyFindManyArgs = {
      where,
      orderBy: { name: Prisma.SortOrder.asc },
      skip,
      take: limit,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.company.findMany(args),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: data.map((item) => plainToInstance(Company, item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const raw = await this.prisma.company.findUnique({
      where: { id },
      include: companyInclude,
    });

    return raw ? plainToInstance(Company, raw) : null;
  }

  async findByCnpj(cnpj: string) {
    const raw = await this.prisma.company.findUnique({ where: { cnpj } });
    return raw ? plainToInstance(Company, raw) : null;
  }

  async findByEmail(email: string) {
    const raw = await this.prisma.company.findUnique({ where: { email } });
    return raw ? plainToInstance(Company, raw) : null;
  }

  async create(data: CreateCompanyDto) {
    const raw = await this.prisma.company.create({ data });
    return plainToInstance(Company, raw);
  }

  async update(id: number, data: UpdateCompanyDto) {
    const raw = await this.prisma.company.update({ where: { id }, data });
    return plainToInstance(Company, raw);
  }

  async delete(id: number) {
    await this.prisma.company.delete({ where: { id } });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const count = await this.prisma.company.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length)
      throw new UnprocessableEntityException(
        'Uma ou mais empresas não foram encontradas',
      );
    await this.prisma.company.deleteMany({ where: { id: { in: ids } } });
  }
}
