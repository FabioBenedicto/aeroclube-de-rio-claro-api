import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

const mockPrisma = { user: { findUnique: jest.fn() } };
const mockJwt = { sign: jest.fn().mockReturnValue('mock-token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('returns access_token for valid credentials', async () => {
    const hashed = await bcrypt.hash('admin123', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@aeroclube.com',
      password: hashed,
      name: 'Admin',
      role: 'ADMIN',
      permissions: [],
    });

    const result = await service.login({
      email: 'admin@aeroclube.com',
      password: 'admin123',
    });

    expect(result.access_token).toBe('mock-token');
    expect(result.user.role).toBe('ADMIN');
  });

  it('throws UnauthorizedException when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'ghost@test.com', password: 'pass123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for wrong password', async () => {
    const hashed = await bcrypt.hash('correct', 10);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'admin@aeroclube.com',
      password: hashed,
      name: 'Admin',
      role: 'ADMIN',
      permissions: [],
    });

    await expect(
      service.login({ email: 'admin@aeroclube.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
