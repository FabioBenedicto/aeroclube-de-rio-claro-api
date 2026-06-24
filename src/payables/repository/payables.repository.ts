import { ERecurrence } from '@common/enums/recurrence.enum';
import { EStakeholder } from '@common/enums/stakeholder.enum';
import { ETitleStatus } from '@common/enums/title-status.enum';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { plainToInstance } from 'class-transformer';
import { addMonths, addWeeks, addYears, endOfDay, startOfDay } from 'date-fns';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import {
  PayablePayment as PrismaPayablePayment,
  Prisma,
} from 'src/generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreatePayableDto } from '../dto/create-payable.dto';
import { CreatePayablePaymentDto } from '../dto/create-payable-payment.dto';
import { FindAllPayablesDto } from '../dto/find-all-payables.dto';
import { UpdatePayableDto } from '../dto/update-payable.dto';
import { Payable } from '../model/payable.model';
import { PayablePayment } from '../model/payable-payment.model';
import {
  IPayablesRepository,
  PayableStats,
} from './payables-repository.interface';

const include = {
  people: true,
  student: { include: { people: true } },
  company: true,
  aircraft: true,
  instructor: { include: { people: true } },
  partner: { include: { people: true } },
  employee: { include: { people: true } },
  flight: { select: { id: true, type: true, origin: true, destination: true, start_date: true } },
  payments: {
    orderBy: { payment_date: Prisma.SortOrder.desc },
    include: { file: true },
  },
  payable_type: true,
};

type PayableRaw = Prisma.PayableGetPayload<{ include: typeof include }>;

function toPayable(raw: PayableRaw): Payable {
  return plainToInstance(Payable, raw);
}

function toPayment(raw: PrismaPayablePayment): PayablePayment {
  return plainToInstance(PayablePayment, raw);
}

@Injectable()
export class PayablesRepository implements IPayablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere({
    status,
    person_id,
    instructor_id,
    employee_id,
    search,
    date_from,
    date_to,
  }: FindAllPayablesDto): Prisma.PayableWhereInput | undefined {
    const AND: Prisma.PayableWhereInput[] = [];

    if (status === ETitleStatus.OVERDUE) {
      AND.push({ status: { not: ETitleStatus.PAID } });
      AND.push({ expiration_date: { lt: new Date() } });
    } else if (status) {
      AND.push({ status });
    }

    if (person_id) AND.push({ people_id: person_id });
    if (instructor_id) AND.push({ instructor_id });
    if (employee_id) AND.push({ employee_id });

    if (search)
      AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { people: { name: { contains: search, mode: 'insensitive' } } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
          {
            instructor: {
              people: { name: { contains: search, mode: 'insensitive' } },
            },
          },
          {
            partner: {
              people: { name: { contains: search, mode: 'insensitive' } },
            },
          },
          {
            employee: {
              people: { name: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      });

    if (date_from || date_to) {
      const range: Prisma.DateTimeFilter = {};

      if (date_from) range.gte = startOfDay(date_from);
      if (date_to) range.lte = endOfDay(date_to);

      AND.push({ created_at: range });
    }

    return AND.length > 0 ? { AND } : undefined;
  }

  async findAll(dto: FindAllPayablesDto) {
    const { page = 1, limit = 20 } = dto;
    const where = this.buildWhere(dto);
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payable.findMany({
        where,
        orderBy: { created_at: 'desc' },
        include,
        skip,
        take: limit,
      }),
      this.prisma.payable.count({ where }),
    ]);

    return {
      data: data.map((p) => toPayable(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(dto: FindAllPayablesDto): Promise<PayableStats> {
    const where = this.buildWhere(dto);
    const aggregate = await this.prisma.payable.aggregate({
      where,
      _sum: { total_amount: true, amount_paid: true },
    });
    return {
      total_amount:
        aggregate._sum.total_amount != null
          ? Number(aggregate._sum.total_amount)
          : 0,
      amount_paid:
        aggregate._sum.amount_paid != null
          ? Number(aggregate._sum.amount_paid)
          : 0,
    };
  }

  async findById(id: number) {
    const payable = await this.prisma.payable.findUnique({
      where: { id },
      include,
    });

    return payable ? toPayable(payable) : null;
  }

  async create({
    person_id,
    student_id,
    company_id,
    plane_id,
    instructor_id,
    partner_id,
    employee_id,
    recurrence,
    occurrences,
    payable_type_id,
    ...dto
  }: CreatePayableDto) {
    const payerRelation = {
      [EStakeholder.PEOPLE]: { people: { connect: { id: person_id } } },
      [EStakeholder.STUDENT]: { student: { connect: { id: student_id } } },
      [EStakeholder.COMPANY]: { company: { connect: { id: company_id } } },
      [EStakeholder.INSTRUCTOR]: {
        instructor: { connect: { id: instructor_id } },
      },
      [EStakeholder.PARTNER]: { partner: { connect: { id: partner_id } } },
      [EStakeholder.EMPLOYEE]: { employee: { connect: { id: employee_id } } },
      [EStakeholder.NONE]: {},
    }[dto.stakeholder];

    const relations = {
      ...payerRelation,
      ...(plane_id && { aircraft: { connect: { id: plane_id } } }),
      ...(payable_type_id && {
        payable_type: { connect: { id: payable_type_id } },
      }),
    };

    if (recurrence) {
      const expiration_dates = Array.from({ length: occurrences }, (_, i) => {
        return {
          [ERecurrence.WEEKLY]: addWeeks(dto.expiration_date, i),
          [ERecurrence.MONTHLY]: addMonths(dto.expiration_date, i),
          [ERecurrence.YEARLY]: addYears(dto.expiration_date, i),
        }[recurrence];
      });

      const results = await this.prisma.$transaction(
        expiration_dates.map((expiration_date, i) =>
          this.prisma.payable.create({
            data: {
              ...dto,
              ...relations,
              expiration_date,
              title: `${dto.title} (${i + 1}/${occurrences})`,
            },
            include,
          }),
        ),
      );
      return results.map((p) => toPayable(p));
    }

    const result = await this.prisma.payable.create({
      data: { ...dto, ...relations },
      include,
    });

    return toPayable(result);
  }

  async update(
    id: number,
    {
      person_id,
      student_id,
      company_id,
      plane_id,
      instructor_id,
      partner_id,
      employee_id,
      payable_type_id,
      ...dto
    }: UpdatePayableDto,
  ) {
    const payerRelation =
      dto.stakeholder &&
      {
        [EStakeholder.PEOPLE]: {
          people: person_id
            ? { connect: { id: person_id } }
            : { disconnect: true },
        },
        [EStakeholder.STUDENT]: {
          student: student_id
            ? { connect: { id: student_id } }
            : { disconnect: true },
        },
        [EStakeholder.COMPANY]: {
          company: company_id
            ? { connect: { id: company_id } }
            : { disconnect: true },
        },
        [EStakeholder.INSTRUCTOR]: {
          instructor: instructor_id
            ? { connect: { id: instructor_id } }
            : { disconnect: true },
        },
        [EStakeholder.PARTNER]: {
          partner: partner_id
            ? { connect: { id: partner_id } }
            : { disconnect: true },
        },
        [EStakeholder.EMPLOYEE]: {
          employee: employee_id
            ? { connect: { id: employee_id } }
            : { disconnect: true },
        },
        [EStakeholder.NONE]: {},
      }[dto.stakeholder];

    const relations = {
      ...payerRelation,
      ...(plane_id !== undefined && {
        aircraft: plane_id
          ? { connect: { id: plane_id } }
          : { disconnect: true },
      }),
      ...(payable_type_id !== undefined && {
        payable_type: payable_type_id
          ? { connect: { id: payable_type_id } }
          : { disconnect: true },
      }),
    };

    const result = await this.prisma.payable.update({
      where: { id },
      data: { ...dto, ...relations },
      include,
    });

    return toPayable(result);
  }

  async delete(id: number) {
    const result = await this.prisma.payable.delete({ where: { id } });
    return plainToInstance(Payable, result);
  }

  async findPaymentById(paymentId: number) {
    const payment = await this.prisma.payablePayment.findUnique({
      where: { id: paymentId },
      include: { file: true },
    });

    return payment ? toPayment(payment) : null;
  }

  async createPayment(id: number, dto: CreatePayablePaymentDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payable = await tx.payable.findUniqueOrThrow({ where: { id } });

      const newAmountPaid = payable.amount_paid.add(new Decimal(dto.amount));
      const status = newAmountPaid.gte(payable.total_amount)
        ? ETitleStatus.PAID
        : ETitleStatus.PARTIAL;

      await tx.payablePayment.create({
        data: {
          payable: { connect: { id } },
          amount: dto.amount,
          method: dto.method,
        },
      });

      return tx.payable.update({
        where: { id },
        data: { amount_paid: newAmountPaid, status },
        include,
      });
    });

    return toPayable(result);
  }

  async deletePayment(paymentId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payablePayment.findUniqueOrThrow({
        where: { id: paymentId },
      });

      const payable = await tx.payable.findUniqueOrThrow({
        where: { id: payment.payable_id },
      });

      if (payable) {
        const newAmountPaid = payable.amount_paid.sub(payment.amount);

        const newAmountPaidClamped = newAmountPaid.lte(0)
          ? new Decimal(0)
          : newAmountPaid;

        const status = newAmountPaidClamped.lte(0)
          ? ETitleStatus.PENDING
          : ETitleStatus.PARTIAL;

        await tx.payable.update({
          where: { id: payable.id },
          data: { amount_paid: newAmountPaidClamped, status },
        });
      }

      return tx.payablePayment.delete({ where: { id: paymentId } });
    });

    return toPayment(result);
  }

  async addPaymentInvoice(paymentId: number, fileData: CreateFileData) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.payablePayment.findUnique({
        where: { id: paymentId },
        select: { file_id: true },
      });

      if (existing?.file_id) {
        await tx.file.delete({ where: { id: existing.file_id } });
      }

      const file = await tx.file.create({ data: fileData });

      return tx.payablePayment.update({
        where: { id: paymentId },
        data: { file: { connect: { id: file.id } } },
      });
    });

    return toPayment(result);
  }

  async deletePaymentInvoice(paymentId: number) {
    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.payablePayment.findUnique({
        where: { id: paymentId },
        select: { file_id: true },
      });

      if (existing?.file_id) {
        await tx.payablePayment.update({
          where: { id: paymentId },
          data: { file: { disconnect: true } },
        });

        await tx.file.delete({ where: { id: existing.file_id } });
      }

      return tx.payablePayment.findUniqueOrThrow({ where: { id: paymentId } });
    });

    return toPayment(result);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const count = await this.prisma.payable.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length)
      throw new UnprocessableEntityException(
        'Um ou mais pagáveis não foram encontrados',
      );
    await this.prisma.payable.deleteMany({ where: { id: { in: ids } } });
  }
}
