import { ReceivableType } from '../model/receivable-type.model';

export interface IReceivableTypesRepository {
  findAll(): Promise<ReceivableType[]>;
  findById(id: number): Promise<ReceivableType | null>;
  findByName(name: string): Promise<ReceivableType | null>;
  create(name: string): Promise<ReceivableType>;
  update(id: number, name: string): Promise<ReceivableType>;
  delete(id: number): Promise<void>;
  countUsages(id: number): Promise<number>;
}
