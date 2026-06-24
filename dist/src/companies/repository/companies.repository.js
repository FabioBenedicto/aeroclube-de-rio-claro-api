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
exports.CompaniesRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const company_model_1 = require("../model/company.model");
const companyInclude = {
    receivables: { orderBy: { created_at: client_1.Prisma.SortOrder.desc } },
    payables: { orderBy: { created_at: client_1.Prisma.SortOrder.desc } },
};
let CompaniesRepository = class CompaniesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll({ search, date_from, date_to, page = 1, limit = 20, }) {
        const AND = [];
        if (search) {
            AND.push({
                OR: [
                    { cnpj: { contains: search } },
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
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
        const where = AND.length > 0 ? { AND } : {};
        const skip = (page - 1) * limit;
        const args = {
            where,
            orderBy: { name: client_1.Prisma.SortOrder.asc },
            skip,
            take: limit,
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.company.findMany(args),
            this.prisma.company.count({ where }),
        ]);
        return {
            data: data.map((item) => (0, class_transformer_1.plainToInstance)(company_model_1.Company, item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const raw = await this.prisma.company.findUnique({
            where: { id },
            include: companyInclude,
        });
        return raw ? (0, class_transformer_1.plainToInstance)(company_model_1.Company, raw) : null;
    }
    async findByCnpj(cnpj) {
        const raw = await this.prisma.company.findUnique({ where: { cnpj } });
        return raw ? (0, class_transformer_1.plainToInstance)(company_model_1.Company, raw) : null;
    }
    async findByEmail(email) {
        const raw = await this.prisma.company.findUnique({ where: { email } });
        return raw ? (0, class_transformer_1.plainToInstance)(company_model_1.Company, raw) : null;
    }
    async create(data) {
        const raw = await this.prisma.company.create({ data });
        return (0, class_transformer_1.plainToInstance)(company_model_1.Company, raw);
    }
    async update(id, data) {
        const raw = await this.prisma.company.update({ where: { id }, data });
        return (0, class_transformer_1.plainToInstance)(company_model_1.Company, raw);
    }
    async delete(id) {
        await this.prisma.company.delete({ where: { id } });
    }
    async bulkDelete(ids) {
        const count = await this.prisma.company.count({
            where: { id: { in: ids } },
        });
        if (count !== ids.length)
            throw new common_1.UnprocessableEntityException('Uma ou mais empresas não foram encontradas');
        await this.prisma.company.deleteMany({ where: { id: { in: ids } } });
    }
};
exports.CompaniesRepository = CompaniesRepository;
exports.CompaniesRepository = CompaniesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesRepository);
//# sourceMappingURL=companies.repository.js.map