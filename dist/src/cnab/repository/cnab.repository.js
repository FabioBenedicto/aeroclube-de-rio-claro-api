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
exports.CnabRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const prisma_service_1 = require("../../prisma/prisma.service");
const cnab_remittent_model_1 = require("../model/cnab-remittent.model");
const remittentInclude = {
    file: true,
};
function toRemessa(raw) {
    return (0, class_transformer_1.plainToInstance)(cnab_remittent_model_1.CnabRemittent, {
        ...raw,
        bill_ids: raw.bill_ids,
        bills: [],
    });
}
let CnabRepository = class CnabRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listRemittent(page, limit) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.cnabRemessa.findMany({
                orderBy: { created_at: 'desc' },
                include: remittentInclude,
                skip,
                take: limit,
            }),
            this.prisma.cnabRemessa.count(),
        ]);
        return {
            data: data.map(toRemessa),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findRemittent(id) {
        const raw = await this.prisma.cnabRemessa.findUnique({
            where: { id },
            include: remittentInclude,
        });
        return raw ? toRemessa(raw) : null;
    }
    async createRemittent(data) {
        const raw = await this.prisma.$transaction(async (tx) => {
            const file = await tx.file.create({ data: data.file });
            return tx.cnabRemessa.create({
                data: {
                    sequence_number: data.sequence_number,
                    bill_ids: data.bill_ids,
                    bill_count: data.bill_count,
                    total_amount: data.total_amount,
                    file: {
                        connect: {
                            id: file.id,
                        },
                    },
                },
                include: remittentInclude,
            });
        });
        return toRemessa(raw);
    }
    async deleteRemessa(id) {
        await this.prisma.cnabRemessa.delete({
            where: {
                id,
            },
        });
    }
};
exports.CnabRepository = CnabRepository;
exports.CnabRepository = CnabRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CnabRepository);
//# sourceMappingURL=cnab.repository.js.map