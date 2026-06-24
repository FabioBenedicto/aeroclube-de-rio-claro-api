import { ERecurrence } from '@common/enums/recurrence.enum';
import { EStakeholder } from '@common/enums/stakeholder.enum';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { plainToInstance } from 'class-transformer';
import { addMonths, addWeeks, addYears, endOfDay, startOfDay } from 'date-fns';
import { ETitleStatus } from 'src/common/enums/title-status.enum';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateReceivablePaymentDto } from '../dto/create-payment.dto';
import { CreateReceivableDto } from '../dto/create-receivable.dto';
import { FindAllReceivablesDto } from '../dto/find-all-receivables.dto';
import { UpdateReceivableDto } from '../dto/update-receivable.dto';
import { Receivable } from '../model/receivable.model';
import { ReceivablePayment } from '../model/receivable-payment.model';
import { IReceivablesRepository } from './receivables-repository.interface';

const receivablesInclude = {
  receivable_type: true,
  people: true,
  student: { include: { people: true } },
  partner: { include: { people: true } },
  instructor: { include: { people: true } },
  employee: { include: { people: true } },
  company: true,
  aircraft: true,
  flight: {
    include: {
      aircraft: true,
      people: true,
      instructor: { include: { people: true } },
    },
  },
  payments: {
    orderBy: { payment_date: Prisma.SortOrder.desc },
    include: { file: true },
  },
};

@Injectable()
export class ReceivablesRepository implements IReceivablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    status,
    search,
    date_from,
    date_to,
    people_id,
    page = 1,
    limit = 20,
  }: FindAllReceivablesDto) {
    const now = new Date();

    const AND: Prisma.ReceivableWhereInput[] = [];

    if (status === '1') {
      AND.push({ status: ETitleStatus.PAID });
    } else if (status === '0') {
      AND.push({ status: ETitleStatus.PENDING, expiration_date: { gte: now } });
    } else if (status === 'partial') {
      AND.push({ status: ETitleStatus.PARTIAL });
    } else if (status === 'overdue') {
      AND.push({
        status: { not: ETitleStatus.PAID },
        expiration_date: { lt: now },
      });
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

    if (people_id) {
      AND.push({ people_id });
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
      orderBy: {
        created_at: 'desc',
      },
      include: receivablesInclude,
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.receivable.findMany(args),
      this.prisma.receivable.count({ where }),
    ]);

    return {
      data: data.map((item) => plainToInstance(Receivable, item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const raw = await this.prisma.receivable.findUnique({
      where: { id },
      include: receivablesInclude,
    });

    return raw ? plainToInstance(Receivable, raw) : null;
  }

  async create({
    person_id,
    student_id,
    company_id,
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
      [EStakeholder.PEOPLE]: { people: { connect: { id: person_id } } },
      [EStakeholder.STUDENT]: { student: { connect: { id: student_id } } },
      [EStakeholder.COMPANY]: { company: { connect: { id: company_id } } },
      [EStakeholder.INSTRUCTOR]: {
        instructor: { connect: { id: instructor_id } },
      },
      [EStakeholder.PARTNER]: { partner: { connect: { id: partner_id } } },
      [EStakeholder.EMPLOYEE]: { employee: { connect: { id: employee_id } } },
      [EStakeholder.NONE]: {},
    }[dto.stakeholder ?? EStakeholder.NONE];

    const relations = {
      ...receiverRelation,
      ...(plane_id && { aircraft: { connect: { id: plane_id } } }),
      ...(flight_id && { flight: { connect: { id: flight_id } } }),
      ...(receivable_type_id && {
        receivable_type: { connect: { id: receivable_type_id } },
      }),
    };

    if (recurrence) {
      const expirations_date = Array.from({ length: occurrences }, (_, i) => {
        return {
          [ERecurrence.WEEKLY]: addWeeks(dto.expiration_date, i),
          [ERecurrence.MONTHLY]: addMonths(dto.expiration_date, i),
          [ERecurrence.YEARLY]: addYears(dto.expiration_date, i),
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
            include: receivablesInclude,
          }),
        ),
      );

      return results.map((item) => plainToInstance(Receivable, item));
    }

    const result = await this.prisma.receivable.create({
      data: {
        ...dto,
        ...relations,
      },
      include: receivablesInclude,
    });

    return plainToInstance(Receivable, result);
  }

  async update(
    id: number,
    {
      person_id,
      student_id,
      company_id,
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
        flight: {
          include: {
            aircraft: true,
            people: true,
            instructor: { include: { people: true } },
          },
        },
        aircraft: true,
        receivable_type: true,
      },
    });

    return plainToInstance(Receivable, raw);
  }

  async delete(id: number) {
    await this.prisma.receivable.delete({ where: { id } });
  }

  async findPaymentById(paymentId: number) {
    const raw = await this.prisma.receivablePayment.findUnique({
      where: { id: paymentId },
      include: { file: true },
    });

    return raw ? plainToInstance(ReceivablePayment, raw) : null;
  }

  async createPayment(receivableId: number, dto: CreateReceivablePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.receivable.findUnique({
        where: { id: receivableId },
      });

      if (!receivable)
        throw new NotFoundException(`Recebível ${receivableId} não encontrado`);

      if (receivable.status === ETitleStatus.PAID)
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
        cashPayment = plainToInstance(ReceivablePayment, raw);
      }

      const newAmountReceived = receivable.amount_received.add(totalApplied);
      const newStatus = newAmountReceived.gte(receivable.total_amount)
        ? ETitleStatus.PAID
        : ETitleStatus.PARTIAL;

      await tx.receivable.update({
        where: { id: receivableId },
        data: { amount_received: newAmountReceived, status: newStatus },
      });

      if (receivable.adds_credit && receivable.people_id && cashAmount.gt(0)) {
        await tx.people.update({
          where: { id: receivable.people_id },
          data: { credit_balance: { increment: cashAmount.toNumber() } },
        });
      }

      return {
        payment: cashPayment,
        status: newStatus === ETitleStatus.PAID ? 'paid' : 'partial',
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
              ? ETitleStatus.PENDING
              : ETitleStatus.PARTIAL,
          },
        });

        if (
          receivable.adds_credit &&
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

  async attachPaymentInvoice(paymentId: number, fileData: CreateFileData) {
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

    return plainToInstance(ReceivablePayment, raw);
  }

  async removePaymentInvoice(paymentId: number) {
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

  async bulkDelete(ids: number[]): Promise<void> {
    const count = await this.prisma.receivable.count({
      where: { id: { in: ids } },
    });
    if (count !== ids.length)
      throw new UnprocessableEntityException(
        'Um ou mais recebíveis não foram encontrados',
      );
    const paidCount = await this.prisma.receivable.count({
      where: { id: { in: ids }, status: ETitleStatus.PAID },
    });
    if (paidCount > 0)
      throw new UnprocessableEntityException(
        'Não é possível excluir recebíveis já pagos',
      );
    await this.prisma.receivable.deleteMany({ where: { id: { in: ids } } });
  }
}
