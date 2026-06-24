import { UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreateCompanyDto } from '../dto/create-company.dto';
import { FindAllCompaniesDto } from '../dto/find-all-companies.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../model/company.model';
import { ICompaniesRepository } from './companies-repository.interface';

export class FakeCompaniesRepository implements ICompaniesRepository {
  items: Company[] = [];
  private nextId = 1;

  async findAll({
    search,
    date_from,
    date_to,
    page = 1,
    limit = 20,
  }: FindAllCompaniesDto) {
    let data = [...this.items];

    if (search) {
      const term = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.cnpj ?? '').includes(term) ||
          (c.email ?? '').toLowerCase().includes(term),
      );
    }

    if (date_from) data = data.filter((c) => c.created_at >= date_from);
    if (date_to) data = data.filter((c) => c.created_at <= date_to);

    const total = data.length;

    return {
      data: data
        .slice((page - 1) * limit, page * limit)
        .map((c) => plainToInstance(Company, c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCnpj(cnpj: string) {
    const c = this.items.find((c) => c.cnpj === cnpj);
    return c ? plainToInstance(Company, c) : null;
  }

  async findByEmail(email: string) {
    const c = this.items.find((c) => c.email === email);
    return c ? plainToInstance(Company, c) : null;
  }

  async findById(id: number) {
    const c = this.items.find((c) => c.id === id);
    return c ? plainToInstance(Company, c) : null;
  }

  async create(data: CreateCompanyDto) {
    const company = {
      ...data,
      id: this.nextId++,
      cnpj: data.cnpj ?? null,
      email: data.email ?? null,
      phone: data.phone ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.items.push(company);
    return plainToInstance(Company, company);
  }

  async update(id: number, data: UpdateCompanyDto) {
    const idx = this.items.findIndex((c) => c.id === id);
    this.items[idx] = { ...this.items[idx], ...data, updated_at: new Date() };
    return plainToInstance(Company, this.items[idx]);
  }

  async delete(id: number) {
    const idx = this.items.findIndex((c) => c.id === id);
    this.items.splice(idx, 1);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.items.filter((c) => ids.includes(c.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Uma ou mais empresas não foram encontradas');
    this.items = this.items.filter((c) => !ids.includes(c.id));
  }
}
