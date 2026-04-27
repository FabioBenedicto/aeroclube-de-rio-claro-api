import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client-runtime-utils';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';
import { Recurrence } from './enums/recurrence.enum';

const include = {
  instructor: { include: { customer: true } },
  payments: { orderBy: { paid_at: 'desc' as const } },
};

@Injectable()
export class PayablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.payable.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      include,
    });
  }

  findById(id: number) {
    return this.prisma.payable.findUnique({ where: { id }, include });
  }

  create(dto: CreatePayableDto) {
    const { instructor_id, recurrence, occurrences, due_date, ...fields } = dto;

    if (!recurrence) {
      return this.prisma.payable.create({
        data: {
          ...fields,
          ...(due_date && { due_date }),
          ...(instructor_id && {
            instructor: { connect: { id: instructor_id } },
          }),
        },
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
            ...(instructor_id && {
              instructor: { connect: { id: instructor_id } },
            }),
          },
          include,
        }),
      ),
    );
  }

  update(id: number, dto: UpdatePayableDto) {
    return this.prisma.payable.update({ where: { id }, data: dto, include });
  }

  delete(id: number) {
    return this.prisma.payable.delete({ where: { id } });
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
