"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakePayablesRepository = void 0;
const title_status_enum_1 = require("../../common/enums/title-status.enum");
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const payable_model_1 = require("../model/payable.model");
const payable_payment_model_1 = require("../model/payable-payment.model");
class FakePayablesRepository {
    payables = [];
    payments = [];
    nextId = 1;
    nextPaymentId = 1;
    async findAll({ page = 1, limit = 20 }) {
        const data = this.payables.map((p) => (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, p));
        const total = data.length;
        return {
            data: data.slice((page - 1) * limit, page * limit),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStats(dto) {
        const { data } = await this.findAll(dto);
        const total_amount = data.reduce((s, p) => s + Number(p.total_amount ?? 0), 0);
        const amount_paid = data.reduce((s, p) => s + Number(p.amount_paid ?? 0), 0);
        return { total_amount, amount_paid };
    }
    async findById(id) {
        const p = this.payables.find((p) => p.id === id);
        return p ? (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, p) : null;
    }
    async create(dto) {
        const payable = {
            ...dto,
            id: this.nextId++,
            amount_paid: 0,
            status: title_status_enum_1.ETitleStatus.PENDING,
            payments: [],
        };
        this.payables.push(payable);
        return (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, payable);
    }
    async update(id, dto) {
        const idx = this.payables.findIndex((p) => p.id === id);
        this.payables[idx] = { ...this.payables[idx], ...dto };
        return (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, this.payables[idx]);
    }
    async delete(id) {
        const idx = this.payables.findIndex((p) => p.id === id);
        if (idx === -1)
            return null;
        const [removed] = this.payables.splice(idx, 1);
        return (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, removed);
    }
    async createPayment(id, dto) {
        const payable = this.payables.find((p) => p.id === id);
        const newPaid = Number(payable.amount_paid) + Number(dto.amount);
        payable.amount_paid = newPaid;
        payable.status =
            newPaid >= Number(payable.amount)
                ? title_status_enum_1.ETitleStatus.PAID
                : title_status_enum_1.ETitleStatus.PARTIAL;
        const payment = { ...dto, id: this.nextPaymentId++, payable_id: id };
        this.payments.push(payment);
        return (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, payable);
    }
    async deletePayment(paymentId) {
        const idx = this.payments.findIndex((p) => p.id === paymentId);
        if (idx === -1)
            return null;
        const [removed] = this.payments.splice(idx, 1);
        return (0, class_transformer_1.plainToInstance)(payable_payment_model_1.PayablePayment, removed);
    }
    async findPaymentById(paymentId) {
        const p = this.payments.find((p) => p.id === paymentId);
        return p ? (0, class_transformer_1.plainToInstance)(payable_payment_model_1.PayablePayment, p) : null;
    }
    async addPaymentInvoice(paymentId, fileData) {
        const payment = this.payments.find((p) => p.id === paymentId);
        if (payment) {
            payment.file = { id: Date.now(), ...fileData, created_at: new Date() };
            payment.file_id = payment.file.id;
        }
        return (0, class_transformer_1.plainToInstance)(payable_payment_model_1.PayablePayment, payment);
    }
    async deletePaymentInvoice(paymentId) {
        const payment = this.payments.find((p) => p.id === paymentId);
        if (payment) {
            payment.file = null;
            payment.file_id = null;
        }
        return (0, class_transformer_1.plainToInstance)(payable_payment_model_1.PayablePayment, payment);
    }
    async bulkDelete(ids) {
        const found = this.payables.filter((p) => ids.includes(p.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais pagáveis não foram encontrados');
        this.payables = this.payables.filter((p) => !ids.includes(p.id));
    }
}
exports.FakePayablesRepository = FakePayablesRepository;
//# sourceMappingURL=fake-payables.repository.js.map