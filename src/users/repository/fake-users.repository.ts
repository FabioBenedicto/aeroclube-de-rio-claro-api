import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { FindAllUsersDto } from '../dto/find-all-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../model/user.model';
import { CreateUserData, IUsersRepository } from './users-repository.interface';

@Injectable()
export class FakeUsersRepository implements IUsersRepository {
  users: User[] = [];
  private nextId = 1;

  async findById(id: number) {
    const u = this.users.find((u) => u.id === id);
    return u ? plainToInstance(User, u) : null;
  }

  async findByEmail(email: string) {
    const u = this.users.find((u) => u.email === email);
    return u ? plainToInstance(User, u) : null;
  }

  async findAll({ search, role, page, limit }: FindAllUsersDto) {
    let filtered = this.users;
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (role) {
      filtered = filtered.filter((u) => u.role === role);
    }

    const skip = (page - 1) * limit;
    const data = filtered
      .slice(skip, skip + limit)
      .map((u) => plainToInstance(User, u));
    return {
      data,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async create(data: CreateUserData) {
    const now = new Date();
    const user = {
      id: this.nextId++,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      created_at: now,
      updated_at: now,
      permissions: data.permissions,
    };
    this.users.push(user);
    return plainToInstance(User, user);
  }

  async update(
    id: number,
    data: Omit<UpdateUserDto, 'permissions'>,
    permissions?: string[],
  ) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...data, updated_at: new Date() };
    if (permissions !== undefined) {
      this.users[idx].permissions = permissions;
    }
    return plainToInstance(User, this.users[idx]);
  }

  async delete(id: number) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx !== -1) this.users.splice(idx, 1);
    return { id };
  }
}
