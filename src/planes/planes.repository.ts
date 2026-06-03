import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

function endOfDay(d: Date): Date { d.setHours(23, 59, 59, 999); return d; }

@Injectable()
export class PlanesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, dateFrom?: Date, dateTo?: Date, search?: string, aircraftType?: string) {
    const AND: Prisma.PlaneWhereInput[] = [];
    if (search) {
      AND.push({
        OR: [
          { registration: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (dateFrom || dateTo) {
      AND.push({ created_at: { ...(dateFrom && { gte: dateFrom }), ...(dateTo && { lte: endOfDay(dateTo) }) } });
    }
    if (aircraftType) {
      AND.push({ aircraft_type: aircraftType });
    }
    const where: Prisma.PlaneWhereInput = AND.length > 0 ? { AND } : {};
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.plane.findMany({ where, orderBy: { registration: 'asc' }, skip, take: limit }),
      this.prisma.plane.count({ where }),
    ]);
    return { data, total };
  }

  findById(id: number) {
    return this.prisma.plane.findUnique({
      where: { id },
      include: {
        flights: {
          where: { end_date: { not: null } },
          orderBy: { start_date: 'desc' },
          take: 10,
          include: {
            customer: true,
            instructor: { include: { customer: true } },
          },
        },
        payables: {
          orderBy: { created_at: 'desc' },
        },
        receivables: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  findByRegistration(registration: string) {
    return this.prisma.plane.findUnique({ where: { registration } });
  }

  create(data: Prisma.PlaneCreateInput) {
    return this.prisma.plane.create({ data });
  }

  update(id: number, data: Prisma.PlaneUpdateInput) {
    return this.prisma.plane.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.plane.delete({ where: { id } });
  }
}
