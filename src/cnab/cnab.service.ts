import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import * as iconv from 'iconv-lite';
import { CnabRepository } from './cnab.repository';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';
import { buildRemessaLines } from './builders/remessa.builder';
import { parseRetorno, RetornoResult } from './parsers/retorno.parser';

@Injectable()
export class CnabService {
  constructor(private readonly repo: CnabRepository) {}

  async generateRemessa(dto: GenerateRemessaDto) {
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

    const seqNumber = settings.sicoob_remessa_sequence;
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
        sicoob_remessa_sequence: seqNumber,
        sicoob_juros: Number(settings.sicoob_juros ?? 0),
        sicoob_juros_prazo: settings.sicoob_juros_prazo ?? 0,
        sicoob_agencia: settings.sicoob_agencia,
      },
      bills as any,
      now,
    );
    const content = lines.join('\r\n') + '\r\n';
    const buffer = iconv.encode(content, 'win1252');

    const dd = String(now.getUTCDate()).padStart(2, '0');
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getUTCFullYear());
    const filename = `remessa_${yyyy}${mm}${dd}_${seqNumber}.rem`;
    const dir = join(process.cwd(), 'uploads', 'cnab');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), buffer);

    const totalAmount = bills.reduce((s, b) => s + parseFloat(String(b.total_amount)), 0);

    await this.repo.incrementRemessaSequence();
    await this.repo.markBillsPendingCnab(dto.bill_ids);

    return this.repo.saveRemessa({
      sequence_number: seqNumber,
      bill_ids: dto.bill_ids,
      bill_count: dto.bill_ids.length,
      total_amount: totalAmount,
      file_path: `uploads/cnab/${filename}`,
    });
  }

  async downloadRemessa(id: number): Promise<{ buffer: Buffer; filename: string }> {
    const remessa = await this.repo.findRemessa(id);
    if (!remessa) throw new NotFoundException(`Remessa ${id} não encontrada`);

    const fullPath = join(process.cwd(), remessa.file_path);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Arquivo de remessa não encontrado no disco');
    }

    const buffer = readFileSync(fullPath);
    const filename = remessa.file_path.split('/').pop()!;
    return { buffer, filename };
  }

  listRemessas(page: number, limit: number) {
    return this.repo.listRemessas(page, limit);
  }

  listRetornos(page: number, limit: number) {
    return this.repo.listRetornos(page, limit);
  }

  async processRetorno(fileBuffer: Buffer): Promise<RetornoResult & { updated: number[]; retorno_id: number }> {
    const content = iconv.decode(fileBuffer, 'win1252');
    const result = parseRetorno(content);

    const updated: number[] = [];
    for (const entry of result.paid) {
      const bill = await this.repo.markBillPaid(entry.billId, entry.paymentDate).catch(() => null);
      if (bill) updated.push(entry.billId);
      else result.errors.push(`Fatura ${entry.billId} não encontrada no sistema`);
    }

    const retorno = await this.repo.saveRetorno({
      paid_ids: updated,
      rejected_ids: result.rejected,
      errors: result.errors,
      paid_count: updated.length,
      rejected_count: result.rejected.length,
    });

    return { ...result, updated, retorno_id: retorno.id };
  }
}
