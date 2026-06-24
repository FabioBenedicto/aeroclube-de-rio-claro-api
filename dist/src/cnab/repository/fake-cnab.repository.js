"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeCnabRepository = void 0;
class FakeCnabRepository {
    remessas = [];
    nextId = 1;
    async listRemittent(page, limit) {
        const skip = (page - 1) * limit;
        const data = this.remessas.slice(skip, skip + limit);
        return { data, total: this.remessas.length, page, limit, totalPages: Math.ceil(this.remessas.length / limit) };
    }
    async findRemittent(id) {
        return this.remessas.find((r) => r.id === id) ?? null;
    }
    async createRemittent(data) {
        const file = {
            id: this.nextId * 100,
            ...data.file,
            created_at: new Date(),
        };
        const remittent = {
            id: this.nextId++,
            sequence_number: data.sequence_number,
            bill_ids: data.bill_ids,
            bill_count: data.bill_count,
            total_amount: data.total_amount,
            file_id: file.id,
            file,
            created_at: new Date(),
            bills: [],
        };
        this.remessas.push(remittent);
        return remittent;
    }
    async deleteRemessa(id) {
        const idx = this.remessas.findIndex((r) => r.id === id);
        if (idx === -1)
            return;
        this.remessas.splice(idx, 1);
    }
}
exports.FakeCnabRepository = FakeCnabRepository;
//# sourceMappingURL=fake-cnab.repository.js.map