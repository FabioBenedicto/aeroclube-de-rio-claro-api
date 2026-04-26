import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client-runtime-utils';

export interface RegisterPaymentInput {
  amount_received: number;
  payment_method?: string;
  payment_date?: string;
  notes?: string;
}

@Injectable()
export class ReceivablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.receivable.findMany({
      where: status !== undefined ? { status: Number(status) } : undefined,
      orderBy: { created_at: 'desc' },
      include: { customer: true, flight: { include: { plane: true } } },
    });
  }

  findById(id: number) {
    return this.prisma.receivable.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async registerPayment(receivableId: number, dto: RegisterPaymentInput) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.receivable.findUnique({
        where: { id: receivableId },
        include: { customer: true },
      });

      if (!receivable) throw new NotFoundException(`Título ${receivableId} não encontrado`);
      if (receivable.status === 1) throw new BadRequestException('Título já está quitado');

      const outstanding = receivable.total_amount.sub(receivable.amount_received);
      let hoursDeducted = 0;
      let effectivePayment = new Decimal(dto.amount_received);

      if (receivable.client_id && (receivable.customer?.flight_hour_balance ?? 0) > 0) {
        const creditsAvailable = new Decimal(receivable.customer!.flight_hour_balance);
        const creditsToApply = Decimal.min(creditsAvailable, outstanding);

        if (creditsToApply.gt(0)) {
          hoursDeducted = creditsToApply.toNumber();
          effectivePayment = effectivePayment.add(creditsToApply);
          await tx.customer.update({
            where: { id: receivable.client_id },
            data: { flight_hour_balance: { increment: -hoursDeducted } },
          });
        }
      }

      const capped = Decimal.min(effectivePayment, outstanding);
      const newAmountReceived = receivable.amount_received.add(capped);
      const newStatus = newAmountReceived.gte(receivable.total_amount) ? 1 : 0;

      await tx.receivable.update({
        where: { id: receivableId },
        data: { amount_received: newAmountReceived, status: newStatus },
      });

      const paymentDate = dto.payment_date ? new Date(dto.payment_date) : new Date();
      const payment = await tx.receivablePayment.create({
        data: {
          receivable: { connect: { id: receivableId } },
          amount_received: new Decimal(dto.amount_received),
          payment_method: dto.payment_method,
          payment_date: paymentDate,
          notes: dto.notes,
        },
      });

      return {
        payment,
        applied_credits: hoursDeducted,
        status: newStatus === 1 ? 'paid' : 'partial',
      };
    });
  }
}
