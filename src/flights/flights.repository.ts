import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client-runtime-utils';

interface RegisterFlightInput {
  flightData: Prisma.FlightCreateInput;
  buildReceivable?: (flightId: number) => Prisma.ReceivableCreateInput;
  buildPayable?: (flightId: number) => Prisma.PayableCreateInput;
}

@Injectable()
export class FlightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerFlight(input: RegisterFlightInput) {
    return this.prisma.$transaction(async (tx) => {
      const flight = await tx.flight.create({
        data: input.flightData,
        include: { plane: true, customer: true, instructor: true },
      });

      if (input.buildReceivable) {
        await tx.receivable.create({ data: input.buildReceivable(flight.id) });
      }

      if (input.buildPayable) {
        await tx.payable.create({ data: input.buildPayable(flight.id) });
      }

      return flight;
    });
  }

  findPlane(id: number) {
    return this.prisma.plane.findUnique({ where: { id } });
  }

  findAll(status?: string) {
    return this.prisma.flight.findMany({
      where: status ? { status } : undefined,
      orderBy: { start_date: 'desc' },
      include: {
        plane: true,
        customer: true,
        instructor: { include: { customer: true } },
      },
    });
  }

  findById(id: number) {
    return this.prisma.flight.findUnique({
      where: { id },
      include: {
        plane: true,
        customer: true,
        instructor: { include: { customer: true } },
        receivables: true,
      },
    });
  }

  updateFlight(id: number, data: Prisma.FlightUpdateInput) {
    return this.prisma.flight.update({ where: { id }, data });
  }

  delete(id: number) {
    return this.prisma.flight.delete({ where: { id } });
  }
}
