import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Prisma, User as PrismaUser } from 'src/generated/prisma/browser';
import { PrismaService } from 'src/prisma/prisma.service';

import { FindAllUsersDto } from '../dto/find-all-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../model/user.model';
import { CreateUserData, IUsersRepository } from './users-repository.interface';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  created_at: true,
  updated_at: true,
  permissions: { select: { permission: true } },
} satisfies Prisma.UserSelect;

type RawUser = PrismaUser;
type RawUserWithPermissions =
  | Prisma.UserGetPayload<{ include: { permissions: true } }>
  | Prisma.UserGetPayload<{ select: typeof userSelect }>;

function toUser(raw: RawUser): User {
  return plainToInstance(User, raw);
}

function toUserWithPermissions(raw: RawUserWithPermissions): User {
  return plainToInstance(User, {
    ...raw,
    permissions: raw.permissions.map((p) => p.permission),
  });
}

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });
    return raw ? toUserWithPermissions(raw) : null;
  }

  async findByEmail(email: string) {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? toUser(raw) : null;
  }

  async findAll({
    search,
    role,
    page,
    limit,
    date_from,
    date_to,
  }: FindAllUsersDto) {
    const AND: Prisma.UserWhereInput[] = [];
    if (search) {
      AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (role) {
      AND.push({ role });
    }
    if (date_from || date_to) {
      const range: Prisma.DateTimeFilter = {};
      if (date_from) range.gte = date_from;
      if (date_to) {
        const end = new Date(date_to);
        end.setHours(23, 59, 59, 999);
        range.lte = end;
      }
      AND.push({ created_at: range });
    }
    const where: Prisma.UserWhereInput = AND.length > 0 ? { AND } : {};

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map(toUserWithPermissions),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: CreateUserData) {
    const raw = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        },
      });
      if (data.permissions.length) {
        await tx.userPermission.createMany({
          data: data.permissions.map((permission) => ({
            user_id: user.id,
            permission,
          })),
        });
      }
      return tx.user.findUnique({ where: { id: user.id }, select: userSelect });
    });
    return raw ? toUserWithPermissions(raw) : null;
  }

  async update(
    id: number,
    data: Omit<UpdateUserDto, 'permissions'>,
    permissions?: string[],
  ) {
    const raw = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data });
      if (permissions !== undefined) {
        await tx.userPermission.deleteMany({ where: { user_id: id } });
        if (permissions.length) {
          await tx.userPermission.createMany({
            data: permissions.map((permission) => ({
              user_id: id,
              permission,
            })),
          });
        }
      }
      return tx.user.findUnique({ where: { id: user.id }, select: userSelect });
    });
    return raw ? toUserWithPermissions(raw) : null;
  }

  async delete(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
