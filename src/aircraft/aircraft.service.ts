import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { FindAllAircraftDto } from './dto/find-all-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';
import { EAircraftType } from './enums/aircraft-type.enum';
import {
  AIRCRAFT_REPOSITORY,
  IAircraftRepository,
} from './repository/aircraft-repository.interface';

@Injectable()
export class AircraftService {
  constructor(
    @Inject(AIRCRAFT_REPOSITORY)
    private readonly aircraftRepository: IAircraftRepository,
  ) {}

  findAll(query: FindAllAircraftDto) {
    return this.aircraftRepository.findAll(query);
  }

  async findOne(id: number) {
    const aircraft = await this.aircraftRepository.findById(id);

    if (!aircraft) {
      throw new NotFoundException(`Aeronave ${id} não encontrada`);
    }

    return aircraft;
  }

  async create(dto: CreateAircraftDto) {
    const registrationOwner = await this.aircraftRepository.findByRegistration(
      dto.registration,
    );

    if (registrationOwner) {
      throw new ConflictException('Matrícula já cadastrada');
    }

    if (dto.type !== EAircraftType.GLIDER && !dto.flight_hour_value) {
      throw new BadRequestException(
        'Valor da hora de voo é obrigatório para aviões',
      );
    }

    return this.aircraftRepository.create(dto);
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.aircraftRepository.delete(id);
  }

  async update(id: number, dto: UpdateAircraftDto) {
    await this.findOne(id);

    if (dto.registration) {
      const registrationOwner =
        await this.aircraftRepository.findByRegistration(dto.registration);

      if (registrationOwner && registrationOwner.id !== id) {
        throw new ConflictException('Prefixo já cadastrado');
      }
    }

    return this.aircraftRepository.update(id, dto);
  }

  bulkDelete(ids: number[]) {
    return this.aircraftRepository.bulkDelete(ids);
  }
}
