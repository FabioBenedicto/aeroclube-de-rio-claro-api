import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client-runtime-utils';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';
import { Recurrence } from './enums/recurrence.enum';

const include = {
  customer: true,
  company: true,
  instructor: { include: { customer: true } },
  plane: true,
  partner: { include: { customer: true } },
  employee: { include: { customer: true } },
  payments: { orderBy: { paid_at: 'desc' as const } },
};

function endOfDay(d: Date): Date {
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return end;
}

@Injectable()
export class PayablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string, clientId?: number, search?: string, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20) {
    const AND: Prisma.PayableWhereInput[] = [];
    if (status) AND.push({ status });
    if (clientId) AND.push({ client_id: clientId });
    if (search) AND.push({ title: { contains: search, mode: 'insensitive' } });
    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeNullableFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) range.lte = endOfDay(dateTo);
      AND.push({ due_date: range });
    }
    const where = AND.length > 0 ? { AND } : undefined;
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payable.findMany({ where, orderBy: { created_at: 'desc' }, include, skip, take: limit }),
      this.prisma.payable.count({ where }),
    ]);
    return { data, total };
  }

  findById(id: number) {
    return this.prisma.payable.findUnique({ where: { id }, include });
  }

  create(dto: CreatePayableDto) {
    const { client_id, company_id, instructor_id, plane_id, partner_id, employee_id, recurrence, occurrences, due_date, ...fields } = dto;

    const relations = {
      ...(client_id && { customer: { connect: { id: client_id } } }),
      ...(company_id && { company: { connect: { id: company_id } } }),
      ...(instructor_id && { instructor: { connect: { id: instructor_id } } }),
      ...(plane_id && { plane: { connect: { id: plane_id } } }),
      ...(partner_id && { partner: { connect: { id: partner_id } } }),
      ...(employee_id && { employee: { connect: { id: employee_id } } }),
    };

    if (!recurrence) {
      return this.prisma.payable.create({
        data: { ...fields, ...(due_date && { due_date }), ...relations },
        include,
      });
    }

    const dates = Array.from({ length: occurrences! }, (_, i) => {
      if (!due_date) return undefined;
      const d = new Date(due_date);
      if (recurrence === Recurrence.Weekly) d.setDate(d.getDate() + i * 7);
      else if (recurrence === Recurrence.Monthly) d.setMonth(d.getMonth() + i);
      else d.setFullYear(d.getFullYear() + i);
      return d;
    });

    return this.prisma.$transaction(
      dates.map((due, i) =>
        this.prisma.payable.create({
          data: {
            ...fields,
            ...(due && { due_date: due }),
            title: `${fields.title} (${i + 1}/${occurrences})`,
            ...relations,
          },
          include,
        }),
      ),
    );
  }

  update(id: number, dto: UpdatePayableDto) {
    const { client_id, company_id, instructor_id, plane_id, partner_id, employee_id, ...rest } = dto;
    return this.prisma.payable.update({
      where: { id },
      data: {
        ...rest,
        ...(client_id !== undefined && {
          customer: client_id ? { connect: { id: client_id } } : { disconnect: true },
        }),
        ...(company_id !== undefined && {
          company: company_id ? { connect: { id: company_id } } : { disconnect: true },
        }),
        ...(instructor_id !== undefined && {
          instructor: instructor_id ? { connect: { id: instructor_id } } : { disconnect: true },
        }),
        ...(plane_id !== undefined && {
          plane: plane_id ? { connect: { id: plane_id } } : { disconnect: true },
        }),
        ...(partner_id !== undefined && {
          partner: partner_id ? { connect: { id: partner_id } } : { disconnect: true },
        }),
        ...(employee_id !== undefined && {
          employee: employee_id ? { connect: { id: employee_id } } : { disconnect: true },
        }),
      },
      include,
    });
  }

  delete(id: number) {
    return this.prisma.payable.delete({ where: { id } });
  }

  async deletePayment(paymentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payablePayment.findUnique({ where: { id: paymentId } });
      if (!payment) return null;

      const payable = await tx.payable.findUnique({ where: { id: payment.payable_id } });
      if (payable) {
        const newPaid = payable.amount_paid.sub(payment.amount);
        const clamped = newPaid.lte(0) ? new Decimal(0) : newPaid;
        const status = clamped.lte(0) ? 'open' : 'partial';
        await tx.payable.update({
          where: { id: payable.id },
          data: { amount_paid: clamped, status },
        });
      }

      return tx.payablePayment.delete({ where: { id: paymentId } });
    });
  }

  findPaymentById(paymentId: number) {
    return this.prisma.payablePayment.findUnique({ where: { id: paymentId } });
  }

  setPaymentNotaFiscal(paymentId: number, path: string | null) {
    return this.prisma.payablePayment.update({
      where: { id: paymentId },
      data: { nota_fiscal_path: path },
    });
  }

  async registerPayment(id: number, dto: CreatePayablePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payable = await tx.payable.findUnique({ where: { id } });

      if (!payable)
        throw new NotFoundException(`Título a pagar ${id} não encontrado`);
      if (payable.status === 'paid')
        throw new BadRequestException('Título já está quitado');

      const newPaid = payable.amount_paid.add(new Decimal(dto.amount));
      const status = newPaid.gte(payable.amount) ? 'paid' : 'partial';

      await tx.payablePayment.create({
        data: {
          payable: { connect: { id } },
          amount: dto.amount,
          method: dto.method,
          notes: dto.notes,
          ...(dto.paid_at && { paid_at: new Date(dto.paid_at) }),
        },
      });

      return tx.payable.update({
        where: { id },
        data: { amount_paid: newPaid, status },
        include,
      });
    });
  }
}
