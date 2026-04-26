import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlanesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.plane.findMany({ orderBy: { registration: 'asc' } });
  }

  findById(id: number) {
    return this.prisma.plane.findUnique({
      where: { id },
      include: {
        flights: {
          where: { status: 'closed' },
          orderBy: { start_date: 'desc' },
          take: 10,
          include: { customer: true, instructor: { include: { customer: true } } },
        },
      },
    });
  }

  create(data: Prisma.PlaneCreateInput) {
    return this.prisma.plane.create({ data });
  }

  update(id: number, data: Prisma.PlaneUpdateInput) {
    return this.prisma.plane.update({ where: { id }, data });
  }
}
