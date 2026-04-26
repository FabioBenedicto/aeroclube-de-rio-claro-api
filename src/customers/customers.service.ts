import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    try {
      const c = await this.repo.create({
        cpf: dto.cpf,
        name: dto.name,
        email: dto.email,
        phone_number: dto.phone_number,
        flight_hour_balance: dto.flight_hour_balance ?? 0,
      });

      return withCategories(c);
    } catch (err) {
      this.handleUniqueViolation(err);
      throw err;
    }
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    if (!customer) {
      throw new NotFoundException(`Cliente ${id} não encontrado`);
    }

    try {
      const updatedCustomer = await this.repo.update(id, dto);
      return withCategories(updatedCustomer);
    } catch (err) {
      this.handleUniqueViolation(err);
      throw err;
    }
  }

  private handleUniqueViolation(err: unknown): void {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      const fields = (err.meta?.target as string[]) ?? [];
      if (fields.includes('cpf')) throw new ConflictException('CPF já cadastrado');
      if (fields.includes('email')) throw new ConflictException('E-mail já cadastrado');
      throw new ConflictException('Dado duplicado');
    }
  }
}
