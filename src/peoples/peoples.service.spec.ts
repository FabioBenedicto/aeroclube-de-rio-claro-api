import { faker } from '@faker-js/faker';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PeoplesService } from './peoples.service';
import { FakePeoplesRepository } from './repository/peoples/fake-peoples.repository';
import { PEOPLES_REPOSITORY } from './repository/peoples/peoples-repository.interface';

const makePeople = (overrides: Record<string, unknown> = {}) => ({
  id: faker.number.int(),
  name: faker.person.fullName(),
  cpf: faker.string.numeric(11),
  email: faker.internet.email(),
  phone_number: null,
  credit_balance: null,
  address: null,
  neighborhood: null,
  city: null,
  state: null,
  zip_code: null,
  created_at: new Date(),
  updated_at: new Date(),
  studentId: 0,
  instructors: null,
  students: null,
  partners: null,
  employees: null,
  ...overrides,
});

describe('PeoplesService', () => {
  let service: PeoplesService;
  let repo: FakePeoplesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeoplesService,
        {
          provide: PEOPLES_REPOSITORY,
          useClass: FakePeoplesRepository,
        },
      ],
    }).compile();

    service = module.get(PeoplesService);
    repo = module.get<FakePeoplesRepository>(PEOPLES_REPOSITORY);
    repo.peoples = [];
  });

  describe('findOne', () => {
    it('returns person with categories when found', async () => {
      const people = makePeople({
        id: 1,
        instructors: { id: faker.number.int(), people_id: 1 },
      });
      repo.peoples = [people];
      const result = await service.findOne(1);
      expect(result.categories).toEqual(['instructor']);
    });

    it('throws NotFoundException when not found', async () => {
      await expect(
        service.findOne(faker.number.int({ min: 100 })),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a person when CPF and email are unique', async () => {
      const result = await service.create({
        cpf: faker.string.numeric(11),
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });
      expect(result.categories).toEqual([]);
      expect(repo.peoples).toHaveLength(1);
    });

    it('throws ConflictException when CPF is taken', async () => {
      const cpf = faker.string.numeric(11);
      repo.peoples = [makePeople({ cpf })];
      await expect(
        service.create({
          cpf,
          name: faker.person.fullName(),
          email: faker.internet.email(),
        } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when email is taken', async () => {
      const email = faker.internet.email();
      repo.peoples = [makePeople({ email })];
      await expect(
        service.create({
          cpf: faker.string.numeric(11),
          name: faker.person.fullName(),
          email,
        } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('deletes person when found', async () => {
      repo.peoples = [makePeople({ id: 1 })];
      await service.delete(1);
      expect(repo.peoples).toHaveLength(0);
    });

    it('throws NotFoundException when not found', async () => {
      await expect(
        service.delete(faker.number.int({ min: 100 })),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
