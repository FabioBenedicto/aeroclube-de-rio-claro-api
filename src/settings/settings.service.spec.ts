import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';

const mockRepo = () => ({ find: jest.fn(), upsert: jest.fn() });

describe('SettingsService', () => {
  let service: SettingsService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: SettingsRepository, useFactory: mockRepo },
      ],
    }).compile();
    service = module.get(SettingsService);
    repo    = module.get(SettingsRepository);
  });

  it('get returns settings when configured', async () => {
    const settings = { id: 1, instructor_percentage: 10 };
    repo.find.mockResolvedValue(settings);
    expect(await service.get()).toEqual(settings);
  });

  it('get throws NotFoundException when not configured', async () => {
    repo.find.mockResolvedValue(null);
    await expect(service.get()).rejects.toThrow(NotFoundException);
  });

  it('upsert delegates to repository', async () => {
    const dto = { instructor_percentage: 15 } as any;
    repo.upsert.mockResolvedValue({ id: 1, ...dto });
    await service.upsert(dto);
    expect(repo.upsert).toHaveBeenCalledWith(dto);
  });
});
