import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanesRepository } from './planes.repository';

export class CreatePlaneDto {
  registration: string;
  model?: string;
  flight_hour_value: number;
  status?: string;
}

export class UpdatePlaneDto {
  model?: string;
  flight_hour_value?: number;
  status?: string;
}

@Injectable()
export class PlanesService {
  constructor(private readonly repo: PlanesRepository) {}

  findAll() { return this.repo.findAll(); }

  async findOne(id: number) {
    const plane = await this.repo.findById(id);
    if (!plane) throw new NotFoundException(`Aeronave ${id} não encontrada`);
    return plane;
  }

  create(dto: CreatePlaneDto) {
    return this.repo.create({
      registration: dto.registration,
      model: dto.model,
      flight_hour_value: dto.flight_hour_value,
      status: dto.status ?? 'active',
    });
  }

  async update(id: number, dto: UpdatePlaneDto) {
    await this.findOne(id);
    return this.repo.update(id, dto);
  }
}
