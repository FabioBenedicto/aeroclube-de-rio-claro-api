import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { PrismaService } from '../prisma/prisma.service';
import { ReceivablesRepository } from './receivables.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class ReceivablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly receivablesRepository: ReceivablesRepository,
  ) {}

  async registerPayment(receivableId: number, dto: CreatePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await this.receivablesRepository.findById(receivableId, tx);

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

          await this.receivablesRepository.updateCustomerBalance(
            receivable.client_id,
            -hoursDeducted,
            tx,
          );
        }
      }

      const capped = Decimal.min(effectivePayment, outstanding);
      const newAmountReceived = receivable.amount_received.add(capped);
      const newStatus = newAmountReceived.gte(receivable.total_amount) ? 1 : 0;

      await this.receivablesRepository.updateReceivable(
        receivableId,
        { amount_received: newAmountReceived, status: newStatus },
        tx,
      );

      const paymentDate = dto.payment_date ? new Date(dto.payment_date) : new Date();

      const payment = await this.receivablesRepository.createPayment(
        {
          receivable: { connect: { id: receivableId } },
          amount_received: new Decimal(dto.amount_received),
          payment_method: dto.payment_method,
          payment_date: paymentDate,
          notes: dto.notes,
        },
        tx,
      );

      return {
        payment,
        applied_credits: hoursDeducted,
        status: newStatus === 1 ? 'paid' : 'partial',
      };
    });
  }
}
