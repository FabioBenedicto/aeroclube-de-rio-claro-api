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
exports.PayablesService = void 0;
const common_1 = require("@nestjs/common");
const title_status_enum_1 = require("../common/enums/title-status.enum");
const payables_repository_interface_1 = require("./repository/payables-repository.interface");
let PayablesService = class PayablesService {
    payablesRepository;
    constructor(payablesRepository) {
        this.payablesRepository = payablesRepository;
    }
    findAll(query) {
        return this.payablesRepository.findAll(query);
    }
    getStats(query) {
        return this.payablesRepository.getStats(query);
    }
    async findOne(id) {
        const payable = await this.payablesRepository.findById(id);
        if (!payable)
            throw new common_1.NotFoundException(`Título a pagar ${id} não encontrada`);
        return payable;
    }
    create(dto) {
        return this.payablesRepository.create(dto);
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.payablesRepository.update(id, dto);
    }
    async remove(id) {
        await this.findOne(id);
        return this.payablesRepository.delete(id);
    }
    async getPayment(paymentId) {
        const payment = await this.payablesRepository.findPaymentById(paymentId);
        if (!payment)
            throw new common_1.NotFoundException(`Pagamento ${paymentId} não encontrado`);
        return payment;
    }
    async createPayment(id, dto) {
        const payable = await this.findOne(id);
        if (payable.status === title_status_enum_1.ETitleStatus.PAID)
            throw new common_1.BadRequestException('Conta a pagar já liquidada');
        return this.payablesRepository.createPayment(id, dto);
    }
    async deletePayment(paymentId) {
        await this.getPayment(paymentId);
        await this.payablesRepository.deletePayment(paymentId);
    }
    async addPaymentInvoice(paymentId, fileData) {
        await this.getPayment(paymentId);
        return this.payablesRepository.addPaymentInvoice(paymentId, fileData);
    }
    async deletePaymentInvoice(paymentId) {
        await this.getPayment(paymentId);
        return this.payablesRepository.deletePaymentInvoice(paymentId);
    }
    bulkDelete(ids) {
        return this.payablesRepository.bulkDelete(ids);
    }
};
exports.PayablesService = PayablesService;
exports.PayablesService = PayablesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(payables_repository_interface_1.PAYABLES_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], PayablesService);
//# sourceMappingURL=payables.service.js.map