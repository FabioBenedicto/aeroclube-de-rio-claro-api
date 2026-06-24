"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const prisma_service_1 = require("../../prisma/prisma.service");
const user_model_1 = require("../model/user.model");
const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    created_at: true,
    updated_at: true,
    permissions: { select: { permission: true } },
};
function toUser(raw) {
    return (0, class_transformer_1.plainToInstance)(user_model_1.User, raw);
}
function toUserWithPermissions(raw) {
    return (0, class_transformer_1.plainToInstance)(user_model_1.User, {
        ...raw,
        permissions: raw.permissions.map((p) => p.permission),
    });
}
let UsersRepository = class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const raw = await this.prisma.user.findUnique({
            where: { id },
            include: { permissions: true },
        });
        return raw ? toUserWithPermissions(raw) : null;
    }
    async findByEmail(email) {
        const raw = await this.prisma.user.findUnique({ where: { email } });
        return raw ? toUser(raw) : null;
    }
    async findAll({ search, role, page, limit, date_from, date_to, }) {
        const AND = [];
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
            const range = {};
            if (date_from)
                range.gte = date_from;
            if (date_to) {
                const end = new Date(date_to);
                end.setHours(23, 59, 59, 999);
                range.lte = end;
            }
            AND.push({ created_at: range });
        }
        const where = AND.length > 0 ? { AND } : {};
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
    async create(data) {
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
    async update(id, data, permissions) {
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
    async delete(id) {
        return this.prisma.user.delete({ where: { id } });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map