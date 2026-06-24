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
exports.AircraftRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const aircraft_model_1 = require("../model/aircraft.model");
const titleStakeholderInclude = {
    people: true,
    company: true,
    instructor: {
        include: {
            people: true,
        },
    },
    partner: {
        include: {
            people: true,
        },
    },
    employee: {
        include: {
            people: true,
        },
    },
};
const aircraftInclude = {
    flights: {
        where: { end_date: { not: null } },
        orderBy: {
            start_date: client_1.Prisma.SortOrder.desc,
        },
        take: 10,
        include: {
            people: true,
            instructor: {
                include: { people: true },
            },
        },
    },
    payables: {
        orderBy: {
            created_at: client_1.Prisma.SortOrder.desc,
        },
        include: {
            payable_type: true,
            ...titleStakeholderInclude,
        },
    },
    receivables: {
        orderBy: {
            created_at: client_1.Prisma.SortOrder.desc,
        },
        include: {
            receivable_type: true,
            ...titleStakeholderInclude,
        },
    },
};
let AircraftRepository = class AircraftRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll({ page = 1, limit = 20, date_from, date_to, search, aircraft_type, }) {
        const AND = [];
        if (search) {
            AND.push({
                OR: [
                    { registration: { contains: search, mode: 'insensitive' } },
                    { model: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (date_from || date_to) {
            AND.push({
                created_at: {
                    ...(date_from && { gte: (0, date_fns_1.startOfDay)(date_from) }),
                    ...(date_to && { lte: (0, date_fns_1.endOfDay)(date_to) }),
                },
            });
        }
        if (aircraft_type) {
            AND.push({ type: aircraft_type });
        }
        const where = AND.length > 0 ? { AND } : {};
        const skip = (page - 1) * limit;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.aircraft.findMany({
                where,
                orderBy: {
                    registration: 'asc',
                },
                skip,
                take: limit,
            }),
            this.prisma.aircraft.count({ where }),
        ]);
        return {
            data: data.map((item) => (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const raw = await this.prisma.aircraft.findUnique({
            where: { id },
            include: aircraftInclude,
        });
        if (!raw)
            return null;
        return (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, raw);
    }
    async findByRegistration(registration) {
        const raw = await this.prisma.aircraft.findUnique({
            where: {
                registration,
            },
        });
        return raw ? (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, raw) : null;
    }
    async create(data) {
        const raw = await this.prisma.aircraft.create({ data });
        return (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, raw);
    }
    async update(id, data) {
        const raw = await this.prisma.aircraft.update({ where: { id }, data });
        return (0, class_transformer_1.plainToInstance)(aircraft_model_1.Aircraft, raw);
    }
    async delete(id) {
        await this.prisma.aircraft.delete({ where: { id } });
    }
    async bulkDelete(ids) {
        const count = await this.prisma.aircraft.count({
            where: { id: { in: ids } },
        });
        if (count !== ids.length)
            throw new common_1.UnprocessableEntityException('Uma ou mais aeronaves não foram encontradas');
        await this.prisma.aircraft.deleteMany({ where: { id: { in: ids } } });
    }
};
exports.AircraftRepository = AircraftRepository;
exports.AircraftRepository = AircraftRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AircraftRepository);
//# sourceMappingURL=aircraft.repository.js.map