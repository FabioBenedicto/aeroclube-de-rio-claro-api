import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client-runtime-utils';
import { Prisma } from '@prisma/client';

export interface RegisterPayablePaymentInput {
  installment_id: number;
  amount_paid: number;
  payment_date?: string;
}

@Injectable()
export class PayablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: string) {
    return this.prisma.payable.findMany({
      where: status ? { status } : undefined,
      orderBy: { created_at: 'desc' },
      include: { instructor: { include: { customer: true } }, installments: true },
    });
  }

  findById(id: number) {
    return this.prisma.payable.findUnique({
      where: { id },
      include: { instructor: { include: { customer: true } }, installments: true },
    });
  }

  async registerPayment(payableId: number, dto: RegisterPayablePaymentInput) {
    return this.prisma.$transaction(async (tx) => {
      const payable = await tx.payable.findUnique({
        where: { id: payableId },
        include: { installments: true },
      });

      if (!payable) throw new NotFoundException(`Título a pagar ${payableId} não encontrado`);

      const installment = payable.installments.find((i) => i.id === dto.installment_id);
      if (!installment) throw new NotFoundException(`Parcela ${dto.installment_id} não encontrada`);
      if (installment.status === 'paid') throw new BadRequestException('Parcela já está paga');

      const newPaid = installment.amount_paid.add(new Decimal(dto.amount_paid));
      const newStatus = newPaid.gte(installment.amount) ? 'paid' : 'partial';

      await tx.payableInstallment.update({
        where: { id: installment.id },
        data: { amount_paid: newPaid, status: newStatus },
      });

      const allInstallments = payable.installments.map((i) =>
        i.id === installment.id ? { ...i, amount_paid: newPaid, status: newStatus } : i,
      );
      const allPaid = allInstallments.every((i) => i.status === 'paid');
      const anyPaid = allInstallments.some((i) => Number(i.amount_paid) > 0);

      await tx.payable.update({
        where: { id: payableId },
        data: { status: allPaid ? 'paid' : anyPaid ? 'partial' : 'open' } as Prisma.PayableUpdateInput,
      });

      return { installment_id: installment.id, amount_paid: dto.amount_paid, status: newStatus };
    });
  }
}
