"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeReceivablesRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const receivable_model_1 = require("../model/receivable.model");
const receivable_payment_model_1 = require("../model/receivable-payment.model");
let FakeReceivablesRepository = class FakeReceivablesRepository {
    receivables = [];
    payments = [];
    nextId = 1;
    nextPaymentId = 1;
    async findAll({ page = 1, limit = 20 }) {
        const data = this.receivables.map((r) => (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, r));
        const total = data.length;
        return {
            data: data.slice((page - 1) * limit, page * limit),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const r = this.receivables.find((r) => r.id === id);
        return r ? (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, r) : null;
    }
    async create(dto) {
        const receivable = {
            ...dto,
            id: this.nextId++,
            amount_received: 0,
            status: 0,
            payments: [],
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.receivables.push(receivable);
        return (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, receivable);
    }
    async update(id, dto) {
        const idx = this.receivables.findIndex((r) => r.id === id);
        if (idx === -1)
            return (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, {});
        this.receivables[idx] = { ...this.receivables[idx], ...dto };
        return (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, this.receivables[idx]);
    }
    async delete(id) {
        const idx = this.receivables.findIndex((r) => r.id === id);
        if (idx === -1)
            return;
        this.receivables.splice(idx, 1);
    }
    async findPaymentById(paymentId) {
        const payment = this.payments.find((p) => p.id === paymentId);
        return payment ? (0, class_transformer_1.plainToInstance)(receivable_payment_model_1.ReceivablePayment, payment) : null;
    }
    async createPayment(receivableId, dto) {
        const receivable = this.receivables.find((r) => r.id === receivableId);
        if (!receivable)
            throw new Error('Register not found');
        const applied = Number(dto.amount_received);
        receivable.amount_received = Number(receivable.amount_received) + applied;
        const payment = {
            ...dto,
            id: this.nextPaymentId++,
            receivable_id: receivableId,
        };
        this.payments.push(payment);
        return (0, class_transformer_1.plainToInstance)(receivable_payment_model_1.ReceivablePayment, payment);
    }
    async deletePayment(paymentId) {
        const idx = this.payments.findIndex((p) => p.id === paymentId);
        if (idx === -1)
            return;
        this.payments.splice(idx, 1);
    }
    async attachPaymentInvoice(paymentId, fileData) {
        const payment = this.payments.find((p) => p.id === paymentId);
        if (!payment)
            throw new Error('Register not found');
        payment.file = { id: Date.now(), ...fileData, created_at: new Date() };
        payment.file_id = payment.file.id;
        return (0, class_transformer_1.plainToInstance)(receivable_payment_model_1.ReceivablePayment, payment ?? {});
    }
    async removePaymentInvoice(paymentId) {
        const payment = this.payments.find((p) => p.id === paymentId);
        if (payment) {
            payment.file = null;
            payment.file_id = null;
        }
    }
    async bulkDelete(ids) {
        const found = this.receivables.filter((r) => ids.includes(r.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais recebíveis não foram encontrados');
        const hasPaid = found.some((r) => r.status === 'PAID' || r.status === 2);
        if (hasPaid)
            throw new common_1.UnprocessableEntityException('Não é possível excluir recebíveis já pagos');
        this.receivables = this.receivables.filter((r) => !ids.includes(r.id));
    }
};
exports.FakeReceivablesRepository = FakeReceivablesRepository;
exports.FakeReceivablesRepository = FakeReceivablesRepository = __decorate([
    (0, common_1.Injectable)()
], FakeReceivablesRepository);
//# sourceMappingURL=fake-receivables.repository.js.map