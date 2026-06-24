import { faker } from '@faker-js/faker';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AircraftService } from './aircraft.service';
import { EAircraftType } from './enums/aircraft-type.enum';
import {
  AIRCRAFT_REPOSITORY,
  IAircraftRepository,
} from './repository/aircraft-repository.interface';
import { FakeAircraftRepository } from './repository/fake-aircraft.repository';

describe('AircraftService', () => {
  let aircraftService: AircraftService;
  let aircraftRepository: IAircraftRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AircraftService,
        {
          provide: AIRCRAFT_REPOSITORY,
          useClass: FakeAircraftRepository,
        },
      ],
    }).compile();

    aircraftService = module.get(AircraftService);
    aircraftRepository = module.get<IAircraftRepository>(AIRCRAFT_REPOSITORY);
  });

  describe('findOne', () => {
    it('returns aircraft when found', async () => {
      const aircraft = await aircraftRepository.create({
        registration: 'PP-ABC',
        model: 'Cessna',
        type: EAircraftType.AIRPLANE,
        flight_hour_value: 500,
      });

      expect(await aircraftService.findOne(aircraft.id)).toEqual(aircraft);
    });

    it('throws NotFoundException when not found', async () => {
      await expect(aircraftService.findOne(faker.number.int())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates airplane with flight_hour_value', async () => {
      const aircraft = await aircraftService.create({
        registration: 'PP-ABC',
        model: 'Cessna 152',
        type: EAircraftType.AIRPLANE,
        flight_hour_value: 500,
      });

      expect(aircraft.registration).toBe('PP-ABC');
      expect(aircraft.flight_hour_value).toBe(500);
    });

    it('throws ConflictException when registration is taken', async () => {
      await aircraftRepository.create({
        registration: 'PP-ABC',
        model: 'Cessna 152',
        type: EAircraftType.AIRPLANE,
        flight_hour_value: 500,
      });

      await expect(
        aircraftService.create({
          registration: 'PP-ABC',
          model: 'Cessna 152',
          type: EAircraftType.AIRPLANE,
          flight_hour_value: 500,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws BadRequestException for airplane without flight_hour_value', async () => {
      await expect(
        aircraftService.create({
          registration: 'PP-XYZ',
          model: 'Cessna 152',
          type: EAircraftType.AIRPLANE,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates glider without flight_hour_value', async () => {
      const aircraft = await aircraftService.create({
        registration: 'PP-GLI',
        model: 'Planador',
        type: EAircraftType.GLIDER,
      });

      expect(aircraft.flight_hour_value).toBeNull();
    });
  });
});
