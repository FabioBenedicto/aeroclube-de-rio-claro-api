import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

function computeCategories(c: {
  instructors: unknown[];
  students: unknown[];
  partners: unknown[];
}) {
  const cats: string[] = [];
  if (c.instructors.length) cats.push('instrutor');
  if (c.students.length) cats.push('aluno');
  if (c.partners.length) cats.push('socio');
  return cats;
}

function withCategories<
  T extends { instructors: unknown[]; students: unknown[]; partners: unknown[] },
>(c: T) {
  return { ...c, categories: computeCategories(c) };
}

@Injectable()
export class CustomersService {
  constructor(private readonly repo: CustomersRepository) {}

  async findAll() {
    const list = await this.repo.findAll();
    return list.map(withCategories);
  }

  async findOne(id: number) {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException(`Cliente ${id} não encontrado`);
    return withCategories(c);
  }

  async create(dto: CreateCustomerDto) {
    const c = await this.repo.create({
      cpf: dto.cpf,
      name: dto.name,
      email: dto.email,
      phone_number: dto.phone_number,
      flight_hour_balance: dto.flight_hour_balance ?? 0,
    });
    return withCategories(c);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    await this.findOne(id);
    const c = await this.repo.update(id, dto);
    return withCategories(c);
  }
}
