import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PlanesService } from './planes.service';
import { PlanesRepository } from './planes.repository';
import { AircraftType } from './dto/create-plane.dto';

const mockRepo = () => ({
  findAll:            jest.fn(),
  findById:           jest.fn(),
  findByRegistration: jest.fn(),
  create:             jest.fn(),
  update:             jest.fn(),
  delete:             jest.fn(),
});

const basePlane = { id: 1, registration: 'PP-ABC', model: 'Cessna', aircraft_type: 'airplane', flight_hour_value: 500 };

describe('PlanesService', () => {
  let service: PlanesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanesService,
        { provide: PlanesRepository, useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(PlanesService);
    repo    = module.get(PlanesRepository);
  });

  describe('findOne', () => {
    it('returns plane when found', async () => {
      repo.findById.mockResolvedValue(basePlane);
      expect(await service.findOne(1)).toEqual(basePlane);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates airplane with flight_hour_value', async () => {
      repo.findByRegistration.mockResolvedValue(null);
      repo.create.mockResolvedValue(basePlane);
      await service.create({ registration: 'PP-ABC', aircraft_type: AircraftType.AIRPLANE, flight_hour_value: 500 } as any);
      expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when registration is taken', async () => {
      repo.findByRegistration.mockResolvedValue(basePlane);
      await expect(service.create({ registration: 'PP-ABC', aircraft_type: AircraftType.AIRPLANE, flight_hour_value: 500 } as any))
        .rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException for airplane without flight_hour_value', async () => {
      repo.findByRegistration.mockResolvedValue(null);
      await expect(service.create({ registration: 'PP-XYZ', aircraft_type: AircraftType.AIRPLANE } as any))
        .rejects.toThrow(BadRequestException);
    });

    it('creates glider without flight_hour_value', async () => {
      repo.findByRegistration.mockResolvedValue(null);
      repo.create.mockResolvedValue({ ...basePlane, aircraft_type: AircraftType.GLIDER, flight_hour_value: null });
      await service.create({ registration: 'PP-GLI', aircraft_type: AircraftType.GLIDER } as any);
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ flight_hour_value: null }));
    });
  });
});
