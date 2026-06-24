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
exports.PeoplesRepository = void 0;
const stakeholder_enum_1 = require("../../../common/enums/stakeholder.enum");
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const prisma_service_1 = require("../../../prisma/prisma.service");
const people_model_1 = require("../../model/people.model");
const peopleInclude = {
    address: true,
    instructors: true,
    students: true,
    partners: true,
    employees: true,
};
const peopleDetailInclude = {
    address: true,
    instructors: true,
    students: true,
    partners: true,
    employees: true,
    receivables: { orderBy: { created_at: 'desc' } },
};
let PeoplesRepository = class PeoplesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll({ search, category, date_from, date_to, page = 1, limit = 20, }) {
        const AND = [];
        if (search) {
            AND.push({
                OR: [
                    { cpf: { contains: search } },
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (category === 'instructor')
            AND.push({ instructors: { isNot: null } });
        else if (category === 'student')
            AND.push({ students: { isNot: null } });
        else if (category === 'partner')
            AND.push({ partners: { isNot: null } });
        else if (category === 'employee')
            AND.push({ employees: { isNot: null } });
        if (date_from || date_to) {
            const range = {};
            if (date_from)
                range.gte = (0, date_fns_1.startOfDay)(date_from);
            if (date_to)
                range.lte = (0, date_fns_1.endOfDay)(date_to);
            AND.push({ created_at: range });
        }
        const where = AND.length > 0 ? { AND } : {};
        const skip = (page - 1) * limit;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.people.findMany({
                where,
                orderBy: { name: 'asc' },
                include: peopleInclude,
                skip,
                take: limit,
            }),
            this.prisma.people.count({ where: where }),
        ]);
        return {
            data: data.map((item) => (0, class_transformer_1.plainToInstance)(people_model_1.People, item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const raw = await this.prisma.people.findUnique({
            where: { id },
            include: peopleDetailInclude,
        });
        return raw ? (0, class_transformer_1.plainToInstance)(people_model_1.People, raw) : null;
    }
    async findByCpf(cpf) {
        const raw = await this.prisma.people.findUnique({ where: { cpf } });
        return raw ? (0, class_transformer_1.plainToInstance)(people_model_1.People, raw) : null;
    }
    async findByEmail(email) {
        const raw = await this.prisma.people.findUnique({ where: { email } });
        return raw ? (0, class_transformer_1.plainToInstance)(people_model_1.People, raw) : null;
    }
    async create({ instructor, student, partner, employee, street, neighborhood, city, state, zip_code, ...dto }) {
        const addressFields = { street, neighborhood, city, state, zip_code };
        const hasAddress = Object.values(addressFields).some((v) => v !== undefined);
        const raw = await this.prisma.people.create({
            data: {
                cpf: dto.cpf,
                name: dto.name,
                email: dto.email,
                phone_number: dto.phone_number,
                ...(hasAddress && { address: { create: addressFields } }),
                ...(instructor && { instructors: { create: instructor } }),
                ...(student && { students: { create: student } }),
                ...(partner && { partners: { create: partner } }),
                ...(employee && { employees: { create: employee } }),
            },
            include: peopleInclude,
        });
        return (0, class_transformer_1.plainToInstance)(people_model_1.People, raw);
    }
    async update(id, { instructor, student, partner, employee, street, neighborhood, city, state, zip_code, ...dto }) {
        const existing = await this.prisma.people.findUnique({
            where: { id },
            select: {
                instructors: { select: { id: true } },
                students: { select: { id: true } },
                partners: { select: { id: true } },
                employees: { select: { id: true } },
            },
        });
        const data = { ...dto };
        const addressFields = { street, neighborhood, city, state, zip_code };
        const hasAddress = Object.values(addressFields).some((v) => v !== undefined);
        if (hasAddress) {
            data.address = {
                upsert: {
                    create: addressFields,
                    update: addressFields,
                },
            };
        }
        if (student !== undefined) {
            const e = existing?.students;
            data.students = e
                ? { update: { where: { id: e.id }, data: student } }
                : { create: student };
        }
        if (partner !== undefined) {
            const e = existing?.partners;
            data.partners = e
                ? { update: { where: { id: e.id }, data: partner } }
                : { create: partner };
        }
        if (instructor !== undefined) {
            const e = existing?.instructors;
            data.instructors = e
                ? { update: { where: { id: e.id }, data: instructor } }
                : { create: instructor };
        }
        if (employee !== undefined) {
            const e = existing?.employees;
            data.employees = e
                ? { update: { where: { id: e.id }, data: employee } }
                : { create: employee };
        }
        const raw = await this.prisma.people.update({
            where: { id },
            data,
            include: peopleInclude,
        });
        return (0, class_transformer_1.plainToInstance)(people_model_1.People, raw);
    }
    async delete(id) {
        await this.prisma.people.delete({ where: { id } });
    }
    async bulkDelete(ids) {
        const count = await this.prisma.people.count({
            where: { id: { in: ids } },
        });
        if (count !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais registros não foram encontrados');
        await this.prisma.people.deleteMany({ where: { id: { in: ids } } });
    }
    async getStats() {
        const [received, paid, hours, flightCount] = await Promise.all([
            this.prisma.receivable.aggregate({
                _sum: { amount_received: true },
                where: { stakeholder: stakeholder_enum_1.EStakeholder.PEOPLE },
            }),
            this.prisma.payable.aggregate({ _sum: { amount_paid: true } }),
            this.prisma.flight.aggregate({ _sum: { total_hours: true } }),
            this.prisma.flight.count(),
        ]);
        return {
            total_received: Number(received._sum.amount_received ?? 0),
            total_paid: Number(paid._sum.amount_paid ?? 0),
            total_hours: Number(hours._sum.total_hours ?? 0),
            total_flights: flightCount,
        };
    }
};
exports.PeoplesRepository = PeoplesRepository;
exports.PeoplesRepository = PeoplesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PeoplesRepository);
//# sourceMappingURL=peoples.repository.js.map