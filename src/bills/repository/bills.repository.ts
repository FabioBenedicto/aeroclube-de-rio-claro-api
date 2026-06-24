import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { plainToInstance } from 'class-transformer';
import { ETitleStatus } from 'src/common/enums/title-status.enum';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { Prisma } from 'src/generated/prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateBillDto } from '../dto/create-bill.dto';
import { FindAllBillsDto } from '../dto/find-all-bills.dto';
import { PayBillDto } from '../dto/pay-bill.dto';
import { UpdateBillDto } from '../dto/update-bill.dto';
import { EBillStatus } from '../enums/bill-status.enum';
import { Bill } from '../model/bill.model';
import { IBillsRepository } from './bills-repository.interface';

const billInclude = {
  people: { include: { address: true } },
  file: true,
  receivable_payments: {
    include: {
      receivable: true,
    },
  },
};

type BillRaw = Prisma.BillGetPayload<{ include: typeof billInclude }>;

function toBill(raw: BillRaw): Bill {
  return plainToInstance(Bill, {
    ...raw,
    receivable_payments: (raw.receivable_payments ?? []).map((rp) => ({
      ...rp,
      receivable: rp.receivable
        ? {
            ...rp.receivable,
            total_amount: Number(rp.receivable.total_amount),
            amount_received: Number(rp.receivable.amount_received),
          }
        : null,
    })),
  });
}

@Injectable()
export class BillsRepository implements IBillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({
    people_id,
    date_from,
    date_to,
    page = 1,
    limit = 20,
    pending = false,
    due_from,
    due_to,
    status,
  }: FindAllBillsDto) {
    const AND: Prisma.BillWhereInput[] = [];

    if (people_id) AND.push({ people_id });
    if (pending) AND.push({ payment_date: null });
    if (status) AND.push({ status: status });

    if (date_from || date_to) {
      const range: Prisma.DateTimeFilter = {};
      if (date_from) range.gte = date_from;
      if (date_to) {
        const end = new Date(date_to);
        end.setHours(23, 59, 59, 999);
        range.lte = end;
      }
      AND.push({ created_at: range });
    }

    if (due_from || due_to) {
      const dueRange: Prisma.DateTimeFilter = {};
      if (due_from) dueRange.gte = due_from;
      if (due_to) {
        const end = new Date(due_to);
        end.setHours(23, 59, 59, 999);
        dueRange.lte = end;
      }
      AND.push({ expiration_date: dueRange });
    }

    const where = AND.length > 0 ? { AND } : undefined;
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.bill.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
        include: billInclude,
        skip,
        take: limit,
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data: data.map(toBill),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByIds(ids: number[]): Promise<Bill[]> {
    const data = await this.prisma.bill.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: billInclude,
    });

    return data.map(toBill);
  }

  async findById(id: number): Promise<Bill | null> {
    const raw = await this.prisma.bill.findUnique({
      where: { id },
      include: billInclude,
    });

    return raw ? toBill(raw) : null;
  }

  async create(dto: CreateBillDto): Promise<Bill> {
    return toBill(
      await this.prisma.$transaction(async (tx) => {
        const receivableIds = dto.items.map((i) => i.receivable_id);

        const receivables = await tx.receivable.findMany({
          where: { id: { in: receivableIds } },
        });

        if (receivables.length !== receivableIds.length) {
          throw new NotFoundException(
            'Um ou mais recebíveis não foram encontrados',
          );
        }

        for (const item of dto.items) {
          const r = receivables.find((r) => r.id === item.receivable_id)!;
          const outstanding = r.total_amount.sub(r.amount_received);
          if (new Decimal(item.amount).gt(outstanding)) {
            throw new BadRequestException(
              `Valor para o recebível ${r.id} (${item.amount}) excede o saldo devedor (${outstanding})`,
            );
          }
        }

        const total_amount = dto.items.reduce((sum, i) => sum + i.amount, 0);

        const bill = await tx.bill.create({
          data: {
            people: { connect: { id: dto.people_id } },
            total_amount,
            expiration_date: new Date(dto.expiration_date),
          },
        });

        await Promise.all(
          dto.items.map((item) =>
            tx.receivablePayment.create({
              data: {
                receivable: { connect: { id: item.receivable_id } },
                bill: { connect: { id: bill.id } },
                amount: item.amount,
              },
            }),
          ),
        );

        return tx.bill.findUniqueOrThrow({
          where: { id: bill.id },
          include: billInclude,
        });
      }),
    );
  }

  async update(
    id: number,
    data: Pick<UpdateBillDto, 'expiration_date'>,
  ): Promise<Bill> {
    const raw = await this.prisma.bill.update({
      where: { id },
      data,
      include: billInclude,
    });
    return toBill(raw);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUniqueOrThrow({
        where: { id },
        include: { receivable_payments: true },
      });

      if (bill.payment_date) {
        for (const payment of bill.receivable_payments) {
          const receivable = await tx.receivable.findUnique({
            where: { id: payment.receivable_id },
          });
          if (receivable) {
            const newAmountReceived = receivable.amount_received.sub(
              payment.amount,
            );
            await tx.receivable.update({
              where: { id: payment.receivable_id },
              data: {
                amount_received: newAmountReceived.lte(0)
                  ? 0
                  : newAmountReceived,
                status: ETitleStatus.PENDING,
              },
            });
          }
        }
      }

      await tx.receivablePayment.deleteMany({ where: { bill_id: id } });
      await tx.bill.delete({ where: { id } });
    });
  }

  async pay(
    id: number,
    data: PayBillDto & { status: EBillStatus; use_credit?: boolean },
  ): Promise<Bill> {
    return toBill(
      await this.prisma.$transaction(async (tx) => {
        const bill = await tx.bill.findUniqueOrThrow({
          where: { id },
          include: { receivable_payments: { include: { receivable: true } } },
        });

        // Apply credit balance if requested
        let creditRemaining = new Decimal(0);
        if (data.use_credit && bill.people_id) {
          const people = await tx.people.findUnique({
            where: { id: bill.people_id },
            select: { credit_balance: true },
          });
          const available = people?.credit_balance ?? new Decimal(0);
          creditRemaining = Decimal.min(available, bill.total_amount);

          if (creditRemaining.gt(0)) {
            await tx.people.update({
              where: { id: bill.people_id },
              data: {
                credit_balance: { decrement: creditRemaining.toNumber() },
              },
            });
          }
        }

        for (const rp of bill.receivable_payments) {
          const r = rp.receivable;
          const rpAmount = rp.amount;

          const creditForThis = creditRemaining.gte(rpAmount)
            ? rpAmount
            : creditRemaining;
          const cashForThis = rpAmount.sub(creditForThis);
          creditRemaining = creditRemaining.sub(creditForThis);

          const newAmountReceived = r.amount_received.add(rpAmount);
          const newStatus = newAmountReceived.gte(r.total_amount)
            ? ETitleStatus.PAID
            : ETitleStatus.PARTIAL;

          await tx.receivable.update({
            where: { id: rp.receivable_id },
            data: { amount_received: newAmountReceived, status: newStatus },
          });

          if (r.adds_credit && bill.people_id && cashForThis.gt(0)) {
            await tx.people.update({
              where: { id: bill.people_id },
              data: { credit_balance: { increment: cashForThis.toNumber() } },
            });
          }

          if (creditForThis.gt(0) && cashForThis.gt(0)) {
            // Split: existing rp becomes the cash portion, create a credit rp
            await tx.receivablePayment.update({
              where: { id: rp.id },
              data: {
                amount: cashForThis,
                payment_date: data.payment_date,
                method: data.payment_method,
              },
            });
            await tx.receivablePayment.create({
              data: {
                receivable: { connect: { id: rp.receivable_id } },
                bill: { connect: { id: bill.id } },
                amount: creditForThis,
                method: 'Credit',
                payment_date: data.payment_date,
              },
            });
          } else {
            await tx.receivablePayment.update({
              where: { id: rp.id },
              data: {
                payment_date: data.payment_date,
                method: creditForThis.eq(rpAmount)
                  ? 'Credit'
                  : data.payment_method,
              },
            });
          }
        }

        return tx.bill.update({
          where: { id },
          data: {
            status: data.status,
            payment_method: data.payment_method,
            payment_date: data.payment_date,
          },
          include: billInclude,
        });
      }),
    );
  }

  async attachInvoice(
    id: number,
    fileData: CreateFileData,
  ): Promise<Bill | null> {
    const raw = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bill.findUnique({
        where: { id },
        select: { file_id: true },
      });
      if (existing?.file_id) {
        await tx.file.delete({ where: { id: existing.file_id } });
      }
      const file = await tx.file.create({ data: fileData });
      return tx.bill.update({
        where: { id },
        data: { file: { connect: { id: file.id } } },
        include: billInclude,
      });
    });
    return raw ? toBill(raw) : null;
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.bill.findUnique({
        where: { id },
        select: { file_id: true },
      });
      if (existing?.file_id) {
        await tx.bill.update({
          where: { id },
          data: { file: { disconnect: true } },
        });
        await tx.file.delete({ where: { id: existing.file_id } });
      }
    });
  }

  async markPendingCnab(ids: number[]): Promise<void> {
    await this.prisma.bill.updateMany({
      where: {
        id: { in: ids },
        status: EBillStatus.OPEN,
      },
      data: {
        status: EBillStatus.PENDING_CNAB,
      },
    });
  }

  async revertFromPendingCnab(ids: number[]): Promise<void> {
    await this.prisma.bill.updateMany({
      where: {
        id: { in: ids },
        status:
          EBillStatus.PENDING_CNAB as unknown as Prisma.EnumBillStatusFilter,
      },
      data: {
        status: EBillStatus.OPEN,
      },
    });
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const count = await this.prisma.bill.count({ where: { id: { in: ids } } });
    if (count !== ids.length)
      throw new UnprocessableEntityException(
        'Uma ou mais faturas não foram encontradas',
      );
    await this.prisma.$transaction(async (tx) => {
      await tx.receivablePayment.deleteMany({
        where: { bill_id: { in: ids } },
      });
      await tx.bill.deleteMany({ where: { id: { in: ids } } });
    });
  }
}
