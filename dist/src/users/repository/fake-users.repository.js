"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeUsersRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const user_model_1 = require("../model/user.model");
let FakeUsersRepository = class FakeUsersRepository {
    users = [];
    nextId = 1;
    async findById(id) {
        const u = this.users.find((u) => u.id === id);
        return u ? (0, class_transformer_1.plainToInstance)(user_model_1.User, u) : null;
    }
    async findByEmail(email) {
        const u = this.users.find((u) => u.email === email);
        return u ? (0, class_transformer_1.plainToInstance)(user_model_1.User, u) : null;
    }
    async findAll({ search, role, page, limit }) {
        let filtered = this.users;
        if (search) {
            filtered = filtered.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase()));
        }
        if (role) {
            filtered = filtered.filter((u) => u.role === role);
        }
        const skip = (page - 1) * limit;
        const data = filtered
            .slice(skip, skip + limit)
            .map((u) => (0, class_transformer_1.plainToInstance)(user_model_1.User, u));
        return {
            data,
            total: filtered.length,
            page,
            limit,
            totalPages: Math.ceil(filtered.length / limit),
        };
    }
    async create(data) {
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
        return (0, class_transformer_1.plainToInstance)(user_model_1.User, user);
    }
    async update(id, data, permissions) {
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx === -1)
            return null;
        this.users[idx] = { ...this.users[idx], ...data, updated_at: new Date() };
        if (permissions !== undefined) {
            this.users[idx].permissions = permissions;
        }
        return (0, class_transformer_1.plainToInstance)(user_model_1.User, this.users[idx]);
    }
    async delete(id) {
        const idx = this.users.findIndex((u) => u.id === id);
        if (idx !== -1)
            this.users.splice(idx, 1);
        return { id };
    }
};
exports.FakeUsersRepository = FakeUsersRepository;
exports.FakeUsersRepository = FakeUsersRepository = __decorate([
    (0, common_1.Injectable)()
], FakeUsersRepository);
//# sourceMappingURL=fake-users.repository.js.map