import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ReceivableTypesService } from './receivable-types.service';
import { FakeReceivableTypesRepository } from './repository/fake-receivable-types.repository';
import { RECEIVABLE_TYPES_REPOSITORY } from './repository/receivable-types-repository.interface';

describe('ReceivableTypesService', () => {
  let service: ReceivableTypesService;
  let repo: FakeReceivableTypesRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReceivableTypesService,
        {
          provide: RECEIVABLE_TYPES_REPOSITORY,
          useClass: FakeReceivableTypesRepository,
        },
      ],
    }).compile();

    service = module.get(ReceivableTypesService);
    repo = module.get<FakeReceivableTypesRepository>(
      RECEIVABLE_TYPES_REPOSITORY,
    );
  });

  describe('findAll', () => {
    it('returns all types', async () => {
      await repo.create(faker.word.noun());
      await repo.create(faker.word.noun());
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('returns type when found', async () => {
      const created = await repo.create(faker.word.noun());
      const result = await service.findById(created.id);
      expect(result.id).toBe(created.id);
    });

    it('throws NotFoundException when type not found', async () => {
      await expect(
        service.findById(faker.number.int({ min: 100, max: 999 })),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByName', () => {
    it('returns type when found by name', async () => {
      const name = faker.word.noun().toUpperCase();
      await repo.create(name);
      const result = await service.findByName(name);
      expect(result.name).toBe(name);
    });

    it('throws NotFoundException when name not found', async () => {
      await expect(service.findByName(faker.word.noun())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates and returns a new type', async () => {
      const name = faker.word.noun().toUpperCase();
      const result = await service.create({ name });
      expect(result.name).toBe(name);
      expect(repo.types).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('throws NotFoundException when type does not exist', async () => {
      await expect(
        service.update(faker.number.int({ min: 100, max: 999 }), {
          name: faker.word.noun(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updates the type name', async () => {
      const created = await repo.create(faker.word.noun());
      const newName = faker.word.noun().toUpperCase();
      const result = await service.update(created.id, { name: newName });
      expect(result.name).toBe(newName);
    });
  });

  describe('delete', () => {
    it('throws NotFoundException when type does not exist', async () => {
      await expect(
        service.delete(faker.number.int({ min: 100, max: 999 })),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when type is in use', async () => {
      const created = await repo.create(faker.word.noun());
      repo.usageCounts.set(created.id, faker.number.int({ min: 1, max: 10 }));
      await expect(service.delete(created.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deletes type when not in use', async () => {
      const created = await repo.create(faker.word.noun());
      await service.delete(created.id);
      expect(repo.types).toHaveLength(0);
    });
  });
});
