import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateReceivableTypeDto } from './dto/create-receivable-type.dto';
import { UpdateReceivableTypeDto } from './dto/update-receivable-type.dto';
import { ReceivableTypesRepository } from './repository/receivable-types.repository';

@Injectable()
export class ReceivableTypesService {
  constructor(private readonly repo: ReceivableTypesRepository) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: number) {
    const type = await this.repo.findById(id);
    if (!type) throw new NotFoundException(`Tipo de recebível ${id} não encontrado`);
    return type;
  }

  async findByName(name: string) {
    const type = await this.repo.findByName(name);
    if (!type) throw new NotFoundException(`Tipo de recebível '${name}' não encontrado`);
    return type;
  }

  create(dto: CreateReceivableTypeDto) {
    return this.repo.create(dto.name);
  }

  async update(id: number, dto: UpdateReceivableTypeDto) {
    await this.findById(id);
    if (dto.name === undefined) {
      return this.findById(id);
    }
    return this.repo.update(id, dto.name);
  }

  async delete(id: number) {
    await this.findById(id);
    const count = await this.repo.countUsages(id);
    if (count > 0)
      throw new BadRequestException(
        'Tipo em uso por recebíveis existentes e não pode ser removido',
      );
    return this.repo.delete(id);
  }
}
