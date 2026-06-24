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
exports.PeoplesService = void 0;
const common_1 = require("@nestjs/common");
const peoples_repository_interface_1 = require("./repository/peoples/peoples-repository.interface");
function withCategories(c) {
    const entries = [
        [c.instructors, 'instructor'],
        [c.students, 'student'],
        [c.partners, 'partner'],
        [c.employees, 'employee'],
    ];
    const categories = entries
        .filter(([val]) => val != null)
        .map(([, label]) => label);
    return { ...c, categories };
}
let PeoplesService = class PeoplesService {
    peoplesRepository;
    constructor(peoplesRepository) {
        this.peoplesRepository = peoplesRepository;
    }
    async findAll(dto) {
        const result = await this.peoplesRepository.findAll(dto);
        return {
            ...result,
            data: result.data.map(withCategories),
        };
    }
    async findOne(id) {
        const people = await this.peoplesRepository.findById(id);
        if (!people)
            throw new common_1.NotFoundException(`Pessoa ${id} não encontrada`);
        return withCategories(people);
    }
    async create(dto) {
        const existingEmail = await this.peoplesRepository.findByEmail(dto.email);
        if (existingEmail)
            throw new common_1.ConflictException('E-mail já cadastrado');
        const existingCpf = await this.peoplesRepository.findByCpf(dto.cpf);
        if (existingCpf)
            throw new common_1.ConflictException('CPF já cadastrado');
        const people = await this.peoplesRepository.create(dto);
        return withCategories(people);
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.email) {
            const emailOwner = await this.peoplesRepository.findByEmail(dto.email);
            if (emailOwner && emailOwner.id !== id)
                throw new common_1.ConflictException('E-mail já cadastrado');
        }
        if (dto.cpf) {
            const cpfOwner = await this.peoplesRepository.findByCpf(dto.cpf);
            if (cpfOwner && cpfOwner.id !== id)
                throw new common_1.ConflictException('CPF já cadastrado');
        }
        const people = await this.peoplesRepository.update(id, dto);
        return withCategories(people);
    }
    async delete(id) {
        await this.findOne(id);
        await this.peoplesRepository.delete(id);
    }
    bulkDelete(ids) {
        return this.peoplesRepository.bulkDelete(ids);
    }
    getStats() {
        return this.peoplesRepository.getStats();
    }
};
exports.PeoplesService = PeoplesService;
exports.PeoplesService = PeoplesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(peoples_repository_interface_1.PEOPLES_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PeoplesService);
//# sourceMappingURL=peoples.service.js.map