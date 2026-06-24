import { UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreateAircraftDto } from '../dto/create-aircraft.dto';
import { FindAllAircraftDto } from '../dto/find-all-aircraft.dto';
import { UpdateAircraftDto } from '../dto/update-aircraft.dto';
import { Aircraft } from '../model/aircraft.model';
import { IAircraftRepository } from './aircraft-repository.interface';

export class FakeAircraftRepository implements IAircraftRepository {
  items: Aircraft[] = [];
  private nextId = 1;

  async findAll({
    page = 1,
    limit = 20,
    date_from,
    date_to,
    search,
    aircraft_type,
  }: FindAllAircraftDto) {
    let data = [...this.items];

    if (search) {
      const searched = search.toLowerCase();
      data = data.filter(
        (a) =>
          a.registration.toLowerCase().includes(searched) ||
          a.model.toLowerCase().includes(searched),
      );
    }

    if (date_from) data = data.filter((a) => a.created_at >= date_from);
    if (date_to) data = data.filter((a) => a.created_at <= date_to);

    if (aircraft_type) data = data.filter((a) => a.type === aircraft_type);

    const total = data.length;
    const skip = (page - 1) * limit;

    return {
      data: data
        .slice(skip, skip + limit)
        .map((a) => plainToInstance(Aircraft, a)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    const raw = this.items.find((a) => a.id === id);
    return raw ? plainToInstance(Aircraft, raw) : null;
  }

  async findByRegistration(registration: string) {
    const raw = this.items.find((raw) => raw.registration === registration);
    return raw ? plainToInstance(Aircraft, raw) : null;
  }

  async create(data: CreateAircraftDto) {
    const aircraft = {
      ...data,
      id: this.nextId++,
      flight_hour_value: data.flight_hour_value ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.items.push(aircraft);
    return plainToInstance(Aircraft, aircraft);
  }

  async update(id: number, data: UpdateAircraftDto) {
    const idx = this.items.findIndex((a) => a.id === id);
    this.items[idx] = { ...this.items[idx], ...data };
    return plainToInstance(Aircraft, this.items[idx]);
  }

  async delete(id: number): Promise<void> {
    const idx = this.items.findIndex((a) => a.id === id);
    this.items.splice(idx, 1);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.items.filter((a) => ids.includes(a.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Uma ou mais aeronaves não foram encontradas');
    this.items = this.items.filter((a) => !ids.includes(a.id));
  }
}
