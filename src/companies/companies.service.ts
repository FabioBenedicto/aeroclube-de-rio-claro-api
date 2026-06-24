import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateCompanyDto } from './dto/create-company.dto';
import { FindAllCompaniesDto } from './dto/find-all-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  COMPANIES_REPOSITORY,
  ICompaniesRepository,
} from './repository/companies-repository.interface';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(COMPANIES_REPOSITORY)
    private readonly companiesRepository: ICompaniesRepository,
  ) {}

  findAll(query: FindAllCompaniesDto) {
    return this.companiesRepository.findAll(query);
  }

  async findOne(id: number) {
    const company = await this.companiesRepository.findById(id);

    if (!company) throw new NotFoundException(`Empresa ${id} não encontrada`);

    return company;
  }

  async create(dto: CreateCompanyDto) {
    const [byCnpj, byEmail] = await Promise.all([
      this.companiesRepository.findByCnpj(dto.cnpj),
      this.companiesRepository.findByEmail(dto.email),
    ]);

    if (byCnpj) throw new ConflictException('CNPJ já cadastrado');
    if (byEmail) throw new ConflictException('E-mail já cadastrado');

    return this.companiesRepository.create(dto);
  }

  async update(id: number, dto: UpdateCompanyDto) {
    await this.findOne(id);

    if (dto.cnpj) {
      const byCnpj = await this.companiesRepository.findByCnpj(dto.cnpj);
      if (byCnpj && byCnpj.id !== id)
        throw new ConflictException('CNPJ já cadastrado');
    }

    if (dto.email) {
      const byEmail = await this.companiesRepository.findByEmail(dto.email);
      if (byEmail && byEmail.id !== id)
        throw new ConflictException('E-mail já cadastrado');
    }

    return this.companiesRepository.update(id, dto);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.companiesRepository.delete(id);
  }

  bulkDelete(ids: number[]) {
    return this.companiesRepository.bulkDelete(ids);
  }
}
