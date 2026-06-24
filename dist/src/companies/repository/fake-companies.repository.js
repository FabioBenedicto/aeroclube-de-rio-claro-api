"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeCompaniesRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const company_model_1 = require("../model/company.model");
class FakeCompaniesRepository {
    items = [];
    nextId = 1;
    async findAll({ search, date_from, date_to, page = 1, limit = 20, }) {
        let data = [...this.items];
        if (search) {
            const term = search.toLowerCase();
            data = data.filter((c) => c.name.toLowerCase().includes(term) ||
                (c.cnpj ?? '').includes(term) ||
                (c.email ?? '').toLowerCase().includes(term));
        }
        if (date_from)
            data = data.filter((c) => c.created_at >= date_from);
        if (date_to)
            data = data.filter((c) => c.created_at <= date_to);
        const total = data.length;
        return {
            data: data
                .slice((page - 1) * limit, page * limit)
                .map((c) => (0, class_transformer_1.plainToInstance)(company_model_1.Company, c)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findByCnpj(cnpj) {
        const c = this.items.find((c) => c.cnpj === cnpj);
        return c ? (0, class_transformer_1.plainToInstance)(company_model_1.Company, c) : null;
    }
    async findByEmail(email) {
        const c = this.items.find((c) => c.email === email);
        return c ? (0, class_transformer_1.plainToInstance)(company_model_1.Company, c) : null;
    }
    async findById(id) {
        const c = this.items.find((c) => c.id === id);
        return c ? (0, class_transformer_1.plainToInstance)(company_model_1.Company, c) : null;
    }
    async create(data) {
        const company = {
            ...data,
            id: this.nextId++,
            cnpj: data.cnpj ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.items.push(company);
        return (0, class_transformer_1.plainToInstance)(company_model_1.Company, company);
    }
    async update(id, data) {
        const idx = this.items.findIndex((c) => c.id === id);
        this.items[idx] = { ...this.items[idx], ...data, updated_at: new Date() };
        return (0, class_transformer_1.plainToInstance)(company_model_1.Company, this.items[idx]);
    }
    async delete(id) {
        const idx = this.items.findIndex((c) => c.id === id);
        this.items.splice(idx, 1);
    }
    async bulkDelete(ids) {
        const found = this.items.filter((c) => ids.includes(c.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Uma ou mais empresas não foram encontradas');
        this.items = this.items.filter((c) => !ids.includes(c.id));
    }
}
exports.FakeCompaniesRepository = FakeCompaniesRepository;
//# sourceMappingURL=fake-companies.repository.js.map