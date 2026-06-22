import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ReceivableTypesRepository } from './repository/receivable-types.repository';
import { ReceivableTypesService } from './receivable-types.service';

describe('ReceivableTypesService', () => {
  let service: ReceivableTypesService;
  let repo: jest.Mocked<ReceivableTypesRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReceivableTypesService,
        {
          provide: ReceivableTypesRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn(),
            findByName: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            countUsages: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile();

    service = module.get(ReceivableTypesService);
    repo = module.get(ReceivableTypesRepository);
  });

  it('throws NotFoundException when type not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findById(99)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when type name not found', async () => {
    repo.findByName.mockResolvedValue(null);
    await expect(service.findByName('NONEXISTENT')).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when deleting type in use', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'FLIGHT', created_at: new Date() });
    repo.countUsages.mockResolvedValue(3);
    await expect(service.delete(1)).rejects.toThrow(BadRequestException);
  });

  it('deletes type when not in use', async () => {
    repo.findById.mockResolvedValue({ id: 1, name: 'OTHER', created_at: new Date() });
    repo.countUsages.mockResolvedValue(0);
    repo.delete.mockResolvedValue(undefined);
    await service.delete(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});
