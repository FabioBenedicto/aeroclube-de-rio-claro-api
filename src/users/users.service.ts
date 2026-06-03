import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
  permissions?: string[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  permissions?: string[];
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll() {
    const users = await this.usersRepository.findAll();
    return users.map((u) => ({
      ...u,
      permissions: u.permissions.map((p) => p.permission),
    }));
  }

  async create(dto: CreateUserDto) {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.usersRepository.createUser({
      name: dto.name,
      email: dto.email,
      password,
      role: dto.role,
      permissions: dto.role === Role.ADMIN ? [] : (dto.permissions ?? []),
    });
    return { ...user!, permissions: user!.permissions.map((p) => p.permission) };
  }

  async update(id: number, dto: UpdateUserDto, requesterId?: number) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) throw new NotFoundException('Usuário não encontrado');

    if (requesterId !== undefined && requesterId !== id && existing.role === Role.ADMIN) {
      throw new ForbiddenException('Não é possível editar outro administrador');
    }

    const data: Partial<{ name: string; email: string; password: string; role: Role }> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);

    const permissions = dto.role === Role.ADMIN ? [] : dto.permissions;
    const user = await this.usersRepository.updateUser(id, data, permissions);
    return { ...user!, permissions: user!.permissions.map((p) => p.permission) };
  }

  async updateMe(id: number, dto: { name?: string; email?: string; password?: string; currentPassword?: string }) {
    if (dto.password) {
      const user = await this.usersRepository.findById(id);
      if (!user) throw new NotFoundException('Usuário não encontrado');
      if (!dto.currentPassword) throw new BadRequestException('Informe a senha atual para alterar a senha');
      const valid = await bcrypt.compare(dto.currentPassword, user.password);
      if (!valid) throw new UnauthorizedException('Senha atual incorreta');
    }
    return this.update(id, { name: dto.name, email: dto.email, password: dto.password });
  }

  async remove(id: number, requesterId: number) {
    if (id === requesterId) throw new ForbiddenException('Não é possível excluir o próprio usuário');
    const existing = await this.usersRepository.findById(id);
    if (!existing) throw new NotFoundException('Usuário não encontrado');
    if (existing.role === Role.ADMIN) {
      throw new ForbiddenException('Não é possível excluir outro administrador');
    }
    return this.usersRepository.removeUser(id);
  }

  async removeSelf(id: number) {
    const existing = await this.usersRepository.findById(id);
    if (!existing) throw new NotFoundException('Usuário não encontrado');
    return this.usersRepository.removeUser(id);
  }
}
