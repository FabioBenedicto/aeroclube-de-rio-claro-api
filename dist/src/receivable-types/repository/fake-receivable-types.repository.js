"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeReceivableTypesRepository = void 0;
class FakeReceivableTypesRepository {
    types = [];
    usageCounts = new Map();
    nextId = 1;
    async findAll() {
        return this.types;
    }
    async findById(id) {
        return this.types.find((t) => t.id === id) ?? null;
    }
    async findByName(name) {
        return this.types.find((t) => t.name === name) ?? null;
    }
    async create(name) {
        const type = { id: this.nextId++, name, created_at: new Date() };
        this.types.push(type);
        return type;
    }
    async update(id, name) {
        const type = this.types.find((t) => t.id === id);
        if (!type)
            throw new Error(`ReceivableType ${id} not found`);
        type.name = name;
        return type;
    }
    async delete(id) {
        const idx = this.types.findIndex((t) => t.id === id);
        if (idx !== -1)
            this.types.splice(idx, 1);
    }
    async countUsages(id) {
        return this.usageCounts.get(id) ?? 0;
    }
}
exports.FakeReceivableTypesRepository = FakeReceivableTypesRepository;
//# sourceMappingURL=fake-receivable-types.repository.js.map