import { PayableType } from '../model/payable-type.model';

export const PAYABLE_TYPES_REPOSITORY = Symbol('IPayableTypesRepository');

export interface IPayableTypesRepository {
  findAll(): Promise<PayableType[]>;
  findById(id: number): Promise<PayableType | null>;
  findByName(name: string): Promise<PayableType | null>;
  create(name: string): Promise<PayableType>;
  update(id: number, name: string): Promise<PayableType>;
  delete(id: number): Promise<void>;
  countUsages(id: number): Promise<number>;
}
