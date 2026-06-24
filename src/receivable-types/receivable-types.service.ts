import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateReceivableTypeDto } from './dto/create-receivable-type.dto';
import { UpdateReceivableTypeDto } from './dto/update-receivable-type.dto';
import {
  IReceivableTypesRepository,
  RECEIVABLE_TYPES_REPOSITORY,
} from './repository/receivable-types-repository.interface';

@Injectable()
export class ReceivableTypesService {
  constructor(
    @Inject(RECEIVABLE_TYPES_REPOSITORY)
    private readonly receivableTypesRepository: IReceivableTypesRepository,
  ) {}

  findAll() {
    return this.receivableTypesRepository.findAll();
  }

  async findById(id: number) {
    const type = await this.receivableTypesRepository.findById(id);

    if (!type)
      throw new NotFoundException(`Tipo de recebível ${id} não encontrado`);

    return type;
  }

  async findByName(name: string) {
    const type = await this.receivableTypesRepository.findByName(name);

    if (!type)
      throw new NotFoundException(`Tipo de recebível '${name}' não encontrado`);

    return type;
  }

  create(dto: CreateReceivableTypeDto) {
    return this.receivableTypesRepository.create(dto.name);
  }

  async update(id: number, dto: UpdateReceivableTypeDto) {
    await this.findById(id);
    return this.receivableTypesRepository.update(id, dto.name);
  }

  async delete(id: number) {
    await this.findById(id);

    const count = await this.receivableTypesRepository.countUsages(id);

    if (count > 0)
      throw new BadRequestException(
        'Tipo em uso por recebíveis existentes e não pode ser removido',
      );

    return this.receivableTypesRepository.delete(id);
  }
}
