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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const roles_enum_1 = require("./enums/roles.enum");
const users_repository_interface_1 = require("./repository/users-repository.interface");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    findAll(query) {
        return this.usersRepository.findAll(query);
    }
    async create(dto) {
        const existing = await this.usersRepository.findByEmail(dto.email);
        if (existing)
            throw new common_1.ConflictException('E-mail já cadastrado');
        const password = await bcrypt.hash(dto.password, 10);
        return this.usersRepository.create({
            name: dto.name,
            email: dto.email,
            password,
            role: dto.role,
            permissions: dto.role === roles_enum_1.ERoles.ADMIN ? [] : (dto.permissions ?? []),
        });
    }
    async update(id, dto, requesterId) {
        const existing = await this.usersRepository.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (requesterId !== undefined && requesterId === id) {
            throw new common_1.ForbiddenException('Não é possível editar sua própria conta');
        }
        if (requesterId !== undefined &&
            requesterId !== id &&
            existing.role === roles_enum_1.ERoles.ADMIN) {
            throw new common_1.ForbiddenException('Não é possível editar outro administrador');
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.email !== undefined)
            data.email = dto.email;
        if (dto.role !== undefined)
            data.role = dto.role;
        if (dto.password)
            data.password = await bcrypt.hash(dto.password, 10);
        const permissions = dto.role === roles_enum_1.ERoles.ADMIN ? [] : dto.permissions;
        return this.usersRepository.update(id, data, permissions);
    }
    async updateMe(id, dto) {
        const user = await this.usersRepository.findById(id);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (dto.password) {
            if (!dto.currentPassword)
                throw new common_1.BadRequestException('Informe a senha atual para alterá-la');
            const valid = await bcrypt.compare(dto.currentPassword, user.password);
            if (!valid)
                throw new common_1.UnauthorizedException('Senha atual incorreta');
        }
        return this.update(id, {
            name: dto.name,
            email: dto.email,
            password: dto.password,
        });
    }
    async removeSelf(id) {
        const existing = await this.usersRepository.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Usuário não encontrado');
        return this.usersRepository.delete(id);
    }
    async delete(id, requesterId) {
        if (requesterId !== undefined && requesterId === id) {
            throw new common_1.ForbiddenException('Não é possível excluir sua própria conta');
        }
        const existing = await this.usersRepository.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (existing.role === roles_enum_1.ERoles.ADMIN) {
            throw new common_1.ForbiddenException('Não é possível excluir um administrador');
        }
        return this.usersRepository.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(users_repository_interface_1.USERS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UsersService);
//# sourceMappingURL=users.service.js.map