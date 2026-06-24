import { Paginated } from '../../../common/dto/pagination.dto';
import { CreatePeopleDto } from '../../dto/create-people.dto';
import { FindAllPeoplesDto } from '../../dto/find-all-peoples.dto';
import { UpdatePeopleDto } from '../../dto/update-people.dto';
import { People } from '../../model/people.model';

export interface PeopleStats {
  total_received: number;
  total_paid: number;
  total_hours: number;
  total_flights: number;
}

export interface IPeoplesRepository {
  findAll(dto: FindAllPeoplesDto): Promise<Paginated<People>>;
  findById(id: number): Promise<People | null>;
  findByCpf(cpf: string): Promise<People | null>;
  findByEmail(email: string): Promise<People | null>;
  create(dto: CreatePeopleDto): Promise<People>;
  update(id: number, dto: UpdatePeopleDto): Promise<People>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: number[]): Promise<void>;
  getStats(): Promise<PeopleStats>;
}

export const PEOPLES_REPOSITORY = Symbol('IPeoplesRepository');
