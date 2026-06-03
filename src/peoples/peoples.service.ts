import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PeoplesRepository } from './peoples.repository';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

function withCategories<
  T extends {
    instructors: unknown[];
    students: unknown[];
    partners: unknown[];
    employees: unknown[];
  },
>(c: T) {
  const categories = [
    [c.instructors, 'instructor'],
    [c.students,   'student'],
    [c.partners,   'partner'],
    [c.employees,  'employee'],
  ]
    .filter(([arr]) => (arr as unknown[]).length)
    .map(([, label]) => label as string);

  return { ...c, categories };
}

@Injectable()
export class PeoplesService {
  constructor(private readonly repo: PeoplesRepository) {}

  async findAll(search?: string, category?: string, dateFrom?: string, dateTo?: string, page = 1, limit = 20) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to   = dateTo   ? new Date(dateTo)   : undefined;
    const { data, total } = await this.repo.findAll(search, category, from, to, page, limit);
    return { data: data.map(withCategories), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const person = await this.repo.findById(id);
    if (!person) throw new NotFoundException(`Person ${id} not found`);
    return withCategories(person);
  }

  async create(dto: CreatePersonDto) {
    if (await this.repo.findByCpf(dto.cpf))    throw new ConflictException('CPF already registered');
    if (await this.repo.findByEmail(dto.email)) throw new ConflictException('Email already registered');

    const { instructor, student, partner, employee, ...fields } = dto;

    const person = await this.repo.create({
      ...fields,
      flight_hour_balance: fields.flight_hour_balance ?? 0,
      ...(instructor && { instructors: { create: instructor } }),
      ...(student    && { students:    { create: student    } }),
      ...(partner    && { partners:    { create: partner    } }),
      ...(employee   && { employees:   { create: employee   } }),
    });

    return withCategories(person);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async update(id: number, dto: UpdatePersonDto) {
    const existing = await this.findOne(id);

    if (dto.cpf) {
      const owner = await this.repo.findByCpf(dto.cpf);
      if (owner && owner.id !== id) throw new ConflictException('CPF already registered');
    }

    if (dto.email) {
      const owner = await this.repo.findByEmail(dto.email);
      if (owner && owner.id !== id) throw new ConflictException('Email already registered');
    }

    const { instructor, student, partner, employee, ...fields } = dto;
    const data: Prisma.PersonUpdateInput = { ...fields };

    if (instructor !== undefined) {
      const e = existing.instructors[0] as { id: number } | undefined;
      data.instructors = e
        ? { update: { where: { id: e.id }, data: instructor } }
        : { create: instructor as any };
    }

    if (student !== undefined) {
      const e = existing.students[0] as { id: number } | undefined;
      data.students = e
        ? { update: { where: { id: e.id }, data: student } }
        : { create: student as any };
    }

    if (partner !== undefined) {
      const e = existing.partners[0] as { id: number } | undefined;
      data.partners = e
        ? { update: { where: { id: e.id }, data: partner } }
        : { create: partner as any };
    }

    if (employee !== undefined) {
      const e = existing.employees[0] as { id: number } | undefined;
      data.employees = e
        ? { update: { where: { id: e.id }, data: employee } }
        : { create: employee as any };
    }

    return withCategories(await this.repo.update(id, data));
  }

  getStats() {
    return this.repo.getStats();
  }
}
