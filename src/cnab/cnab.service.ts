import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as iconv from 'iconv-lite';

import {
  BILLS_REPOSITORY,
  IBillsRepository,
} from '../bills/repository/bills-repository.interface';
import {
  AZURE_BLOB_SERVICE,
  IAzureBlobService,
} from '../common/providers/azure-blob/azure-blob.service.interface';
import {
  ISicoobSettingsRepository,
  SICOOB_SETTINGS_REPOSITORY,
} from '../settings/repository/sicoob/sicoob-settings-repository.interface';
import { buildRemessaLines } from './builders/remittent.builder';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';
import {
  CNAB_REPOSITORY,
  ICnabRepository,
} from './repository/cnab-repository.interface';

@Injectable()
export class CnabService {
  constructor(
    @Inject(CNAB_REPOSITORY)
    private readonly CnabRepository: ICnabRepository,

    @Inject(BILLS_REPOSITORY)
    private readonly billsRepository: IBillsRepository,

    @Inject(SICOOB_SETTINGS_REPOSITORY)
    private readonly sicoobSettingsRepository: ISicoobSettingsRepository,

    @Inject(AZURE_BLOB_SERVICE)
    private readonly azureBlobService: IAzureBlobService,
  ) {}

  listRemittent(page: number, limit: number) {
    return this.CnabRepository.listRemittent(page, limit);
  }

  async generateRemittent(dto: GenerateRemessaDto) {
    const config = await this.sicoobSettingsRepository.find();

    if (
      !config ||
      !config.cooperative_prefix ||
      !config.cooperative_digit ||
      !config.account ||
      !config.account_digit ||
      !config.cnpj ||
      !config.wallet ||
      !config.modality ||
      !config.company_name
    ) {
      throw new UnprocessableEntityException(
        'Configurações do Sicoob incompletas.',
      );
    }

    const bills = await this.billsRepository.findByIds(dto.bill_ids);

    const missing = dto.bill_ids.filter(
      (id) => !bills.find((b) => b.id === id),
    );

    if (missing.length > 0) {
      throw new NotFoundException(
        `Boletos não encontrados: ${missing.join(', ')}`,
      );
    }

    const withoutAddress = bills.filter((b) => !b.people?.address);
    if (withoutAddress.length > 0) {
      const names = withoutAddress
        .map((b) => b.people?.name ?? `Boleto ${b.id}`)
        .join(', ');
      throw new UnprocessableEntityException(
        `Os seguintes clientes não possuem endereço cadastrado: ${names}`,
      );
    }

    const sequenceNumber = config.remittance_sequence;

    const now = new Date();

    const lines = buildRemessaLines(
      {
        cooperative_prefix: config.cooperative_prefix,
        cooperative_digit: config.cooperative_digit,
        account: config.account,
        account_digit: config.account_digit,
        wallet: config.wallet,
        modality: config.modality,
        cnpj: config.cnpj,
        company_name: config.company_name,
        remittance_sequence: config.remittance_sequence,
        interest_rate: config.interest_rate,
        interest_period: config.interest_period,
        interest_type: config.interest_type,
      },
      bills,
      now,
    );

    const content = lines.join('\r\n') + '\r\n';
    const buffer = iconv.encode(content, 'win1252');

    const dd = String(now.getUTCDate()).padStart(2, '0');
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getUTCFullYear());

    const filename = `remessa_${yyyy}${mm}${dd}_${sequenceNumber}.rem`;
    const blobPath = `cnab/${filename}`;

    const url = await this.azureBlobService.upload(
      blobPath,
      buffer,
      'application/octet-stream',
    );

    await this.sicoobSettingsRepository.incrementRemittanceSequence();

    await this.billsRepository.markPendingCnab(dto.bill_ids);

    const totalAmount = bills.reduce(
      (s, b) => s + parseFloat(String(b.total_amount)),
      0,
    );

    return this.CnabRepository.createRemittent({
      sequence_number: sequenceNumber,
      bill_count: dto.bill_ids.length,
      total_amount: totalAmount,
      file: {
        url,
        blob_path: blobPath,
        original_name: filename,
        mime_type: 'application/octet-stream',
        size: buffer.byteLength,
      },
      bill_ids: dto.bill_ids,
    });
  }

  async getRemittentDetail(id: number) {
    const remittent = await this.CnabRepository.findRemittent(id);
    if (!remittent) throw new NotFoundException(`Remessa ${id} não encontrada`);
    const bills = await this.billsRepository.findByIds(remittent.bill_ids);
    return { ...remittent, bills };
  }

  async downloadRemessa(id: number): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const remittent = await this.CnabRepository.findRemittent(id);

    if (!remittent) throw new NotFoundException(`Remessa ${id} não encontrada`);

    const buffer = await this.azureBlobService
      .download(remittent.file.blob_path)
      .catch(() => {
        throw new NotFoundException(
          'Arquivo de remessa não encontrado no storage',
        );
      });

    return {
      buffer,
      filename: remittent.file.original_name,
    };
  }

  async deleteRemittent(id: number) {
    const remittent = await this.CnabRepository.findRemittent(id);

    if (!remittent) throw new NotFoundException(`Remessa ${id} não encontrada`);

    await this.azureBlobService.delete(remittent.file.blob_path);

    await this.billsRepository.revertFromPendingCnab(remittent.bill_ids);

    await this.CnabRepository.deleteRemessa(id);

    return remittent;
  }
}
