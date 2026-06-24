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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsRepository = void 0;
exports.normalizeFlight = normalizeFlight;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../../prisma/prisma.service");
const flight_model_1 = require("../model/flight.model");
const flightInclude = {
    aircraft: true,
    people: true,
    instructor: { include: { people: true } },
};
const flightDetailInclude = {
    aircraft: true,
    people: true,
    instructor: { include: { people: true } },
    receivables: true,
    payables: { include: { instructor: { include: { people: true } } } },
};
function normalizeFlight(f) {
    return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, f);
}
function toFlight(raw) {
    return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, raw);
}
function toFlightDetail(raw) {
    return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, {
        ...raw,
        receivables: raw.receivables.map((r) => ({
            ...r,
            total_amount: Number(r.total_amount),
            amount_received: Number(r.amount_received),
        })),
        payables: raw.payables.map((p) => ({
            ...p,
            total_amount: Number(p.total_amount),
            amount_paid: Number(p.amount_paid),
        })),
    });
}
function toBaseFlightOnly(raw) {
    return (0, class_transformer_1.plainToInstance)(flight_model_1.Flight, raw);
}
let FlightsRepository = class FlightsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerFlight(data) {
        const raw = await this.prisma.$transaction(async (tx) => {
            const flight = await tx.flight.create({
                data: {
                    aircraft: { connect: { id: data.aircraftId } },
                    people: { connect: { id: data.peopleId } },
                    ...(data.instructorId && {
                        instructor: { connect: { id: data.instructorId } },
                    }),
                    type: data.type,
                    origin: data.origin,
                    destination: data.destination,
                    start_date: data.startDate,
                    ...(data.endDate && { end_date: data.endDate }),
                    ...(data.totalHours !== undefined && {
                        total_hours: data.totalHours,
                    }),
                    ...(data.totalAmount !== undefined && {
                        total_amount: data.totalAmount,
                    }),
                    ...(data.calculationBreakdown !== undefined && {
                        calculation_breakdown: data.calculationBreakdown,
                    }),
                },
                include: flightInclude,
            });
            if (data.buildReceivable) {
                const r = data.buildReceivable(flight.id);
                await tx.receivable.create({
                    data: {
                        people: { connect: { id: r.peopleId } },
                        flight: { connect: { id: flight.id } },
                        aircraft: { connect: { id: data.aircraftId } },
                        title: r.title,
                        ...(r.description && { description: r.description }),
                        expiration_date: r.expirationDate,
                        total_amount: r.totalAmount,
                        receivable_type: { connect: { id: r.receivable_type_id } },
                        stakeholder: r.stakeholder,
                    },
                });
            }
            if (data.buildPayable) {
                const p = data.buildPayable(flight.id);
                await tx.payable.create({
                    data: {
                        stakeholder: 'INSTRUCTOR',
                        instructor: { connect: { id: p.instructorId } },
                        flight: { connect: { id: flight.id } },
                        title: p.title,
                        ...(p.description && { description: p.description }),
                        total_amount: p.amount,
                        payable_type: { connect: { id: p.payable_type_id } },
                        expiration_date: p.dueDate,
                    },
                });
            }
            return flight;
        });
        return toFlight(raw);
    }
    async findAircraft(id) {
        const raw = await this.prisma.aircraft.findUnique({
            where: { id },
            select: { id: true, type: true, flight_hour_value: true },
        });
        if (!raw)
            return null;
        return {
            id: raw.id,
            type: raw.type,
            flight_hour_value: raw.flight_hour_value !== null ? Number(raw.flight_hour_value) : null,
        };
    }
    async findSettings() {
        const raw = await this.prisma.settings.findUnique({ where: { id: 1 } });
        if (!raw)
            return null;
        return {
            instructor_percentage: Number(raw.instructor_percentage),
            glider_initial_minutes: raw.glider_initial_minutes,
            glider_initial_value: Number(raw.glider_initial_value),
            glider_minute_value: Number(raw.glider_minute_value),
        };
    }
    buildWhere({ aircraft_id, people_id, instructor_id, student_id, partner_id, type, date_from, date_to, search, }) {
        const AND = [];
        if (aircraft_id)
            AND.push({ aircraft_id });
        if (people_id)
            AND.push({ people_id });
        if (instructor_id)
            AND.push({ instructor_id });
        if (student_id)
            AND.push({ people: { students: { id: student_id } } });
        if (partner_id)
            AND.push({ people: { partners: { id: partner_id } } });
        if (type)
            AND.push({ type: { contains: type, mode: 'insensitive' } });
        if (search) {
            AND.push({
                OR: [
                    {
                        aircraft: {
                            registration: { contains: search, mode: 'insensitive' },
                        },
                    },
                    { people: { name: { contains: search, mode: 'insensitive' } } },
                ],
            });
        }
        if (date_from || date_to) {
            AND.push({
                start_date: {
                    ...(date_from && { gte: date_from }),
                    ...(date_to && { lte: (0, date_fns_1.endOfDay)(date_to) }),
                },
            });
        }
        return AND.length > 0 ? { AND } : {};
    }
    async findAll(dto) {
        const { page = 1, limit = 20 } = dto;
        const where = this.buildWhere(dto);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.flight.findMany({
                where,
                orderBy: { start_date: 'desc' },
                include: flightInclude,
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.flight.count({ where }),
        ]);
        return {
            data: data.map(toFlight),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStats(dto) {
        const where = this.buildWhere(dto);
        const [total, aggregate] = await this.prisma.$transaction([
            this.prisma.flight.count({ where }),
            this.prisma.flight.aggregate({
                where,
                _sum: { total_hours: true, total_amount: true },
            }),
        ]);
        return {
            total,
            total_hours: aggregate._sum.total_hours != null
                ? Number(aggregate._sum.total_hours)
                : null,
            total_revenue: aggregate._sum.total_amount != null
                ? Number(aggregate._sum.total_amount)
                : null,
        };
    }
    async findById(id) {
        const raw = await this.prisma.flight.findUnique({
            where: { id },
            include: flightDetailInclude,
        });
        return raw ? toFlightDetail(raw) : null;
    }
    async updateFlightAndRelations(id, data) {
        const raw = await this.prisma.$transaction(async (tx) => {
            const flight = await tx.flight.update({
                where: { id },
                data: {
                    ...(data.type && { type: data.type }),
                    ...(data.origin && { origin: data.origin }),
                    ...(data.destination && { destination: data.destination }),
                    ...(data.startDate && { start_date: data.startDate }),
                    ...(data.endDate && { end_date: data.endDate }),
                    ...(data.totalHours !== undefined && {
                        total_hours: data.totalHours,
                    }),
                    ...(data.totalAmount !== undefined && {
                        total_amount: data.totalAmount,
                    }),
                    ...(data.calculationBreakdown !== undefined && {
                        calculation_breakdown: data.calculationBreakdown,
                    }),
                    ...(data.aircraftId !== undefined && {
                        aircraft: { connect: { id: data.aircraftId } },
                    }),
                    ...(data.peopleId !== undefined && {
                        people: { connect: { id: data.peopleId } },
                    }),
                    ...(data.instructorId !== undefined && {
                        instructor: data.instructorId
                            ? { connect: { id: data.instructorId } }
                            : { disconnect: true },
                    }),
                },
                include: flightInclude,
            });
            if (data.totalAmount !== undefined || data.peopleId !== undefined) {
                await tx.receivable.updateMany({
                    where: { flight_id: id },
                    data: {
                        ...(data.totalAmount !== undefined && {
                            total_amount: data.totalAmount,
                        }),
                        ...(data.peopleId !== undefined && { people_id: data.peopleId }),
                    },
                });
            }
            if (data.newInstructorPayableAmount !== undefined ||
                (data.instructorId !== undefined && data.instructorId !== null)) {
                await tx.payable.updateMany({
                    where: { flight_id: id },
                    data: {
                        ...(data.newInstructorPayableAmount !== undefined && {
                            total_amount: data.newInstructorPayableAmount,
                        }),
                        ...(data.instructorId !== undefined &&
                            data.instructorId !== null && {
                            instructor_id: data.instructorId,
                        }),
                    },
                });
            }
            return flight;
        });
        return toFlight(raw);
    }
    async closeFlight(id, data) {
        const raw = await this.prisma.$transaction(async (tx) => {
            const flight = await tx.flight.update({
                where: { id },
                data: {
                    end_date: data.endDate,
                    total_hours: data.totalHours,
                    total_amount: data.totalAmount,
                    calculation_breakdown: data.breakdown,
                },
                include: flightInclude,
            });
            if (data.buildReceivable) {
                const r = data.buildReceivable();
                await tx.receivable.create({
                    data: {
                        people: { connect: { id: r.peopleId } },
                        flight: { connect: { id } },
                        aircraft: { connect: { id: flight.aircraft_id } },
                        title: r.title,
                        expiration_date: r.expirationDate,
                        total_amount: r.totalAmount,
                        receivable_type: { connect: { id: r.receivable_type_id } },
                        stakeholder: r.stakeholder,
                    },
                });
            }
            if (data.buildPayable) {
                const p = data.buildPayable();
                await tx.payable.create({
                    data: {
                        stakeholder: 'INSTRUCTOR',
                        instructor: { connect: { id: p.instructorId } },
                        flight: { connect: { id } },
                        title: p.title,
                        total_amount: p.amount,
                        payable_type: { connect: { id: p.payable_type_id } },
                        expiration_date: p.dueDate,
                    },
                });
            }
            return flight;
        });
        return toFlight(raw);
    }
    async hasReceivableWithPayments(flightId) {
        const receivable = await this.prisma.receivable.findFirst({
            where: { flight_id: flightId },
            include: { payments: { take: 1 } },
        });
        return (receivable?.payments.length ?? 0) > 0;
    }
    async delete(id) {
        const raw = await this.prisma.flight.delete({ where: { id } });
        return toBaseFlightOnly(raw);
    }
    async bulkDelete(ids) {
        const count = await this.prisma.flight.count({
            where: { id: { in: ids } },
        });
        if (count !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais voos não foram encontrados');
        const withPayments = await this.prisma.flight.count({
            where: {
                id: { in: ids },
                receivables: { some: { payments: { some: {} } } },
            },
        });
        if (withPayments > 0)
            throw new common_1.BadRequestException('Não é possível excluir voos com pagamentos registrados no recebível vinculado');
        await this.prisma.flight.deleteMany({ where: { id: { in: ids } } });
    }
};
exports.FlightsRepository = FlightsRepository;
exports.FlightsRepository = FlightsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlightsRepository);
//# sourceMappingURL=flights.repository.js.map