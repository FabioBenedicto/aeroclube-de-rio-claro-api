import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PeoplesService } from './peoples.service';
import { PeoplesRepository } from './peoples.repository';

const mockRepo = () => ({
  findAll:     jest.fn(),
  findById:    jest.fn(),
  findByCpf:   jest.fn(),
  findByEmail: jest.fn(),
  create:      jest.fn(),
  update:      jest.fn(),
  delete:      jest.fn(),
  getStats:    jest.fn(),
});

const basePerson = {
  id: 1, name: 'Alice', cpf: '123', email: 'a@b.com',
  instructors: [], students: [], partners: [], employees: [],
};

describe('PeoplesService', () => {
  let service: PeoplesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeoplesService,
        { provide: PeoplesRepository, useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(PeoplesService);
    repo    = module.get(PeoplesRepository);
  });

  describe('findOne', () => {
    it('returns person with categories when found', async () => {
      repo.findById.mockResolvedValue({ ...basePerson, instructors: [{ id: 10 }] });
      const result = await service.findOne(1);
      expect(result.categories).toEqual(['instructor']);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a person when CPF and email are unique', async () => {
      repo.findByCpf.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(basePerson);
      const result = await service.create({ cpf: '123', name: 'Alice', email: 'a@b.com' } as any);
      expect(result.categories).toEqual([]);
      expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when CPF is taken', async () => {
      repo.findByCpf.mockResolvedValue(basePerson);
      await expect(service.create({ cpf: '123', name: 'Alice', email: 'a@b.com' } as any))
        .rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when email is taken', async () => {
      repo.findByCpf.mockResolvedValue(null);
      repo.findByEmail.mockResolvedValue(basePerson);
      await expect(service.create({ cpf: '999', name: 'Alice', email: 'a@b.com' } as any))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('deletes person when found', async () => {
      repo.findById.mockResolvedValue(basePerson);
      repo.delete.mockResolvedValue(basePerson);
      await service.delete(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    });
  });
});
