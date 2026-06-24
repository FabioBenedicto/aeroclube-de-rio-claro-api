"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeFlightsRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const flight_model_1 = require("../model/flight.model");
class FakeFlightsRepository {
    flights = [];
    receivables = [];
    payables = [];
    aircraft = null;
    settings = null;
    nextId = 1;
    async registerFlight(data) {
        const id = this.nextId++;
        const flight = {
            id,
            aircraft_id: data.aircraftId,
            people_id: data.peopleId,
            instructor_id: data.instructorId ?? null,
            type: data.type,
            origin: data.origin,
            destination: data.destination,
            start_date: data.startDate,
            end_date: data.endDate ?? null,
            total_hours: data.totalHours ?? null,
            total_amount: data.totalAmount ?? null,
            calculation_breakdown: data.calculationBreakdown ?? null,
        };
        this.flights.push(flight);
        if (data.buildReceivable) {
            this.receivables.push({ ...data.buildReceivable(id), flightId: id });
        }
        if (data.buildPayable) {
            this.payables.push({ ...data.buildPayable(id), flightId: id });
        }
        return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, flight);
    }
    async findAircraft(_id) {
        return this.aircraft;
    }
    async findSettings() {
        return this.settings;
    }
    async findAll({ page = 1, limit = 20, aircraft_id, people_id, instructor_id, type, search, date_from, date_to, }) {
        let data = [...this.flights];
        if (aircraft_id)
            data = data.filter((f) => f.aircraft_id === aircraft_id);
        if (people_id)
            data = data.filter((f) => f.people_id === people_id);
        if (instructor_id)
            data = data.filter((f) => f.instructor_id === instructor_id);
        if (type)
            data = data.filter((f) => f.type.toLowerCase().includes(type.toLowerCase()));
        if (search)
            data = data.filter((f) => f.type.toLowerCase().includes(search.toLowerCase()));
        if (date_from)
            data = data.filter((f) => f.start_date >= date_from);
        if (date_to)
            data = data.filter((f) => f.start_date <= date_to);
        const total = data.length;
        return { data: data.slice((page - 1) * limit, page * limit).map((f) => (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, f)), total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getStats(dto) {
        const { total, data } = await this.findAll(dto);
        const total_hours = data.reduce((s, f) => s + Number(f.total_hours ?? 0), 0);
        const total_revenue = data.reduce((s, f) => s + Number(f.total_amount ?? 0), 0);
        return {
            total,
            total_hours: total_hours > 0 ? total_hours : null,
            total_revenue: total_revenue > 0 ? total_revenue : null,
        };
    }
    async findById(id) {
        const f = this.flights.find((f) => f.id === id);
        return f ? (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, f) : null;
    }
    async updateFlightAndRelations(id, data) {
        const idx = this.flights.findIndex((f) => f.id === id);
        this.flights[idx] = { ...this.flights[idx], ...data };
        if (data.peopleId !== undefined) {
            for (const r of this.receivables.filter((r) => r.flightId === id)) {
                r.peopleId = data.peopleId;
            }
        }
        if (data.instructorId !== undefined && data.instructorId !== null) {
            for (const p of this.payables.filter((p) => p.flightId === id)) {
                p.instructorId = data.instructorId;
            }
        }
        return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, this.flights[idx]);
    }
    async closeFlight(id, data) {
        const idx = this.flights.findIndex((f) => f.id === id);
        this.flights[idx] = {
            ...this.flights[idx],
            end_date: data.endDate,
            total_hours: data.totalHours,
            total_amount: data.totalAmount,
            calculation_breakdown: data.breakdown,
        };
        if (data.buildReceivable) {
            this.receivables.push({ ...data.buildReceivable(), flightId: id });
        }
        if (data.buildPayable) {
            this.payables.push({ ...data.buildPayable(), flightId: id });
        }
        return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, this.flights[idx]);
    }
    async hasReceivableWithPayments(_flightId) {
        return false;
    }
    async delete(id) {
        const idx = this.flights.findIndex((f) => f.id === id);
        const [removed] = this.flights.splice(idx, 1);
        return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, removed);
    }
    async bulkDelete(ids) {
        const found = this.flights.filter((f) => ids.includes(f.id));
        if (found.length !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais voos não foram encontrados');
        this.flights.splice(0, this.flights.length, ...this.flights.filter((f) => !ids.includes(f.id)));
    }
}
exports.FakeFlightsRepository = FakeFlightsRepository;
//# sourceMappingURL=fake-flights.repository.js.map