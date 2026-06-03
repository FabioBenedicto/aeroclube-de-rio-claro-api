import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly repo: CompaniesRepository) {}

  async findAll(search?: string, dateFrom?: string, dateTo?: string, page = 1, limit = 20) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    const { data, total } = await this.repo.findAll(search, from, to, page, limit);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const company = await this.repo.findById(id);
    if (!company) throw new NotFoundException(`Company ${id} not found`);
    return company;
  }

  async create(dto: CreateCompanyDto) {
    return this.repo.create(dto);
  }

  async update(id: number, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
