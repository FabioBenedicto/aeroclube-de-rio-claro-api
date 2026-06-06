import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

const mockRepo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  removeUser: jest.fn(),
};

const userRow = {
  id: 1, name: 'Admin', email: 'admin@test.com', role: Role.ADMIN,
  created_at: new Date(), updated_at: new Date(),
  permissions: [{ permission: 'flights:view' }],
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns users with permissions as string[]', async () => {
      mockRepo.findAll.mockResolvedValue([userRow]);
      const result = await service.findAll();
      expect(result[0].permissions).toEqual(['flights:view']);
    });
  });

  describe('create', () => {
    it('hashes password and creates user', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.createUser.mockResolvedValue({ ...userRow, permissions: [] });
      await service.create({ name: 'Test', email: 'test@test.com', password: 'pass123', role: Role.EMPLOYEE, permissions: [] });
      const call = mockRepo.createUser.mock.calls[0][0];
      expect(call.password).not.toBe('pass123');
      const valid = await bcrypt.compare('pass123', call.password);
      expect(valid).toBe(true);
    });

    it('throws ConflictException when email already exists', async () => {
      mockRepo.findByEmail.mockResolvedValue(userRow);
      await expect(
        service.create({ name: 'X', email: 'admin@test.com', password: 'x', role: Role.EMPLOYEE, permissions: [] }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('updates user and returns result with permissions as string[]', async () => {
      mockRepo.findById.mockResolvedValue(userRow);
      const updated = { ...userRow, name: 'Updated', permissions: [{ permission: 'flights:view' }] };
      mockRepo.updateUser.mockResolvedValue(updated);
      const result = await service.update(1, { name: 'Updated' });
      expect(result.name).toBe('Updated');
      expect(result.permissions).toEqual(['flights:view']);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update(99, { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('hashes new password when provided', async () => {
      mockRepo.findById.mockResolvedValue(userRow);
      mockRepo.updateUser.mockResolvedValue({ ...userRow, permissions: [] });
      await service.update(1, { password: 'newpass' });
      const call = mockRepo.updateUser.mock.calls[0][1];
      expect(call.password).toBeDefined();
      const valid = await bcrypt.compare('newpass', call.password!);
      expect(valid).toBe(true);
    });
  });

  describe('remove', () => {
    it('removes user successfully', async () => {
      mockRepo.findById.mockResolvedValue({ ...userRow, role: Role.EMPLOYEE });
      mockRepo.removeUser.mockResolvedValue(userRow);
      await service.remove(1, 2);
      expect(mockRepo.removeUser).toHaveBeenCalledWith(1);
    });

    it('throws ForbiddenException when deleting own account', async () => {
      await expect(service.remove(1, 1)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.remove(99, 2)).rejects.toThrow(NotFoundException);
    });
  });
});
