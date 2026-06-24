import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePeopleDto } from './dto/create-people.dto';
import { FindAllPeoplesDto } from './dto/find-all-peoples.dto';
import { UpdatePeopleDto } from './dto/update-people.dto';
import { People } from './model/people.model';
import {
  IPeoplesRepository,
  PEOPLES_REPOSITORY,
} from './repository/peoples/peoples-repository.interface';

type PeopleCategory = 'instructor' | 'student' | 'partner' | 'employee';

type CategoryEntry = [
  (
    | People['instructors']
    | People['students']
    | People['partners']
    | People['employees']
  ),
  PeopleCategory,
];

function withCategories(c: People): People & { categories: PeopleCategory[] } {
  const entries: CategoryEntry[] = [
    [c.instructors, 'instructor'],
    [c.students, 'student'],
    [c.partners, 'partner'],
    [c.employees, 'employee'],
  ];

  const categories = entries
    .filter(([val]) => val != null)
    .map(([, label]) => label);

  return { ...c, categories };
}

@Injectable()
export class PeoplesService {
  constructor(
    @Inject(PEOPLES_REPOSITORY)
    private readonly peoplesRepository: IPeoplesRepository,
  ) {}

  async findAll(dto: FindAllPeoplesDto) {
    const result = await this.peoplesRepository.findAll(dto);

    return {
      ...result,
      data: result.data.map(withCategories),
    };
  }

  async findOne(id: number) {
    const people = await this.peoplesRepository.findById(id);

    if (!people) throw new NotFoundException(`Pessoa ${id} não encontrada`);

    return withCategories(people);
  }

  async create(dto: CreatePeopleDto) {
    const existingEmail = await this.peoplesRepository.findByEmail(dto.email);

    if (existingEmail) throw new ConflictException('E-mail já cadastrado');

    const existingCpf = await this.peoplesRepository.findByCpf(dto.cpf);

    if (existingCpf) throw new ConflictException('CPF já cadastrado');

    const people = await this.peoplesRepository.create(dto);

    return withCategories(people);
  }

  async update(id: number, dto: UpdatePeopleDto) {
    await this.findOne(id);

    if (dto.email) {
      const emailOwner = await this.peoplesRepository.findByEmail(dto.email);

      if (emailOwner && emailOwner.id !== id)
        throw new ConflictException('E-mail já cadastrado');
    }

    if (dto.cpf) {
      const cpfOwner = await this.peoplesRepository.findByCpf(dto.cpf);

      if (cpfOwner && cpfOwner.id !== id)
        throw new ConflictException('CPF já cadastrado');
    }

    const people = await this.peoplesRepository.update(id, dto);

    return withCategories(people);
  }

  async delete(id: number) {
    await this.findOne(id);
    await this.peoplesRepository.delete(id);
  }

  bulkDelete(ids: number[]) {
    return this.peoplesRepository.bulkDelete(ids);
  }

  getStats() {
    return this.peoplesRepository.getStats();
  }
}
