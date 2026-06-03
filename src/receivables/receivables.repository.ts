import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client-runtime-utils';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { Recurrence } from './enums/recurrence.enum';

export interface RegisterPaymentInput {
  amount_received: number;
  payment_method?: string;
  payment_date?: string;
  use_credit?: boolean;
}

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

@Injectable()
export class ReceivablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string, search?: string, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20) {
    const now = new Date();
    const AND: Prisma.ReceivableWhereInput[] = [];

    if (status === '1') {
      AND.push({ status: 1 });
    } else if (status === '0') {
      AND.push({ status: 0, amount_received: { lte: 0 }, expiration_date: { gte: now } });
    } else if (status === 'partial') {
      AND.push({ status: 0, amount_received: { gt: 0 } });
    } else if (status === 'overdue') {
      AND.push({ status: 0, amount_received: { lte: 0 }, expiration_date: { lt: now } });
    }

    if (search) {
      AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = endOfDay(dateTo);
      AND.push({ created_at: range });
    }

    const where = AND.length > 0 ? { AND } : undefined;
    const skip = (page - 1) * limit;
    const include = {
      customer: true,
      company: true,
      flight: { include: { plane: true } },
      plane: true,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.receivable.findMany({ where, orderBy: { created_at: 'desc' }, include, skip, take: limit }),
      this.prisma.receivable.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number) {
    return this.prisma.receivable.findUnique({
      where: { id },
      include: {
        customer: true,
        company: true,
        flight: { include: { plane: true, customer: true } },
        instructor: { include: { customer: true } },
        plane: true,
        partner: { include: { customer: true } },
        employee: { include: { customer: true } },
        payments: { orderBy: { payment_date: 'desc' } },
      },
    });
  }

  create(dto: CreateReceivableDto) {
    const { client_id, company_id, bill_id, plane_id, flight_id, instructor_id, partner_id, employee_id, expiration_date, recurrence, occurrences, ...fields } = dto;

    const include = {
      customer: true, company: true,
      flight: { include: { plane: true } }, plane: true,
    };
    const relations = {
      ...(client_id && { customer: { connect: { id: client_id } } }),
      ...(company_id && { company: { connect: { id: company_id } } }),
      ...(bill_id && { bill: { connect: { id: bill_id } } }),
      ...(plane_id && { plane: { connect: { id: plane_id } } }),
      ...(flight_id && { flight: { connect: { id: flight_id } } }),
      ...(instructor_id && { instructor: { connect: { id: instructor_id } } }),
      ...(partner_id && { partner: { connect: { id: partner_id } } }),
      ...(employee_id && { employee: { connect: { id: employee_id } } }),
    };

    if (!recurrence) {
      return this.prisma.receivable.create({
        data: { ...fields, ...(expiration_date && { expiration_date: new Date(expiration_date) }), ...relations },
        include,
      });
    }

    const dates = Array.from({ length: occurrences! }, (_, i) => {
      const d = new Date(expiration_date!);
      if (recurrence === Recurrence.Weekly) d.setDate(d.getDate() + i * 7);
      else if (recurrence === Recurrence.Monthly) d.setMonth(d.getMonth() + i);
      else d.setFullYear(d.getFullYear() + i);
      return d;
    });

    return this.prisma.$transaction(
      dates.map((date, i) =>
        this.prisma.receivable.create({
          data: {
            ...fields,
            expiration_date: date,
            title: `${fields.title} (${i + 1}/${occurrences})`,
            ...relations,
          },
          include,
        }),
      ),
    );
  }

  update(id: number, dto: UpdateReceivableDto) {
    const { company_id, bill_id, plane_id, flight_id, instructor_id, partner_id, employee_id, expiration_date, ...fields } = dto;
    return this.prisma.receivable.update({
      where: { id },
      data: {
        ...fields,
        ...(expiration_date && { expiration_date: new Date(expiration_date) }),
        ...(company_id !== undefined && {
          company: company_id ? { connect: { id: company_id } } : { disconnect: true },
        }),
        ...(bill_id !== undefined && {
          bill: bill_id ? { connect: { id: bill_id } } : { disconnect: true },
        }),
        ...(plane_id !== undefined && {
          plane: plane_id ? { connect: { id: plane_id } } : { disconnect: true },
        }),
        ...(flight_id !== undefined && {
          flight: flight_id ? { connect: { id: flight_id } } : { disconnect: true },
        }),
        ...(instructor_id !== undefined && {
          instructor: instructor_id ? { connect: { id: instructor_id } } : { disconnect: true },
        }),
        ...(partner_id !== undefined && {
          partner: partner_id ? { connect: { id: partner_id } } : { disconnect: true },
        }),
        ...(employee_id !== undefined && {
          employee: employee_id ? { connect: { id: employee_id } } : { disconnect: true },
        }),
      },
      include: {
        customer: true, company: true,
        flight: { include: { plane: true, customer: true } }, plane: true,
      },
    });
  }

  delete(id: number) {
    return this.prisma.receivable.delete({ where: { id } });
  }

  async deletePayment(paymentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.receivablePayment.findUnique({ where: { id: paymentId } });
      if (!payment) return null;

      const receivable = await tx.receivable.findUnique({ where: { id: payment.receivable_id } });
      if (receivable) {
        const newAmountReceived = receivable.amount_received.sub(payment.amount_received);
        await tx.receivable.update({
          where: { id: receivable.id },
          data: {
            amount_received: newAmountReceived.lte(0) ? 0 : newAmountReceived,
            status: 0,
          },
        });

        if (receivable.product === 'credito' && receivable.client_id && payment.payment_method !== 'Credit') {
          await tx.person.update({
            where: { id: receivable.client_id },
            data: { credit_balance: { decrement: payment.amount_received.toNumber() } },
          });
        }
      }

      return tx.receivablePayment.delete({ where: { id: paymentId } });
    });
  }

  findPaymentById(paymentId: number) {
    return this.prisma.receivablePayment.findUnique({ where: { id: paymentId } });
  }

  setPaymentNotaFiscal(paymentId: number, path: string | null) {
    return this.prisma.receivablePayment.update({
      where: { id: paymentId },
      data: { nota_fiscal_path: path },
    });
  }

  async registerPayment(receivableId: number, dto: RegisterPaymentInput) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.receivable.findUnique({ where: { id: receivableId } });

      if (!receivable) throw new NotFoundException(`Receivable ${receivableId} not found`);
      if (receivable.status === 1) throw new BadRequestException('Receivable is already settled');

      const paymentDate = dto.payment_date ? new Date(dto.payment_date) : new Date();
      let outstanding = receivable.total_amount.sub(receivable.amount_received);
      let totalApplied = new Decimal(0);

      if (dto.use_credit && receivable.client_id) {
        const customer = await tx.person.findUnique({
          where: { id: receivable.client_id },
          select: { credit_balance: true },
        });
        const creditAvailable = customer?.credit_balance ?? new Decimal(0);
        const creditToApply = Decimal.min(creditAvailable, outstanding);

        if (creditToApply.gt(0)) {
          await tx.person.update({
            where: { id: receivable.client_id },
            data: { credit_balance: { decrement: creditToApply.toNumber() } },
          });
          await tx.receivablePayment.create({
            data: {
              receivable: { connect: { id: receivableId } },
              amount_received: creditToApply,
              payment_method: 'Credit',
              payment_date: paymentDate,
            },
          });
          totalApplied = totalApplied.add(creditToApply);
          outstanding = outstanding.sub(creditToApply);
        }
      }

      let cashPayment: Awaited<ReturnType<typeof tx.receivablePayment.create>> | null = null;
      const cashAmount = new Decimal(dto.amount_received);
      if (cashAmount.gt(0)) {
        const cashToApply = Decimal.min(cashAmount, outstanding);
        totalApplied = totalApplied.add(cashToApply);
        cashPayment = await tx.receivablePayment.create({
          data: {
            receivable: { connect: { id: receivableId } },
            amount_received: cashAmount,
            payment_method: dto.payment_method,
            payment_date: paymentDate,
          },
        });
      }

      const newAmountReceived = receivable.amount_received.add(totalApplied);
      const newStatus = newAmountReceived.gte(receivable.total_amount) ? 1 : 0;

      await tx.receivable.update({
        where: { id: receivableId },
        data: { amount_received: newAmountReceived, status: newStatus },
      });

      if (receivable.product === 'credito' && receivable.client_id && cashAmount.gt(0)) {
        await tx.person.update({
          where: { id: receivable.client_id },
          data: { credit_balance: { increment: cashAmount.toNumber() } },
        });
      }

      return {
        payment: cashPayment,
        status: newStatus === 1 ? 'paid' : 'partial',
      };
    });
  }
}
