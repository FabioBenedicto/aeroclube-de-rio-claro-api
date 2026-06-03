import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { Decimal } from '@prisma/client-runtime-utils';

const include = {
  customer: true,
  receivable_payments: { include: { receivable: true } },
};

@Injectable()
export class BillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(customerId?: number, dateFrom?: Date, dateTo?: Date, page = 1, limit = 20, pending = false, dueFrom?: Date, dueTo?: Date) {
    const AND: Prisma.BillWhereInput[] = [];
    if (customerId) AND.push({ customer_id: customerId });
    if (pending) AND.push({ paid_at: null });
    if (dateFrom || dateTo) {
      const range: Prisma.DateTimeFilter = {};
      if (dateFrom) range.gte = dateFrom;
      if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); range.lte = end; }
      AND.push({ issue_date: range });
    }
    if (dueFrom || dueTo) {
      const dueRange: Prisma.DateTimeNullableFilter = {};
      if (dueFrom) dueRange.gte = dueFrom;
      if (dueTo) { const end = new Date(dueTo); end.setHours(23, 59, 59, 999); dueRange.lte = end; }
      AND.push({ due_date: dueRange });
    }
    const where = AND.length > 0 ? { AND } : undefined;
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.bill.findMany({ where, orderBy: { issue_date: 'desc' }, include, skip, take: limit }),
      this.prisma.bill.count({ where }),
    ]);
    return { data, total };
  }

  findById(id: number) {
    return this.prisma.bill.findUnique({ where: { id }, include });
  }

  async create(dto: CreateBillDto) {
    return this.prisma.$transaction(async (tx) => {
      const receivableIds = dto.items.map((i) => i.receivable_id);

      const receivables = await tx.receivable.findMany({
        where: { id: { in: receivableIds } },
      });

      if (receivables.length !== receivableIds.length) {
        throw new NotFoundException('Um ou mais títulos não foram encontrados');
      }

      for (const item of dto.items) {
        const r = receivables.find((r) => r.id === item.receivable_id)!;
        const outstanding = r.total_amount.sub(r.amount_received);
        if (new Decimal(item.amount).gt(outstanding)) {
          throw new BadRequestException(
            `Valor para o título ${r.id} (${item.amount}) excede o saldo devedor (${outstanding})`,
          );
        }
      }

      const total_amount = dto.items.reduce((sum, i) => sum + i.amount, 0);
      const paidAt = new Date();

      const bill = await tx.bill.create({
        data: {
          customer: { connect: { id: dto.customer_id } },
          total_amount,
          paid_at: paidAt,
          ...(dto.due_date && { due_date: new Date(dto.due_date) }),
        },
      });

      await Promise.all(
        dto.items.map(async (item) => {
          const r = receivables.find((r) => r.id === item.receivable_id)!;
          const newAmountReceived = r.amount_received.add(item.amount);
          const newStatus = newAmountReceived.gte(r.total_amount) ? 1 : 0;

          await tx.receivable.update({
            where: { id: item.receivable_id },
            data: { amount_received: newAmountReceived, status: newStatus },
          });

          await tx.receivablePayment.create({
            data: {
              receivable: { connect: { id: item.receivable_id } },
              bill: { connect: { id: bill.id } },
              amount_received: item.amount,
              payment_method: dto.payment_method,
              payment_date: paidAt,
            },
          });
        }),
      );

      return tx.bill.findUnique({ where: { id: bill.id }, include });
    });
  }

  async delete(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const bill = await tx.bill.findUnique({
        where: { id },
        include: { receivable_payments: true },
      });
      if (!bill) throw new NotFoundException(`Fatura ${id} não encontrada`);

      for (const payment of bill.receivable_payments) {
        const receivable = await tx.receivable.findUnique({
          where: { id: payment.receivable_id },
        });
        if (receivable) {
          const newAmountReceived = receivable.amount_received.sub(payment.amount_received);
          await tx.receivable.update({
            where: { id: payment.receivable_id },
            data: {
              amount_received: newAmountReceived.lte(0) ? 0 : newAmountReceived,
              status: 0,
            },
          });
        }
      }

      await tx.receivablePayment.deleteMany({ where: { bill_id: id } });
      return tx.bill.delete({ where: { id } });
    });
  }

  update(id: number, data: Prisma.BillUpdateInput) {
    return this.prisma.bill.update({ where: { id }, data });
  }

  setNotaFiscal(id: number, path: string | null) {
    return this.prisma.bill.update({ where: { id }, data: { nota_fiscal_path: path }, include });
  }

  async createBoleto(dto: import('./dto/create-boleto-bill.dto').CreateBoletoBillDto) {
    const customer = await this.prisma.person.findUnique({ where: { id: dto.customer_id } });
    if (!customer) throw new NotFoundException(`Cliente ${dto.customer_id} não encontrado`);
    return this.prisma.bill.create({
      data: {
        customer: { connect: { id: dto.customer_id } },
        total_amount: dto.total_amount,
        due_date: new Date(dto.due_date),
      },
      include,
    });
  }
}
