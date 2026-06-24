import { EStakeholder } from '@common/enums/stakeholder.enum';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { endOfDay, startOfDay } from 'date-fns';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePeopleDto } from '../../dto/create-people.dto';
import { FindAllPeoplesDto } from '../../dto/find-all-peoples.dto';
import { UpdatePeopleDto } from '../../dto/update-people.dto';
import { People } from '../../model/people.model';
import {
  IPeoplesRepository,
  PeopleStats,
} from './peoples-repository.interface';

const peopleInclude = {
  address: true,
  instructors: true,
  students: true,
  partners: true,
  employees: true,
} satisfies Prisma.PeopleInclude;

const peopleDetailInclude = {
  address: true,
  instructors: true,
  students: true,
  partners: true,
  employees: true,
  receivables: { orderBy: { created_at: 'desc' } },
} satisfies Prisma.PeopleInclude;

@Injectable()
export class PeoplesRepository implements IPeoplesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    search,
    category,
    date_from,
    date_to,
    page = 1,
    limit = 20,
  }: FindAllPeoplesDto) {
    const AND: Prisma.PeopleWhereInput[] = [];

    if (search) {
      AND.push({
        OR: [
          { cpf: { contains: search } },
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category === 'instructor') AND.push({ instructors: { isNot: null } });
    else if (category === 'student') AND.push({ students: { isNot: null } });
    else if (category === 'partner') AND.push({ partners: { isNot: null } });
    else if (category === 'employee') AND.push({ employees: { isNot: null } });

    if (date_from || date_to) {
      const range: Prisma.DateTimeFilter = {};
      if (date_from) range.gte = startOfDay(date_from);
      if (date_to) range.lte = endOfDay(date_to);
      AND.push({ created_at: range });
    }

    const where: Prisma.PeopleWhereInput = AND.length > 0 ? { AND } : {};

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.people.findMany({
        where,
        orderBy: { name: 'asc' },
        include: peopleInclude,
        skip,
        take: limit,
      }),
      this.prisma.people.count({ where: where }),
    ]);

    return {
      data: data.map((item) => plainToInstance(People, item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const raw = await this.prisma.people.findUnique({
      where: { id },
      include: peopleDetailInclude,
    });

    return raw ? plainToInstance(People, raw) : null;
  }

  async findByCpf(cpf: string) {
    const raw = await this.prisma.people.findUnique({ where: { cpf } });
    return raw ? plainToInstance(People, raw) : null;
  }

  async findByEmail(email: string) {
    const raw = await this.prisma.people.findUnique({ where: { email } });
    return raw ? plainToInstance(People, raw) : null;
  }

  async create({
    instructor,
    student,
    partner,
    employee,
    street,
    neighborhood,
    city,
    state,
    zip_code,
    ...dto
  }: CreatePeopleDto) {
    const addressFields = { street, neighborhood, city, state, zip_code };
    const hasAddress = Object.values(addressFields).some((v) => v !== undefined);

    const raw = await this.prisma.people.create({
      data: {
        cpf: dto.cpf,
        name: dto.name,
        email: dto.email,
        phone_number: dto.phone_number,
        ...(hasAddress && { address: { create: addressFields } }),
        ...(instructor && { instructors: { create: instructor } }),
        ...(student && { students: { create: student } }),
        ...(partner && { partners: { create: partner } }),
        ...(employee && { employees: { create: employee } }),
      },
      include: peopleInclude,
    });

    return plainToInstance(People, raw);
  }

  async update(
    id: number,
    {
      instructor,
      student,
      partner,
      employee,
      street,
      neighborhood,
      city,
      state,
      zip_code,
      ...dto
    }: UpdatePeopleDto,
  ) {
    const existing = await this.prisma.people.findUnique({
      where: { id },
      select: {
        instructors: { select: { id: true } },
        students: { select: { id: true } },
        partners: { select: { id: true } },
        employees: { select: { id: true } },
      },
    });

    const data: Prisma.PeopleUpdateInput = { ...dto };

    const addressFields = { street, neighborhood, city, state, zip_code };
    const hasAddress = Object.values(addressFields).some(
      (v) => v !== undefined,
    );
    if (hasAddress) {
      data.address = {
        upsert: {
          create: addressFields,
          update: addressFields,
        },
      };
    }

    if (student !== undefined) {
      const e = existing?.students;
      data.students = e
        ? { update: { where: { id: e.id }, data: student } }
        : { create: student };
    }

    if (partner !== undefined) {
      const e = existing?.partners;
      data.partners = e
        ? { update: { where: { id: e.id }, data: partner } }
        : { create: partner };
    }

    if (instructor !== undefined) {
      const e = existing?.instructors;
      data.instructors = e
        ? { update: { where: { id: e.id }, data: instructor } }
        : { create: instructor };
    }

    if (employee !== undefined) {
      const e = existing?.employees;
      data.employees = e
        ? { update: { where: { id: e.id }, data: employee } }
        : { create: employee };
    }

    const raw = await this.prisma.people.update({
      where: { id },
      data,
      include: peopleInclude,
    });

    return plainToInstance(People, raw);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.people.delete({ where: { id } });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const count = await this.prisma.people.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length)
      throw new UnprocessableEntityException(
        'Um ou mais registros não foram encontrados',
      );
    await this.prisma.people.deleteMany({ where: { id: { in: ids } } });
  }

  async getStats(): Promise<PeopleStats> {
    const [received, paid, hours, flightCount] = await Promise.all([
      this.prisma.receivable.aggregate({
        _sum: { amount_received: true },
        where: { stakeholder: EStakeholder.PEOPLE },
      }),
      this.prisma.payable.aggregate({ _sum: { amount_paid: true } }),
      this.prisma.flight.aggregate({ _sum: { total_hours: true } }),
      this.prisma.flight.count(),
    ]);

    return {
      total_received: Number(received._sum.amount_received ?? 0),
      total_paid: Number(paid._sum.amount_paid ?? 0),
      total_hours: Number(hours._sum.total_hours ?? 0),
      total_flights: flightCount,
    };
  }
}
