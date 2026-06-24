import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreatePeopleDto } from '../../dto/create-people.dto';
import { FindAllPeoplesDto } from '../../dto/find-all-peoples.dto';
import { UpdatePeopleDto } from '../../dto/update-people.dto';
import { People } from '../../model/people.model';
import {
  IPeoplesRepository,
  PeopleStats,
} from './peoples-repository.interface';

export class FakePeoplesRepository implements IPeoplesRepository {
  peoples: People[] = [];
  stats: PeopleStats = {
    total_received: 0,
    total_paid: 0,
    total_hours: 0,
    total_flights: 0,
  };
  private nextId = 1;

  async findAll({ page = 1, limit = 20 }: FindAllPeoplesDto) {
    const total = this.peoples.length;
    return {
      data: this.peoples.slice((page - 1) * limit, page * limit),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number) {
    return this.peoples.find((p) => p.id === id) ?? null;
  }

  async findByCpf(cpf: string) {
    return this.peoples.find((p) => p.cpf === cpf) ?? null;
  }

  async findByEmail(email: string) {
    return this.peoples.find((p) => p.email === email) ?? null;
  }

  async create(dto: CreatePeopleDto) {
    const { instructor, student, partner, employee, ...fields } = dto;
    const people = plainToInstance(People, {
      ...fields,
      id: this.nextId++,
      phone_number: fields.phone_number ?? null,
      credit_balance: null,
      address: null,
      created_at: new Date(),
      updated_at: new Date(),
      studentId: 0,
      instructors: instructor ? { id: 0, people_id: 0 } : null,
      students: student ? { id: 0, people_id: 0 } : null,
      partners: partner ? { id: 0, people_id: 0, ...partner } : null,
      employees: employee ? { id: 0, people_id: 0 } : null,
    });
    this.peoples.push(people);
    return people;
  }

  async update(id: number, dto: UpdatePeopleDto) {
    const idx = this.peoples.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`Pessoa ${id} não encontrada`);
    const { instructor, student, partner, employee, ...fields } = dto;
    const updated = plainToInstance(People, {
      ...this.peoples[idx],
      ...fields,
      instructors:
        instructor !== undefined
          ? instructor
            ? { id: 0, people_id: id }
            : null
          : this.peoples[idx].instructors,
      students:
        student !== undefined
          ? student
            ? { id: 0, people_id: id }
            : null
          : this.peoples[idx].students,
      partners:
        partner !== undefined
          ? partner
            ? { id: 0, people_id: id, ...partner }
            : null
          : this.peoples[idx].partners,
      employees:
        employee !== undefined
          ? employee
            ? { id: 0, people_id: id }
            : null
          : this.peoples[idx].employees,
    });
    this.peoples[idx] = updated;
    return updated;
  }

  async delete(id: number) {
    const idx = this.peoples.findIndex((p) => p.id === id);
    if (idx !== -1) this.peoples.splice(idx, 1);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.peoples.filter((p) => ids.includes(p.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Um ou mais registros não foram encontrados');
    this.peoples = this.peoples.filter((p) => !ids.includes(p.id));
  }

  async getStats() {
    return this.stats;
  }
}
