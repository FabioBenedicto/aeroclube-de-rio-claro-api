import { Paginated } from '../../common/dto/pagination.dto';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { FindAllCompaniesDto } from '../dto/find-all-companies.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { Company } from '../model/company.model';

export interface ICompaniesRepository {
  findAll(dto: FindAllCompaniesDto): Promise<Paginated<Company>>;
  findById(id: number): Promise<Company | null>;
  findByCnpj(cnpj: string): Promise<Company | null>;
  findByEmail(email: string): Promise<Company | null>;
  create(data: CreateCompanyDto): Promise<Company>;
  update(id: number, data: UpdateCompanyDto): Promise<Company>;
  delete(id: number): Promise<void>;
  bulkDelete(ids: number[]): Promise<void>;
}

export const COMPANIES_REPOSITORY = Symbol('ICompaniesRepository');
