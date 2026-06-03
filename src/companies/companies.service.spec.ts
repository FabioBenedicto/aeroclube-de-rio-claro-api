import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from './companies.repository';

const mockRepo = () => ({
  findAll:  jest.fn(),
  findById: jest.fn(),
  create:   jest.fn(),
  update:   jest.fn(),
  delete:   jest.fn(),
});

const baseCompany = { id: 1, name: 'Acme' };

describe('CompaniesService', () => {
  let service: CompaniesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: CompaniesRepository, useFactory: mockRepo },
      ],
    }).compile();
    service = module.get(CompaniesService);
    repo    = module.get(CompaniesRepository);
  });

  it('findOne returns company when found', async () => {
    repo.findById.mockResolvedValue(baseCompany);
    expect(await service.findOne(1)).toEqual(baseCompany);
  });

  it('findOne throws NotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('delete throws NotFoundException when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.delete(99)).rejects.toThrow(NotFoundException);
  });
});
