"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeAircraftRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const aircraft_model_1 = require("../model/aircraft.model");
class FakeAircraftRepository {
    items = [];
    nextId = 1;
    async findAll({ page = 1, limit = 20, date_from, date_to, search, aircraft_type, }) {
        let data = [...this.items];
        if (search) {
            const searched = search.toLowerCase();
            data = data.filter((a) => a.registration.toLowerCase().includes(searched) ||
                a.model.toLowerCase().includes(searched));
        }
        if (date_from)
            data = data.filter((a) => a.created_at >= date_from);
        if (date_to)
            data = data.filter((a) => a.created_at <= date_to);
        if (aircraft_type)
            data = data.filter((a) => a.type === aircraft_type);
        const total = data.length;
        const skip = (page - 1) * limit;
        return {
            data: data
                .slice(skip, skip + limit)
                .map((a) => (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, a)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const raw = this.items.find((a) => a.id === id);
        return raw ? (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, raw) : null;
    }
    async findByRegistration(registration) {
        const raw = this.items.find((raw) => raw.registration === registration);
        return raw ? (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, raw) : null;
    }
    async create(data) {
        const aircraft = {
            ...data,
            id: this.nextId++,
            flight_hour_value: data.flight_hour_value ?? null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        this.items.push(aircraft);
        return (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, aircraft);
    }
    async update(id, data) {
        const idx = this.items.findIndex((a) => a.id === id);
        this.items[idx] = { ...this.items[idx], ...data };
        return (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, this.items[idx]);
    }
    async delete(id) {
        const idx = this.items.findIndex((a) => a.id === id);
        this.items.splice(idx, 1);
    }
    async bulkDelete(ids) {
        const found = this.items.filter((a) => ids.includes(a.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Uma ou mais aeronaves não foram encontradas');
        this.items = this.items.filter((a) => !ids.includes(a.id));
    }
}
exports.FakeAircraftRepository = FakeAircraftRepository;
//# sourceMappingURL=fake-aircraft.repository.js.map