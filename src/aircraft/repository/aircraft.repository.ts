import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { endOfDay, startOfDay } from 'date-fns';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateAircraftDto } from '../dto/create-aircraft.dto';
import { FindAllAircraftDto } from '../dto/find-all-aircraft.dto';
import { UpdateAircraftDto } from '../dto/update-aircraft.dto';
import { Aircraft } from '../model/aircraft.model';
import { IAircraftRepository } from './aircraft-repository.interface';

const titleStakeholderInclude = {
  people: true,
  company: true,
  instructor: {
    include: {
      people: true,
    },
  },
  partner: {
    include: {
      people: true,
    },
  },
  employee: {
    include: {
      people: true,
    },
  },
};

const aircraftInclude = {
  flights: {
    where: { end_date: { not: null } },
    orderBy: {
      start_date: Prisma.SortOrder.desc,
    },
    take: 10,
    include: {
      people: true,
      instructor: {
        include: { people: true },
      },
    },
  },
  payables: {
    orderBy: {
      created_at: Prisma.SortOrder.desc,
    },
    include: {
      payable_type: true,
      ...titleStakeholderInclude,
    },
  },
  receivables: {
    orderBy: {
      created_at: Prisma.SortOrder.desc,
    },
    include: {
      receivable_type: true,
      ...titleStakeholderInclude,
    },
  },
};

@Injectable()
export class AircraftRepository implements IAircraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    page = 1,
    limit = 20,
    date_from,
    date_to,
    search,
    aircraft_type,
  }: FindAllAircraftDto) {
    const AND: Prisma.AircraftWhereInput[] = [];

    if (search) {
      AND.push({
        OR: [
          { registration: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
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

    if (aircraft_type) {
      AND.push({ type: aircraft_type });
    }

    const where: Prisma.AircraftWhereInput = AND.length > 0 ? { AND } : {};

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.aircraft.findMany({
        where,
        orderBy: {
          registration: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.aircraft.count({ where }),
    ]);

    return {
      data: data.map((item) => plainToInstance(Aircraft, item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const raw = await this.prisma.aircraft.findUnique({
      where: { id },
      include: aircraftInclude,
    });

    if (!raw) return null;

    return plainToInstance(Aircraft, raw);
  }

  async findByRegistration(registration: string) {
    const raw = await this.prisma.aircraft.findUnique({
      where: {
        registration,
      },
    });

    return raw ? plainToInstance(Aircraft, raw) : null;
  }

  async create(data: CreateAircraftDto) {
    const raw = await this.prisma.aircraft.create({ data });
    return plainToInstance(Aircraft, raw);
  }

  async update(id: number, data: UpdateAircraftDto) {
    const raw = await this.prisma.aircraft.update({ where: { id }, data });
    return plainToInstance(Aircraft, raw);
  }

  async delete(id: number) {
    await this.prisma.aircraft.delete({ where: { id } });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const count = await this.prisma.aircraft.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length)
      throw new UnprocessableEntityException(
        'Uma ou mais aeronaves não foram encontradas',
      );
    await this.prisma.aircraft.deleteMany({ where: { id: { in: ids } } });
  }
}
