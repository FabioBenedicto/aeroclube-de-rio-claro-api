import { PayableType } from '../model/payable-type.model';
import { IPayableTypesRepository } from './payable-types-repository.interface';

export class FakePayableTypesRepository implements IPayableTypesRepository {
  types: PayableType[] = [];
  usageCounts: Map<number, number> = new Map();
  private nextId = 1;

  async findAll(): Promise<PayableType[]> {
    return this.types;
  }

  async findById(id: number): Promise<PayableType | null> {
    return this.types.find((t) => t.id === id) ?? null;
  }

  async findByName(name: string): Promise<PayableType | null> {
    return this.types.find((t) => t.name === name) ?? null;
  }

  async create(name: string): Promise<PayableType> {
    const type: PayableType = { id: this.nextId++, name, created_at: new Date() };
    this.types.push(type);
    return type;
  }

  async update(id: number, name: string): Promise<PayableType> {
    const type = this.types.find((t) => t.id === id);
    if (!type) throw new Error(`PayableType ${id} not found`);
    type.name = name;
    return type;
  }

  async delete(id: number): Promise<void> {
    const idx = this.types.findIndex((t) => t.id === id);
    if (idx !== -1) this.types.splice(idx, 1);
  }

  async countUsages(id: number): Promise<number> {
    return this.usageCounts.get(id) ?? 0;
  }
}
