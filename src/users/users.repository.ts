import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { permissions: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
        permissions: { select: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  createUser(data: { name: string; email: string; password: string; role: Role; permissions: string[] }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, password: data.password, role: data.role },
      });
      if (data.permissions.length) {
        await tx.userPermission.createMany({
          data: data.permissions.map((permission) => ({ user_id: user.id, permission })),
        });
      }
      return tx.user.findUnique({
        where: { id: user.id },
        select: {
          id: true, name: true, email: true, role: true, created_at: true, updated_at: true,
          permissions: { select: { permission: true } },
        },
      });
    });
  }

  updateUser(
    id: number,
    data: Partial<{ name: string; email: string; password: string; role: Role }>,
    permissions?: string[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data });
      if (permissions !== undefined) {
        await tx.userPermission.deleteMany({ where: { user_id: id } });
        if (permissions.length) {
          await tx.userPermission.createMany({
            data: permissions.map((permission) => ({ user_id: id, permission })),
          });
        }
      }
      return tx.user.findUnique({
        where: { id: user.id },
        select: {
          id: true, name: true, email: true, role: true, created_at: true, updated_at: true,
          permissions: { select: { permission: true } },
        },
      });
    });
  }

  removeUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
