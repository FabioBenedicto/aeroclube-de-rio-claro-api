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
exports.PayableTypesService = void 0;
const common_1 = require("@nestjs/common");
const payable_types_repository_interface_1 = require("./repository/payable-types-repository.interface");
let PayableTypesService = class PayableTypesService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() {
        return this.repo.findAll();
    }
    async findById(id) {
        const type = await this.repo.findById(id);
        if (!type)
            throw new common_1.NotFoundException(`Tipo de pagável ${id} não encontrado`);
        return type;
    }
    async findByName(name) {
        const type = await this.repo.findByName(name);
        if (!type)
            throw new common_1.NotFoundException(`Tipo de pagável '${name}' não encontrado`);
        return type;
    }
    create(dto) {
        return this.repo.create(dto.name);
    }
    async update(id, dto) {
        await this.findById(id);
        return this.repo.update(id, dto.name);
    }
    async delete(id) {
        await this.findById(id);
        const count = await this.repo.countUsages(id);
        if (count > 0)
            throw new common_1.BadRequestException('Tipo em uso por pagáveis existentes e não pode ser removido');
        return this.repo.delete(id);
    }
};
exports.PayableTypesService = PayableTypesService;
exports.PayableTypesService = PayableTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(payable_types_repository_interface_1.PAYABLE_TYPES_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PayableTypesService);
//# sourceMappingURL=payable-types.service.js.map