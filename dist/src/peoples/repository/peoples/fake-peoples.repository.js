"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakePeoplesRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const people_model_1 = require("../../model/people.model");
class FakePeoplesRepository {
    peoples = [];
    stats = {
        total_received: 0,
        total_paid: 0,
        total_hours: 0,
        total_flights: 0,
    };
    nextId = 1;
    async findAll({ page = 1, limit = 20 }) {
        const total = this.peoples.length;
        return {
            data: this.peoples.slice((page - 1) * limit, page * limit),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        return this.peoples.find((p) => p.id === id) ?? null;
    }
    async findByCpf(cpf) {
        return this.peoples.find((p) => p.cpf === cpf) ?? null;
    }
    async findByEmail(email) {
        return this.peoples.find((p) => p.email === email) ?? null;
    }
    async create(dto) {
        const { instructor, student, partner, employee, ...fields } = dto;
        const people = (0, class_transformer_1.plainToInstance)(people_model_1.People, {
            ...fields,
            id: this.nextId++,
            phone_number: fields.phone_number ?? null,
            credit_balance: null,
            address: null,
            created_at: new Date(),
            updated_at: new Date(),
            studentId: 0,
            instructors: instructor ? { id: 0, people_id: 0 } : null,
            students: student ? { id: 0, people_id: 0 } : null,
            partners: partner ? { id: 0, people_id: 0, ...partner } : null,
            employees: employee ? { id: 0, people_id: 0 } : null,
        });
        this.peoples.push(people);
        return people;
    }
    async update(id, dto) {
        const idx = this.peoples.findIndex((p) => p.id === id);
        if (idx === -1)
            throw new common_1.NotFoundException(`Pessoa ${id} não encontrada`);
        const { instructor, student, partner, employee, ...fields } = dto;
        const updated = (0, class_transformer_1.plainToInstance)(people_model_1.People, {
            ...this.peoples[idx],
            ...fields,
            instructors: instructor !== undefined
                ? instructor
                    ? { id: 0, people_id: id }
                    : null
                : this.peoples[idx].instructors,
            students: student !== undefined
                ? student
                    ? { id: 0, people_id: id }
                    : null
                : this.peoples[idx].students,
            partners: partner !== undefined
                ? partner
                    ? { id: 0, people_id: id, ...partner }
                    : null
                : this.peoples[idx].partners,
            employees: employee !== undefined
                ? employee
                    ? { id: 0, people_id: id }
                    : null
                : this.peoples[idx].employees,
        });
        this.peoples[idx] = updated;
        return updated;
    }
    async delete(id) {
        const idx = this.peoples.findIndex((p) => p.id === id);
        if (idx !== -1)
            this.peoples.splice(idx, 1);
    }
    async bulkDelete(ids) {
        const found = this.peoples.filter((p) => ids.includes(p.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais registros não foram encontrados');
        this.peoples = this.peoples.filter((p) => !ids.includes(p.id));
    }
    async getStats() {
        return this.stats;
    }
}
exports.FakePeoplesRepository = FakePeoplesRepository;
//# sourceMappingURL=fake-peoples.repository.js.map