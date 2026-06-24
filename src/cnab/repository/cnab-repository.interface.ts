import { Paginated } from '../../common/dto/pagination.dto';
import { CreateFileData } from 'src/file/interfaces/create-file-data';
import { CnabRemittent } from '../model/cnab-remittent.model';

export const CNAB_REPOSITORY = Symbol('ICnabRepository');

export interface SaveRemessaData {
  sequence_number: number;
  bill_ids: number[];
  bill_count: number;
  total_amount: number;
  file: CreateFileData;
}

export interface ICnabRepository {
  listRemittent(page: number, limit: number): Promise<Paginated<CnabRemittent>>;
  findRemittent(id: number): Promise<CnabRemittent | null>;
  createRemittent(data: SaveRemessaData): Promise<CnabRemittent>;
  deleteRemessa(id: number): Promise<void>;
}
