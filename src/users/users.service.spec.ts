import { faker } from '@faker-js/faker';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

import { User } from './model/user.model';
import { FakeUsersRepository } from './repository/fake-users.repository';
import { USERS_REPOSITORY } from './repository/users-repository.interface';
import { UsersService } from './users.service';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  role: Role.USER,
  created_at: faker.date.past(),
  updated_at: faker.date.recent(),
  permissions: [],
  ...overrides,
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: FakeUsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useClass: FakeUsersRepository,
        },
      ],
    }).compile();
    service = module.get(UsersService);
    repo = module.get<FakeUsersRepository>(USERS_REPOSITORY);
  });

  describe('findAll', () => {
    it('returns paginated users', async () => {
      const permission = faker.word.noun();
      repo.users = [makeUser({ id: 1, permissions: [permission] })];
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data[0].permissions).toEqual([permission]);
      expect(result.total).toBe(1);
    });

    it('filters by search term', async () => {
      const target = makeUser({
        id: 1,
        name: 'Zephyr Unique',
        email: 'zephyr@unique.com',
      });
      repo.users = [makeUser({ id: 2 }), target];
      const result = await service.findAll({
        page: 1,
        limit: 20,
        search: 'zephyr',
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe(target.name);
    });
  });

  describe('create', () => {
    it('hashes password and creates user', async () => {
      const password = faker.internet.password();
      await service.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password,
        role: Role.USER,
        permissions: [],
      });
      const created = repo.users[0];
      expect(created.password).not.toBe(password);
      expect(await bcrypt.compare(password, created.password)).toBe(true);
    });

    it('throws ConflictException when email already exists', async () => {
      const email = faker.internet.email();
      repo.users = [makeUser({ email })];
      await expect(
        service.create({
          name: faker.person.fullName(),
          email,
          password: faker.internet.password(),
          role: Role.USER,
          permissions: [],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates user and returns result', async () => {
      const newName = faker.person.fullName();
      repo.users = [makeUser({ id: 1 })];
      const result = await service.update(1, { name: newName });
      expect(result!.name).toBe(newName);
      expect(Array.isArray(result!.permissions)).toBe(true);
    });

    it('throws NotFoundException when user does not exist', async () => {
      await expect(
        service.update(faker.number.int({ min: 100 }), {
          name: faker.person.fullName(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('hashes new password when provided', async () => {
      const newPassword = faker.internet.password();
      repo.users = [makeUser({ id: 1 })];
      await service.update(1, { password: newPassword });
      expect(await bcrypt.compare(newPassword, repo.users[0].password)).toBe(
        true,
      );
    });

    it('throws ForbiddenException when editing another admin', async () => {
      repo.users = [makeUser({ id: 1, role: Role.ADMIN })];
      await expect(
        service.update(1, { name: faker.person.fullName() }, 2),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to edit their own account', async () => {
      const newName = faker.person.fullName();
      repo.users = [makeUser({ id: 1, role: Role.ADMIN })];
      const result = await service.update(1, { name: newName }, 1);
      expect(result!.name).toBe(newName);
    });
  });

  describe('delete', () => {
    it('deletes user successfully', async () => {
      repo.users = [makeUser({ id: 1, role: Role.USER })];
      await service.delete(1, 2);
      expect(repo.users).toHaveLength(0);
    });

    it('throws ForbiddenException when deleting own account', async () => {
      const id = faker.number.int({ min: 1, max: 100 });
      await expect(service.delete(id, id)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when deleting an admin', async () => {
      repo.users = [makeUser({ id: 1, role: Role.ADMIN })];
      await expect(service.delete(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      await expect(
        service.delete(faker.number.int({ min: 100 }), 2),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
