import { ReceivableType } from '../model/receivable-type.model';
import { IReceivableTypesRepository } from './receivable-types-repository.interface';

export class FakeReceivableTypesRepository implements IReceivableTypesRepository {
  types: ReceivableType[] = [];
  usageCounts: Map<number, number> = new Map();
  private nextId = 1;

  async findAll(): Promise<ReceivableType[]> {
    return this.types;
  }

  async findById(id: number): Promise<ReceivableType | null> {
    return this.types.find((t) => t.id === id) ?? null;
  }

  async findByName(name: string): Promise<ReceivableType | null> {
    return this.types.find((t) => t.name === name) ?? null;
  }

  async create(name: string): Promise<ReceivableType> {
    const type: ReceivableType = { id: this.nextId++, name, created_at: new Date() };
    this.types.push(type);
    return type;
  }

  async update(id: number, name: string): Promise<ReceivableType> {
    const type = this.types.find((t) => t.id === id);
    if (!type) throw new Error(`ReceivableType ${id} not found`);
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
