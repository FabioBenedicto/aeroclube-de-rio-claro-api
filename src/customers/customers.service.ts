import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CustomersRepository } from './customers.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

function withCategories<
  T extends {
    instructors: unknown[];
    students: unknown[];
    partners: unknown[];
  },
>(c: T) {
  const categories = [
    [c.instructors, 'instrutor'],
    [c.students, 'aluno'],
    [c.partners, 'socio'],
  ]
    .filter(([arr]) => (arr as unknown[]).length)
    .map(([, label]) => label as string);

  return { ...c, categories };
}

@Injectable()
export class CustomersService {
  constructor(private readonly repo: CustomersRepository) {}

  async findAll() {
    const list = await this.repo.findAll();
    return list.map(withCategories);
  }

  async findOne(id: number) {
    const customer = await this.repo.findById(id);

    if (!customer) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }

    return withCategories(customer);
  }

  async create(dto: CreateCustomerDto) {
    const cpfAlreadyExists = await this.repo.findByCpf(dto.cpf);

    if (cpfAlreadyExists) {
      throw new ConflictException('CPF já cadastrado');
    }

    const emailAlreadyExists = await this.repo.findByEmail(dto.email);

    if (emailAlreadyExists) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const c = await this.repo.create({
      ...dto,
      flight_hour_balance: dto.flight_hour_balance ?? 0,
    });

    return withCategories(c);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }

    if (dto.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing && existing.id !== id)
        throw new ConflictException('E-mail já cadastrado');
    }

    const updatedCustomer = await this.repo.update(id, dto);
    return withCategories(updatedCustomer);
  }
}
