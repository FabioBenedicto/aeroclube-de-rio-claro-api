import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERoles } from './enums/roles.enum';
import {
  IUsersRepository,
  USERS_REPOSITORY,
} from './repository/users-repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  findAll(query: FindAllUsersDto) {
    return this.usersRepository.findAll(query);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);

    if (existing) throw new ConflictException('E-mail já cadastrado');

    const password = await bcrypt.hash(dto.password, 10);

    return this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password,
      role: dto.role,
      permissions: dto.role === ERoles.ADMIN ? [] : (dto.permissions ?? []),
    });
  }

  async update(id: number, dto: UpdateUserDto, requesterId?: number) {
    const existing = await this.usersRepository.findById(id);

    if (!existing) throw new NotFoundException('Usuário não encontrado');

    if (requesterId !== undefined && requesterId === id) {
      throw new ForbiddenException('Não é possível editar sua própria conta');
    }

    if (
      requesterId !== undefined &&
      requesterId !== id &&
      existing.role === ERoles.ADMIN
    ) {
      throw new ForbiddenException('Não é possível editar outro administrador');
    }

    const data: Partial<{
      name: string;
      email: string;
      password: string;
      role: ERoles;
    }> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    const permissions = dto.role === ERoles.ADMIN ? [] : dto.permissions;

    return this.usersRepository.update(id, data, permissions);
  }

  async updateMe(id: number, dto: UpdateMeDto) {
    const user = await this.usersRepository.findById(id);

    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (dto.password) {
      if (!dto.currentPassword)
        throw new BadRequestException('Informe a senha atual para alterá-la');

      const valid = await bcrypt.compare(dto.currentPassword, user.password);

      if (!valid) throw new UnauthorizedException('Senha atual incorreta');
    }

    return this.update(id, {
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
  }

  async removeSelf(id: number) {
    const existing = await this.usersRepository.findById(id);

    if (!existing) throw new NotFoundException('Usuário não encontrado');

    return this.usersRepository.delete(id);
  }

  async delete(id: number, requesterId?: number) {
    if (requesterId !== undefined && requesterId === id) {
      throw new ForbiddenException('Não é possível excluir sua própria conta');
    }

    const existing = await this.usersRepository.findById(id);

    if (!existing) throw new NotFoundException('Usuário não encontrado');

    if (existing.role === ERoles.ADMIN) {
      throw new ForbiddenException('Não é possível excluir um administrador');
    }

    return this.usersRepository.delete(id);
  }
}
