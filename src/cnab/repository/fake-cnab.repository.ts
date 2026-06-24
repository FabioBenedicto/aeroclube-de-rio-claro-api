import { CnabRemittent } from '../model/cnab-remittent.model';
import { ICnabRepository, SaveRemessaData } from './cnab-repository.interface';

export class FakeCnabRepository implements ICnabRepository {
  remessas: CnabRemittent[] = [];
  private nextId = 1;

  async listRemittent(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const data = this.remessas.slice(skip, skip + limit);
    return { data, total: this.remessas.length, page, limit, totalPages: Math.ceil(this.remessas.length / limit) };
  }

  async findRemittent(id: number) {
    return this.remessas.find((r) => r.id === id) ?? null;
  }

  async createRemittent(data: SaveRemessaData): Promise<CnabRemittent> {
    const file = {
      id: this.nextId * 100,
      ...data.file,
      created_at: new Date(),
    };

    const remittent: CnabRemittent = {
      id: this.nextId++,
      sequence_number: data.sequence_number,
      bill_ids: data.bill_ids,
      bill_count: data.bill_count,
      total_amount: data.total_amount,
      file_id: file.id,
      file,
      created_at: new Date(),
      bills: [],
    };

    this.remessas.push(remittent);
    return remittent;
  }

  async deleteRemessa(id: number): Promise<void> {
    const idx = this.remessas.findIndex((r) => r.id === id);
    if (idx === -1) return;
    this.remessas.splice(idx, 1);
  }
}
