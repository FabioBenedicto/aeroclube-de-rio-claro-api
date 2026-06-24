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
exports.ReceivablesService = void 0;
const title_status_enum_1 = require("../common/enums/title-status.enum");
const common_1 = require("@nestjs/common");
const receivables_repository_interface_1 = require("./repository/receivables-repository.interface");
let ReceivablesService = class ReceivablesService {
    receivablesRepository;
    constructor(receivablesRepository) {
        this.receivablesRepository = receivablesRepository;
    }
    findAll(dto) {
        return this.receivablesRepository.findAll(dto);
    }
    async findOne(id) {
        const receivable = await this.receivablesRepository.findById(id);
        if (!receivable)
            throw new common_1.NotFoundException(`Título recebível ${id} não encontrado`);
        return receivable;
    }
    create(dto) {
        return this.receivablesRepository.create(dto);
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.receivablesRepository.update(id, dto);
    }
    async delete(id) {
        const receivable = await this.findOne(id);
        if (receivable.status === title_status_enum_1.ETitleStatus.PAID)
            throw new common_1.BadRequestException('Não é possível excluir um recebível já liquidado');
        return this.receivablesRepository.delete(id);
    }
    async getPayment(paymentId) {
        const payment = await this.receivablesRepository.findPaymentById(paymentId);
        if (!payment)
            throw new common_1.NotFoundException(`Pagamento ${paymentId} não encontrado`);
        return payment;
    }
    createPayment(receivableId, dto) {
        return this.receivablesRepository.createPayment(receivableId, dto);
    }
    async deletePayment(paymentId) {
        await this.getPayment(paymentId);
        await this.receivablesRepository.deletePayment(paymentId);
    }
    async attachPaymentInvoice(paymentId, fileData) {
        await this.getPayment(paymentId);
        return this.receivablesRepository.attachPaymentInvoice(paymentId, fileData);
    }
    async removePaymentInvoice(paymentId) {
        await this.getPayment(paymentId);
        return this.receivablesRepository.removePaymentInvoice(paymentId);
    }
    bulkDelete(ids) {
        return this.receivablesRepository.bulkDelete(ids);
    }
};
exports.ReceivablesService = ReceivablesService;
exports.ReceivablesService = ReceivablesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(receivables_repository_interface_1.RECEIVABLES_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ReceivablesService);
//# sourceMappingURL=receivables.service.js.map