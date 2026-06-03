import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PlanesRepository } from './planes.repository';
import { CreatePlaneDto, AircraftType } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';

@Injectable()
export class PlanesService {
  constructor(private readonly repo: PlanesRepository) {}

  async findAll(page = 1, limit = 20, dateFrom?: string, dateTo?: string, search?: string, aircraftType?: string) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    const { data, total } = await this.repo.findAll(page, limit, from, to, search, aircraftType);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const plane = await this.repo.findById(id);

    if (!plane) {
      throw new NotFoundException(`Plane ${id} not found`);
    }

    return plane;
  }

  async create(dto: CreatePlaneDto) {
    const registrationOwner = await this.repo.findByRegistration(dto.registration);

    if (registrationOwner) {
      throw new ConflictException('Registration already registered');
    }

    if (dto.aircraft_type !== AircraftType.GLIDER && !dto.flight_hour_value) {
      throw new BadRequestException('Flight hour value is required for airplanes');
    }

    return this.repo.create({
      registration: dto.registration,
      model: dto.model,
      aircraft_type: dto.aircraft_type,
      flight_hour_value: dto.aircraft_type === AircraftType.GLIDER ? null : dto.flight_hour_value,
    });
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }

  async update(id: number, dto: UpdatePlaneDto) {
    await this.findOne(id);

    if (dto.registration) {
      const registrationOwner = await this.repo.findByRegistration(dto.registration);

      if (registrationOwner && registrationOwner.id !== id) {
        throw new ConflictException('Registration already registered');
      }
    }

    const updateData: any = { ...dto };
    if (dto.aircraft_type === AircraftType.GLIDER) {
      updateData.flight_hour_value = null;
    }

    return this.repo.update(id, updateData);
  }
}
