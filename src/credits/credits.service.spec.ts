import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsRepository } from './credits.repository';

const mockRepo = () => ({
  findPerson:   jest.fn(),
  getMovements: jest.fn(),
  addCredit:    jest.fn(),
});

const basePerson = { id: 1, flight_hour_balance: 5 };

describe('CreditsService', () => {
  let service: CreditsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        { provide: CreditsRepository, useFactory: mockRepo },
      ],
    }).compile();
    service = module.get(CreditsService);
    repo    = module.get(CreditsRepository);
  });

  describe('getPersonCredits', () => {
    it('returns credits data when person found', async () => {
      repo.findPerson.mockResolvedValue(basePerson);
      repo.getMovements.mockResolvedValue([]);
      const result = await service.getPersonCredits(1);
      expect(result.person_id).toBe(1);
      expect(result.flight_hour_balance).toBe(5);
    });

    it('throws NotFoundException when person not found', async () => {
      repo.findPerson.mockResolvedValue(null);
      await expect(service.getPersonCredits(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addCredit', () => {
    it('adds credit and returns updated balance', async () => {
      repo.findPerson.mockResolvedValue(basePerson);
      repo.addCredit.mockResolvedValue({ ...basePerson, flight_hour_balance: 15 });
      const result = await service.addCredit(1, { amount: 10 } as any);
      expect(result.flight_hour_balance).toBe(15);
      expect(result.added).toBe(10);
    });

    it('throws NotFoundException when person not found', async () => {
      repo.findPerson.mockResolvedValue(null);
      await expect(service.addCredit(99, { amount: 10 } as any)).rejects.toThrow(NotFoundException);
    });
  });
});
