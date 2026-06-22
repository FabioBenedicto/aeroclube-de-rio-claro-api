import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TitleStatus } from '@prisma/client';
import { Decimal } from '@prisma/client-runtime-utils';
import { plainToInstance } from 'class-transformer';
import { addMonths, addWeeks, addYears, endOfDay, startOfDay } from 'date-fns';

import { paginate } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Recurrence } from '../../shared/enums/recurrence.enum';
import { Stakeholder } from '../../shared/enums/stakeholder.enum';
import { CreateFileData } from '../../shared/interfaces/create-file-data';
import { CreateReceivablePaymentDto } from '../dto/create-payment.dto';
import { CreateReceivableDto } from '../dto/create-receivable.dto';
import { FindAllReceivablesDto } from '../dto/find-all-receivables.dto';
import { UpdateReceivableDto } from '../dto/update-receivable.dto';
import { Receivable } from '../model/receivable.model';
import { ReceivablePayment } from '../model/receivable-payment.model';
import { IReceivablesRepository } from './receivables-repository.interface';

const include = {
  people: true,
  student: { include: { people: true } },
  company: true,
  aircraft: true,
  instructor: { include: { people: true } },
  partner: { include: { people: true } },
  employee: { include: { people: true } },
  payments: {
    orderBy: { payment_date: Prisma.SortOrder.desc },
    include: { file: true },
  },
  flight: { include: { aircraft: true, people: true } },
  receivable_type: true,
};

type ReceivableRaw = Prisma.ReceivableGetPayload<{ include: typeof include }>;

function normalizePerson(p: any) {
  return { ...p, credit_balance: Number(p.credit_balance) };
}

function normalizeAircraft(p: any) {
  return {
    ...p,
    flight_hour_value:
      p.flight_hour_value !== null ? Number(p.flight_hour_value) : null,
  };
}

function normalizeFlightRaw(f: any) {
  return {
    ...f,
    total_hours: f.total_hours !== null ? Number(f.total_hours) : null,
    total_amount: f.total_amount !== null ? Number(f.total_amount) : null,
    aircraft: f.aircraft ? normalizeAircraft(f.aircraft) : f.aircraft,
    people: f.people ? normalizePerson(f.people) : f.people,
  };
}

function toReceivable(raw: ReceivableRaw): Receivable {
  return plainToInstance(Receivable, {
    ...raw,
    total_amount: Number(raw.total_amount),
    amount_received: Number(raw.amount_received),
    people: raw.people ? normalizePerson(raw.people) : raw.people,
    student: raw.student
      ? { ...raw.student, people: normalizePerson(raw.student.people) }
      : raw.student,
    company: raw.company ?? raw.company,
    flight: raw.flight ? normalizeFlightRaw(raw.flight) : raw.flight,
    aircraft: raw.aircraft ? normalizeAircraft(raw.aircraft) : raw.aircraft,
    instructor: raw.instructor
      ? {
          ...raw.instructor,
          people: normalizePerson(raw.instructor.people),
        }
      : raw.instructor,
    partner: raw.partner
      ? {
          ...raw.partner,
          monthly_dues: Number(raw.partner.monthly_dues),
          people: normalizePerson(raw.partner.people),
        }
      : raw.partner,
    employee: raw.employee
      ? { ...raw.employee, people: normalizePerson(raw.employee.people) }
      : raw.employee,
    payments: raw.payments?.map((p: any) => ({
      ...p,
      amount: Number(p.amount),
    })),
  });
}

function toReceivablePayment(raw: any): ReceivablePayment {
  return plainToInstance(ReceivablePayment, {
    ...raw,
    amount: Number(raw.amount),
  });
}

@Injectable()
export class ReceivablesRepository implements IReceivablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    status,
    search,
    date_from,
    date_to,
    page = 1,
    limit = 20,
  }: FindAllReceivablesDto) {
    const now = new Date();
    const AND: Prisma.ReceivableWhereInput[] = [];

    if (status === '1') {
      AND.push({ status: TitleStatus.PAID });
    } else if (status === '0') {
      AND.push({ status: TitleStatus.OPEN, expiration_date: { gte: now } });
    } else if (status === 'partial') {
      AND.push({ status: TitleStatus.PARTIAL });
    } else if (status === 'overdue') {
      AND.push({ status: TitleStatus.OPEN, expiration_date: { lt: now } });
    }

    if (search) {
      AND.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { people: { name: { contains: search, mode: 'insensitive' } } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    if (date_from || date_to) {
      const range: Prisma.DateTimeFilter = {};

      if (date_from) range.gte = startOfDay(date_from);
      if (date_to) range.lte = endOfDay(date_to);

      AND.push({ created_at: range });
    }

    const where: Prisma.ReceivableWhereInput = AND.length > 0 ? { AND } : {};
    const args: Prisma.ReceivableFindManyArgs = {
      where,
      orderBy: { created_at: 'desc' },
      include,
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.receivable.findMany(args),
      this.prisma.receivable.count({ where }),
    ]);

    return paginate(data.map(toReceivable), total, page, limit);
  }

  async findById(id: number) {
    const raw = await this.prisma.receivable.findUnique({
      where: { id },
      include,
    });

    return raw ? toReceivable(raw) : null;
  }

  async create({
    person_id,
    student_id,
    company_id,
    bill_id,
    plane_id,
    flight_id,
    instructor_id,
    partner_id,
    employee_id,
    recurrence,
    occurrences,
    receivable_type_id,
    ...dto
  }: CreateReceivableDto) {
    const receiverRelation = {
      [Stakeholder.PEOPLE]: { people: { connect: { id: person_id } } },
      [Stakeholder.STUDENT]: { student: { connect: { id: student_id } } },
      [Stakeholder.COMPANY]: { company: { connect: { id: company_id } } },
      [Stakeholder.INSTRUCTOR]: {
        instructor: { connect: { id: instructor_id } },
      },
      [Stakeholder.PARTNER]: { partner: { connect: { id: partner_id } } },
      [Stakeholder.EMPLOYEE]: { employee: { connect: { id: employee_id } } },
      [Stakeholder.NONE]: {},
    }[dto.stakeholder ?? Stakeholder.NONE];

    const relations = {
      ...receiverRelation,
      ...(plane_id && { aircraft: { connect: { id: plane_id } } }),
      ...(flight_id && { flight: { connect: { id: flight_id } } }),
      receivable_type: { connect: { id: receivable_type_id } },
    };

    if (recurrence) {
      const expirations_date = Array.from({ length: occurrences }, (_, i) => {
        return {
          [Recurrence.WEEKLY]: addWeeks(dto.expiration_date, i),
          [Recurrence.MONTHLY]: addMonths(dto.expiration_date, i),
          [Recurrence.YEARLY]: addYears(dto.expiration_date, i),
        }[recurrence];
      });

      const results = await this.prisma.$transaction(
        expirations_date.map((expiration_date, i) =>
          this.prisma.receivable.create({
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

      return results.map(toReceivable);
    }

    const result = await this.prisma.receivable.create({
      data: {
        ...dto,
        ...relations,
      },
      include,
    });

    return toReceivable(result);
  }

  async update(
    id: number,
    {
      person_id,
      student_id,
      company_id,
      bill_id,
      plane_id,
      flight_id,
      instructor_id,
      partner_id,
      employee_id,
      receivable_type_id,
      ...dto
    }: UpdateReceivableDto,
  ) {
    const payerRelation =
      dto.stakeholder &&
      {
        [Stakeholder.PEOPLE]: {
          people: person_id
            ? { connect: { id: person_id } }
            : { disconnect: true },
        },
        [Stakeholder.STUDENT]: {
          student: student_id
            ? { connect: { id: student_id } }
            : { disconnect: true },
        },
        [Stakeholder.COMPANY]: {
          company: company_id
            ? { connect: { id: company_id } }
            : { disconnect: true },
        },
        [Stakeholder.INSTRUCTOR]: {
          instructor: instructor_id
            ? { connect: { id: instructor_id } }
            : { disconnect: true },
        },
        [Stakeholder.PARTNER]: {
          partner: partner_id
            ? { connect: { id: partner_id } }
            : { disconnect: true },
        },
        [Stakeholder.EMPLOYEE]: {
          employee: employee_id
            ? { connect: { id: employee_id } }
            : { disconnect: true },
        },
        [Stakeholder.NONE]: {},
      }[dto.stakeholder];

    const relations = {
      ...payerRelation,
      ...(plane_id !== undefined && {
        aircraft: plane_id ? { connect: { id: plane_id } } : { disconnect: true },
      }),
      ...(flight_id !== undefined && {
        flight: flight_id
          ? { connect: { id: flight_id } }
          : { disconnect: true },
      }),
      ...(receivable_type_id !== undefined && {
        receivable_type: { connect: { id: receivable_type_id } },
      }),
    };

    const raw = await this.prisma.receivable.update({
      where: { id },
      data: {
        ...dto,
        ...relations,
      },
      include: {
        people: true,
        company: true,
        flight: { include: { aircraft: true, people: true } },
        aircraft: true,
        receivable_type: true,
      },
    });

    return toReceivable(raw as ReceivableRaw);
  }

  async delete(id: number) {
    await this.prisma.receivable.delete({ where: { id } });
  }

  async findPaymentById(paymentId: number) {
    const raw = await this.prisma.receivablePayment.findUnique({
      where: { id: paymentId },
      include: { file: true },
    });

    return raw ? toReceivablePayment(raw) : null;
  }

  async createPayment(receivableId: number, dto: CreateReceivablePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.receivable.findUnique({
        where: { id: receivableId },
        include: { receivable_type: true },
      });

      if (!receivable)
        throw new NotFoundException(`Recebível ${receivableId} não encontrado`);

      if (receivable.status === TitleStatus.PAID)
        throw new BadRequestException('Recebível já liquidado');

      const paymentDate = dto.payment_date
        ? new Date(dto.payment_date)
        : new Date();
      let outstanding = receivable.total_amount.sub(receivable.amount_received);
      let totalApplied = new Decimal(0);

      if (dto.use_credit && receivable.people_id) {
        const customer = await tx.people.findUnique({
          where: { id: receivable.people_id },
          select: { credit_balance: true },
        });
        const creditAvailable = customer?.credit_balance ?? new Decimal(0);
        const creditToApply = Decimal.min(creditAvailable, outstanding);

        if (creditToApply.gt(0)) {
          await tx.people.update({
            where: { id: receivable.people_id },
            data: { credit_balance: { decrement: creditToApply.toNumber() } },
          });
          await tx.receivablePayment.create({
            data: {
              receivable: { connect: { id: receivableId } },
              amount: creditToApply,
              method: 'Credit',
              payment_date: paymentDate,
            },
          });
          totalApplied = totalApplied.add(creditToApply);
          outstanding = outstanding.sub(creditToApply);
        }
      }

      let cashPayment: ReceivablePayment | null = null;
      const cashAmount = new Decimal(dto.amount_received);
      if (cashAmount.gt(0)) {
        const cashToApply = Decimal.min(cashAmount, outstanding);
        totalApplied = totalApplied.add(cashToApply);
        const raw = await tx.receivablePayment.create({
          data: {
            receivable: { connect: { id: receivableId } },
            amount: cashAmount,
            method: dto.payment_method,
            payment_date: paymentDate,
          },
        });
        cashPayment = toReceivablePayment(raw);
      }

      const newAmountReceived = receivable.amount_received.add(totalApplied);
      const newStatus = newAmountReceived.gte(receivable.total_amount)
        ? TitleStatus.PAID
        : TitleStatus.PARTIAL;

      await tx.receivable.update({
        where: { id: receivableId },
        data: { amount_received: newAmountReceived, status: newStatus },
      });

      if (
        receivable.receivable_type?.name === 'CREDIT' &&
        receivable.people_id &&
        cashAmount.gt(0)
      ) {
        await tx.people.update({
          where: { id: receivable.people_id },
          data: { credit_balance: { increment: cashAmount.toNumber() } },
        });
      }

      return {
        payment: cashPayment,
        status: newStatus === TitleStatus.PAID ? 'paid' : 'partial',
      };
    });
  }

  async deletePayment(paymentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.receivablePayment.findUniqueOrThrow({
        where: { id: paymentId },
      });

      const receivable = await tx.receivable.findUniqueOrThrow({
        where: { id: payment.receivable_id },
        include: { receivable_type: true },
      });

      if (receivable) {
        const newAmountReceived = receivable.amount_received.sub(
          payment.amount,
        );
        await tx.receivable.update({
          where: { id: receivable.id },
          data: {
            amount_received: newAmountReceived.lte(0) ? 0 : newAmountReceived,
            status: newAmountReceived.lte(0)
              ? TitleStatus.OPEN
              : TitleStatus.PARTIAL,
          },
        });

        if (
          receivable.receivable_type?.name === 'CREDIT' &&
          receivable.people_id &&
          payment.method !== 'Credit'
        ) {
          await tx.people.update({
            where: { id: receivable.people_id },
            data: {
              credit_balance: { decrement: payment.amount.toNumber() },
            },
          });
        }
      }

      await tx.receivablePayment.delete({
        where: { id: paymentId },
      });
    });
  }

  async addPaymentInvoice(paymentId: number, fileData: CreateFileData) {
    const raw = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.receivablePayment.findUnique({
        where: { id: paymentId },
        select: { file_id: true },
      });
      if (existing?.file_id) {
        await tx.file.delete({ where: { id: existing.file_id } });
      }
      const file = await tx.file.create({ data: fileData });
      return tx.receivablePayment.update({
        where: { id: paymentId },
        data: { file: { connect: { id: file.id } } },
      });
    });
    return toReceivablePayment(raw);
  }

  async deletePaymentInvoice(paymentId: number) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.receivablePayment.findUnique({
        where: { id: paymentId },
        select: { file_id: true },
      });
      if (existing?.file_id) {
        await tx.receivablePayment.update({
          where: { id: paymentId },
          data: { file: { disconnect: true } },
        });
        await tx.file.delete({ where: { id: existing.file_id } });
      }
    });
  }
}
