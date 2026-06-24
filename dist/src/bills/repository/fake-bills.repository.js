"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeBillsRepository = void 0;
const common_1 = require("@nestjs/common");
class FakeBillsRepository {
    bills = [];
    nextId = 1;
    async findAll({ page = 1, limit = 20 }) {
        const total = this.bills.length;
        return { data: this.bills.slice((page - 1) * limit, page * limit), total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async findById(id) {
        return (this.bills.find((b) => b.id === id) ?? null);
    }
    async create(dto) {
        const bill = {
            ...dto,
            id: this.nextId++,
            status: 'open',
            payment_date: null,
            payment_method: null,
            total_amount: 0,
            expiration_date: dto.expiration_date ? new Date(dto.expiration_date) : new Date(),
            created_at: new Date(),
            file_id: null,
            file: null,
            people: null,
            receivable_payments: [],
        };
        this.bills.push(bill);
        return bill;
    }
    async update(id, data) {
        const idx = this.bills.findIndex((b) => b.id === id);
        if (idx === -1)
            return null;
        this.bills[idx] = { ...this.bills[idx], ...data };
        return this.bills[idx];
    }
    async pay(id, data) {
        const idx = this.bills.findIndex((b) => b.id === id);
        if (idx === -1)
            throw new Error(`Bill ${id} not found`);
        this.bills[idx] = { ...this.bills[idx], ...data };
        return this.bills[idx];
    }
    async delete(id) {
        const idx = this.bills.findIndex((b) => b.id === id);
        if (idx !== -1)
            this.bills.splice(idx, 1);
    }
    async attachInvoice(id, fileData) {
        const bill = this.bills.find((b) => b.id === id);
        if (bill) {
            bill.file = { id: 1, ...fileData, created_at: new Date() };
            bill.file_id = bill.file.id;
        }
        return (bill ?? null);
    }
    async deleteInvoice(_id) { }
    async findByIds(ids) {
        return this.bills.filter((b) => ids.includes(b.id));
    }
    async markPendingCnab(ids) {
        this.bills.filter((b) => ids.includes(b.id)).forEach((b) => {
            b.status = 'pending_cnab';
        });
    }
    async revertFromPendingCnab(ids) {
        this.bills
            .filter((b) => ids.includes(b.id) && b.status === 'pending_cnab')
            .forEach((b) => {
            b.status = 'open';
        });
    }
    async bulkDelete(ids) {
        const found = this.bills.filter((b) => ids.includes(b.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Uma ou mais faturas não foram encontradas');
        this.bills = this.bills.filter((b) => !ids.includes(b.id));
    }
}
exports.FakeBillsRepository = FakeBillsRepository;
//# sourceMappingURL=fake-bills.repository.js.map