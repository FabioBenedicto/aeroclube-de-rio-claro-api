import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import * as iconv from 'iconv-lite';
import { CnabRepository } from './cnab.repository';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';
import { buildRemessaLines } from './builders/remessa.builder';
import { parseRetorno, RetornoResult } from './parsers/retorno.parser';

@Injectable()
export class CnabService {
  constructor(private readonly repo: CnabRepository) {}

  async generateRemessa(dto: GenerateRemessaDto): Promise<Buffer> {
    const settings = await this.repo.getSettings();

    if (
      !settings?.sicoob_cooperativa_prefix ||
      !settings?.sicoob_cooperativa_dv ||
      !settings?.sicoob_conta ||
      !settings?.sicoob_conta_dv ||
      !settings?.sicoob_cnpj ||
      !settings?.sicoob_carteira ||
      !settings?.sicoob_modalidade ||
      !settings?.sicoob_nome_empresa
    ) {
      throw new UnprocessableEntityException(
        'Configurações Sicoob incompletas. Preencha em PUT /api/settings.',
      );
    }

    const bills = await this.repo.findBillsByIds(dto.bill_ids);

    const invalidBills = bills.filter((b) => !b.due_date);
    if (invalidBills.length > 0) {
      throw new UnprocessableEntityException(
        `Faturas sem data de vencimento: ${invalidBills.map((b) => b.id).join(', ')}`,
      );
    }

    const now = new Date();
    const lines = buildRemessaLines(
      {
        sicoob_cooperativa_prefix: settings.sicoob_cooperativa_prefix,
        sicoob_cooperativa_dv: settings.sicoob_cooperativa_dv,
        sicoob_conta: settings.sicoob_conta,
        sicoob_conta_dv: settings.sicoob_conta_dv,
        sicoob_carteira: settings.sicoob_carteira,
        sicoob_modalidade: settings.sicoob_modalidade,
        sicoob_cnpj: settings.sicoob_cnpj,
        sicoob_nome_empresa: settings.sicoob_nome_empresa,
        sicoob_remessa_sequence: settings.sicoob_remessa_sequence,
        sicoob_juros: Number(settings.sicoob_juros ?? 0),
      },
      bills as any,
      now,
    );
    const content = lines.join('\r\n') + '\r\n';

    await this.repo.incrementRemessaSequence();
    await this.repo.markBillsPendingCnab(dto.bill_ids);

    return iconv.encode(content, 'win1252');
  }

  async processRetorno(fileBuffer: Buffer): Promise<RetornoResult & { updated: number[] }> {
    const content = iconv.decode(fileBuffer, 'win1252');
    const result = parseRetorno(content);

    const updated: number[] = [];
    for (const entry of result.paid) {
      const bill = await this.repo.markBillPaid(entry.billId, entry.paymentDate).catch(() => null);
      if (bill) updated.push(entry.billId);
      else result.errors.push(`Fatura ${entry.billId} não encontrada no sistema`);
    }

    return { ...result, updated };
  }
}
