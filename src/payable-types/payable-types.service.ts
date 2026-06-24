import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreatePayableTypeDto } from './dto/create-payable-type.dto';
import { UpdatePayableTypeDto } from './dto/update-payable-type.dto';
import {
  IPayableTypesRepository,
  PAYABLE_TYPES_REPOSITORY,
} from './repository/payable-types-repository.interface';

@Injectable()
export class PayableTypesService {
  constructor(
    @Inject(PAYABLE_TYPES_REPOSITORY)
    private readonly repo: IPayableTypesRepository,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: number) {
    const type = await this.repo.findById(id);

    if (!type)
      throw new NotFoundException(`Tipo de pagável ${id} não encontrado`);

    return type;
  }

  async findByName(name: string) {
    const type = await this.repo.findByName(name);
    if (!type)
      throw new NotFoundException(`Tipo de pagável '${name}' não encontrado`);

    return type;
  }

  create(dto: CreatePayableTypeDto) {
    return this.repo.create(dto.name);
  }

  async update(id: number, dto: UpdatePayableTypeDto) {
    await this.findById(id);
    return this.repo.update(id, dto.name);
  }

  async delete(id: number) {
    await this.findById(id);

    const count = await this.repo.countUsages(id);

    if (count > 0)
      throw new BadRequestException(
        'Tipo em uso por pagáveis existentes e não pode ser removido',
      );

    return this.repo.delete(id);
  }
}
