import { Paginated } from '../../common/dto/pagination.dto';
import { CreateAircraftDto } from '../dto/create-aircraft.dto';
import { FindAllAircraftDto } from '../dto/find-all-aircraft.dto';
import { UpdateAircraftDto } from '../dto/update-aircraft.dto';
import { Aircraft } from '../model/aircraft.model';

export interface IAircraftRepository {
  findAll(dto: FindAllAircraftDto): Promise<Paginated<Aircraft>>;
  findById(id: number): Promise<Aircraft | null>;
  findByRegistration(registration: string): Promise<Aircraft | null>;
  create(data: CreateAircraftDto): Promise<Aircraft>;
  update(id: number, data: UpdateAircraftDto): Promise<Aircraft>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: number[]): Promise<void>;
}

export const AIRCRAFT_REPOSITORY = Symbol('IAircraftRepository');
