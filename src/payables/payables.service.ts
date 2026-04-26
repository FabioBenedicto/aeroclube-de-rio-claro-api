import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { PrismaService } from '../prisma/prisma.service';
import { PayablesRepository } from './payables.repository';

export class CreatePayablePaymentDto {
  installment_id: number;
  amount_paid: number;
  payment_date?: string;
}

@Injectable()
export class PayablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: PayablesRepository,
  ) {}

  findAll(status?: string) { return this.repo.findAll(status); }

  async findOne(id: number) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundException(`Título a pagar ${id} não encontrado`);
    return p;
  }

  async registerPayment(payableId: number, dto: CreatePayablePaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      const payable = await this.repo.findById(payableId);
      if (!payable) throw new NotFoundException(`Título a pagar ${payableId} não encontrado`);

      const installment = payable.installments.find(i => i.id === dto.installment_id);
      if (!installment) throw new NotFoundException(`Parcela ${dto.installment_id} não encontrada`);
      if (installment.status === 'paid') throw new BadRequestException('Parcela já está paga');

      const newPaid = installment.amount_paid.add(new Decimal(dto.amount_paid));
      const newStatus = newPaid.gte(installment.amount) ? 'paid' : 'partial';

      await this.repo.updateInstallment(
        installment.id,
        { amount_paid: newPaid, status: newStatus },
        tx,
      );

      const allInstallments = payable.installments.map(i =>
        i.id === installment.id ? { ...i, amount_paid: newPaid, status: newStatus } : i,
      );
      const allPaid = allInstallments.every(i => i.status === 'paid');
      const anyPaid = allInstallments.some(i => Number(i.amount_paid) > 0);

      await this.repo.updatePayable(
        payableId,
        { status: allPaid ? 'paid' : anyPaid ? 'partial' : 'open' },
        tx,
      );

      return { installment_id: installment.id, amount_paid: dto.amount_paid, status: newStatus };
    });
  }
}
