import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client-runtime-utils';

interface RegisterFlightInput {
  flightData: Prisma.FlightCreateInput;
  buildReceivable?: (flightId: number) => Prisma.ReceivableCreateInput;
  buildPayable?: (flightId: number) => Prisma.PayableCreateInput;
}

interface CloseFlightInput {
  flightData: Prisma.FlightUpdateInput;
  buildReceivable?: () => Prisma.ReceivableCreateInput;
  buildPayable?: () => Prisma.PayableCreateInput;
}

interface UpdateFlightInput {
  flightData: Prisma.FlightUpdateInput;
  newTotalAmount?: Decimal;
  instructorPct?: Decimal;
  instructorId?: number | null;
}

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
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

  findSettings() {
    return this.prisma.settings.findUnique({ where: { id: 1 } });
  }

  async findAll(planeId?: number, customerId?: number, type?: string, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20, search?: string, instructorId?: number) {
    const AND: Prisma.FlightWhereInput[] = [];
    if (planeId) AND.push({ plane_id: planeId });
    if (customerId) AND.push({ customer_id: customerId });
    if (instructorId) AND.push({ instructor_id: instructorId });
    if (search) {
      AND.push({
        OR: [
          { plane: { registration: { contains: search, mode: 'insensitive' } } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }
    if (type) AND.push({ type: { contains: type, mode: 'insensitive' } });
    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = endOfDay(dateTo);
      AND.push({ start_date: range });
    }
    const where = AND.length > 0 ? { AND } : undefined;
    const skip = (page - 1) * limit;
    const include = { plane: true, customer: true, instructor: { include: { customer: true } } };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.flight.findMany({ where, orderBy: { start_date: 'desc' }, include, skip, take: limit }),
      this.prisma.flight.count({ where }),
    ]);
    return { data, total };
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

  async updateFlightAndRelations(id: number, input: UpdateFlightInput) {
    return this.prisma.$transaction(async (tx) => {
      const flight = await tx.flight.update({
        where: { id },
        data: input.flightData,
        include: { plane: true, customer: true, instructor: { include: { customer: true } } },
      });

      if (input.newTotalAmount !== undefined) {
        await tx.receivable.updateMany({
          where: { flight_id: id },
          data: { total_amount: input.newTotalAmount },
        });

        if (input.instructorId && input.instructorPct) {
          const instructorAmount = input.newTotalAmount
            .mul(input.instructorPct)
            .div(new Decimal(100));
          await tx.payable.updateMany({
            where: { title: `Instruction ${id}`, product: 'instrucao' },
            data: { amount: instructorAmount },
          });
        }
      }

      return flight;
    });
  }

  async closeFlight(id: number, input: CloseFlightInput) {
    return this.prisma.$transaction(async (tx) => {
      const flight = await tx.flight.update({
        where: { id },
        data: input.flightData,
        include: { plane: true, customer: true, instructor: { include: { customer: true } } },
      });

      if (input.buildReceivable) {
        await tx.receivable.create({ data: input.buildReceivable() });
      }

      if (input.buildPayable) {
        await tx.payable.create({ data: input.buildPayable() });
      }

      return flight;
    });
  }

  async hasReceivableWithPayments(flightId: number) {
    const receivable = await this.prisma.receivable.findFirst({
      where: { flight_id: flightId },
      include: { payments: { take: 1 } },
    });
    return (receivable?.payments.length ?? 0) > 0;
  }

  delete(id: number) {
    return this.prisma.flight.delete({ where: { id } });
  }
}
