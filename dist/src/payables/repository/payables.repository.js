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
exports.PayablesRepository = void 0;
const recurrence_enum_1 = require("../../common/enums/recurrence.enum");
const stakeholder_enum_1 = require("../../common/enums/stakeholder.enum");
const title_status_enum_1 = require("../../common/enums/title-status.enum");
const common_1 = require("@nestjs/common");
const client_runtime_utils_1 = require("@prisma/client-runtime-utils");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const payable_model_1 = require("../model/payable.model");
const payable_payment_model_1 = require("../model/payable-payment.model");
const include = {
    people: true,
    student: { include: { people: true } },
    company: true,
    aircraft: true,
    instructor: { include: { people: true } },
    partner: { include: { people: true } },
    employee: { include: { people: true } },
    payments: {
        orderBy: { payment_date: client_1.Prisma.SortOrder.desc },
        include: { file: true },
    },
    payable_type: true,
};
function toPayable(raw) {
    return (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, raw);
}
function toPayment(raw) {
    return (0, class_transformer_1.plainToInstance)(payable_payment_model_1.PayablePayment, raw);
}
let PayablesRepository = class PayablesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildWhere({ status, person_id, instructor_id, employee_id, search, date_from, date_to, }) {
        const AND = [];
        if (status === title_status_enum_1.ETitleStatus.OVERDUE) {
            AND.push({ status: { not: title_status_enum_1.ETitleStatus.PAID } });
            AND.push({ expiration_date: { lt: new Date() } });
        }
        else if (status) {
            AND.push({ status });
        }
        if (person_id)
            AND.push({ people_id: person_id });
        if (instructor_id)
            AND.push({ instructor_id });
        if (employee_id)
            AND.push({ employee_id });
        if (search)
            AND.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { people: { name: { contains: search, mode: 'insensitive' } } },
                    { company: { name: { contains: search, mode: 'insensitive' } } },
                    {
                        instructor: {
                            people: { name: { contains: search, mode: 'insensitive' } },
                        },
                    },
                    {
                        partner: {
                            people: { name: { contains: search, mode: 'insensitive' } },
                        },
                    },
                    {
                        employee: {
                            people: { name: { contains: search, mode: 'insensitive' } },
                        },
                    },
                ],
            });
        if (date_from || date_to) {
            const range = {};
            if (date_from)
                range.gte = (0, date_fns_1.startOfDay)(date_from);
            if (date_to)
                range.lte = (0, date_fns_1.endOfDay)(date_to);
            AND.push({ created_at: range });
        }
        return AND.length > 0 ? { AND } : undefined;
    }
    async findAll(dto) {
        const { page = 1, limit = 20 } = dto;
        const where = this.buildWhere(dto);
        const skip = (page - 1) * limit;
        const [data, total] = await this.prisma.$transaction([
            this.prisma.payable.findMany({
                where,
                orderBy: { created_at: 'desc' },
                include,
                skip,
                take: limit,
            }),
            this.prisma.payable.count({ where }),
        ]);
        return {
            data: data.map((p) => toPayable(p)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStats(dto) {
        const where = this.buildWhere(dto);
        const aggregate = await this.prisma.payable.aggregate({
            where,
            _sum: { total_amount: true, amount_paid: true },
        });
        return {
            total_amount: aggregate._sum.total_amount != null
                ? Number(aggregate._sum.total_amount)
                : 0,
            amount_paid: aggregate._sum.amount_paid != null
                ? Number(aggregate._sum.amount_paid)
                : 0,
        };
    }
    async findById(id) {
        const payable = await this.prisma.payable.findUnique({
            where: { id },
            include,
        });
        return payable ? toPayable(payable) : null;
    }
    async create({ person_id, student_id, company_id, plane_id, instructor_id, partner_id, employee_id, recurrence, occurrences, payable_type_id, ...dto }) {
        const payerRelation = {
            [stakeholder_enum_1.EStakeholder.PEOPLE]: { people: { connect: { id: person_id } } },
            [stakeholder_enum_1.EStakeholder.STUDENT]: { student: { connect: { id: student_id } } },
            [stakeholder_enum_1.EStakeholder.COMPANY]: { company: { connect: { id: company_id } } },
            [stakeholder_enum_1.EStakeholder.INSTRUCTOR]: {
                instructor: { connect: { id: instructor_id } },
            },
            [stakeholder_enum_1.EStakeholder.PARTNER]: { partner: { connect: { id: partner_id } } },
            [stakeholder_enum_1.EStakeholder.EMPLOYEE]: { employee: { connect: { id: employee_id } } },
            [stakeholder_enum_1.EStakeholder.NONE]: {},
        }[dto.stakeholder];
        const relations = {
            ...payerRelation,
            ...(plane_id && { aircraft: { connect: { id: plane_id } } }),
            ...(payable_type_id && {
                payable_type: { connect: { id: payable_type_id } },
            }),
        };
        if (recurrence) {
            const expiration_dates = Array.from({ length: occurrences }, (_, i) => {
                return {
                    [recurrence_enum_1.ERecurrence.WEEKLY]: (0, date_fns_1.addWeeks)(dto.expiration_date, i),
                    [recurrence_enum_1.ERecurrence.MONTHLY]: (0, date_fns_1.addMonths)(dto.expiration_date, i),
                    [recurrence_enum_1.ERecurrence.YEARLY]: (0, date_fns_1.addYears)(dto.expiration_date, i),
                }[recurrence];
            });
            const results = await this.prisma.$transaction(expiration_dates.map((expiration_date, i) => this.prisma.payable.create({
                data: {
                    ...dto,
                    ...relations,
                    expiration_date,
                    title: `${dto.title} (${i + 1}/${occurrences})`,
                },
                include,
            })));
            return results.map((p) => toPayable(p));
        }
        const result = await this.prisma.payable.create({
            data: { ...dto, ...relations },
            include,
        });
        return toPayable(result);
    }
    async update(id, { person_id, student_id, company_id, plane_id, instructor_id, partner_id, employee_id, payable_type_id, ...dto }) {
        const payerRelation = dto.stakeholder &&
            {
                [stakeholder_enum_1.EStakeholder.PEOPLE]: {
                    people: person_id
                        ? { connect: { id: person_id } }
                        : { disconnect: true },
                },
                [stakeholder_enum_1.EStakeholder.STUDENT]: {
                    student: student_id
                        ? { connect: { id: student_id } }
                        : { disconnect: true },
                },
                [stakeholder_enum_1.EStakeholder.COMPANY]: {
                    company: company_id
                        ? { connect: { id: company_id } }
                        : { disconnect: true },
                },
                [stakeholder_enum_1.EStakeholder.INSTRUCTOR]: {
                    instructor: instructor_id
                        ? { connect: { id: instructor_id } }
                        : { disconnect: true },
                },
                [stakeholder_enum_1.EStakeholder.PARTNER]: {
                    partner: partner_id
                        ? { connect: { id: partner_id } }
                        : { disconnect: true },
                },
                [stakeholder_enum_1.EStakeholder.EMPLOYEE]: {
                    employee: employee_id
                        ? { connect: { id: employee_id } }
                        : { disconnect: true },
                },
                [stakeholder_enum_1.EStakeholder.NONE]: {},
            }[dto.stakeholder];
        const relations = {
            ...payerRelation,
            ...(plane_id !== undefined && {
                aircraft: plane_id
                    ? { connect: { id: plane_id } }
                    : { disconnect: true },
            }),
            ...(payable_type_id !== undefined && {
                payable_type: payable_type_id
                    ? { connect: { id: payable_type_id } }
                    : { disconnect: true },
            }),
        };
        const result = await this.prisma.payable.update({
            where: { id },
            data: { ...dto, ...relations },
            include,
        });
        return toPayable(result);
    }
    async delete(id) {
        const result = await this.prisma.payable.delete({ where: { id } });
        return (0, class_transformer_1.plainToInstance)(payable_model_1.Payable, result);
    }
    async findPaymentById(paymentId) {
        const payment = await this.prisma.payablePayment.findUnique({
            where: { id: paymentId },
            include: { file: true },
        });
        return payment ? toPayment(payment) : null;
    }
    async createPayment(id, dto) {
        const result = await this.prisma.$transaction(async (tx) => {
            const payable = await tx.payable.findUniqueOrThrow({ where: { id } });
            const newAmountPaid = payable.amount_paid.add(new client_runtime_utils_1.Decimal(dto.amount));
            const status = newAmountPaid.gte(payable.total_amount)
                ? title_status_enum_1.ETitleStatus.PAID
                : title_status_enum_1.ETitleStatus.PARTIAL;
            await tx.payablePayment.create({
                data: {
                    payable: { connect: { id } },
                    amount: dto.amount,
                    method: dto.method,
                },
            });
            return tx.payable.update({
                where: { id },
                data: { amount_paid: newAmountPaid, status },
                include,
            });
        });
        return toPayable(result);
    }
    async deletePayment(paymentId) {
        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payablePayment.findUniqueOrThrow({
                where: { id: paymentId },
            });
            const payable = await tx.payable.findUniqueOrThrow({
                where: { id: payment.payable_id },
            });
            if (payable) {
                const newAmountPaid = payable.amount_paid.sub(payment.amount);
                const newAmountPaidClamped = newAmountPaid.lte(0)
                    ? new client_runtime_utils_1.Decimal(0)
                    : newAmountPaid;
                const status = newAmountPaidClamped.lte(0)
                    ? title_status_enum_1.ETitleStatus.PENDING
                    : title_status_enum_1.ETitleStatus.PARTIAL;
                await tx.payable.update({
                    where: { id: payable.id },
                    data: { amount_paid: newAmountPaidClamped, status },
                });
            }
            return tx.payablePayment.delete({ where: { id: paymentId } });
        });
        return toPayment(result);
    }
    async addPaymentInvoice(paymentId, fileData) {
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.payablePayment.findUnique({
                where: { id: paymentId },
                select: { file_id: true },
            });
            if (existing?.file_id) {
                await tx.file.delete({ where: { id: existing.file_id } });
            }
            const file = await tx.file.create({ data: fileData });
            return tx.payablePayment.update({
                where: { id: paymentId },
                data: { file: { connect: { id: file.id } } },
            });
        });
        return toPayment(result);
    }
    async deletePaymentInvoice(paymentId) {
        const result = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.payablePayment.findUnique({
                where: { id: paymentId },
                select: { file_id: true },
            });
            if (existing?.file_id) {
                await tx.payablePayment.update({
                    where: { id: paymentId },
                    data: { file: { disconnect: true } },
                });
                await tx.file.delete({ where: { id: existing.file_id } });
            }
            return tx.payablePayment.findUniqueOrThrow({ where: { id: paymentId } });
        });
        return toPayment(result);
    }
    async bulkDelete(ids) {
        const count = await this.prisma.payable.count({
            where: { id: { in: ids } },
        });
        if (count !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais pagáveis não foram encontrados');
        await this.prisma.payable.deleteMany({ where: { id: { in: ids } } });
    }
};
exports.PayablesRepository = PayablesRepository;
exports.PayablesRepository = PayablesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayablesRepository);
//# sourceMappingURL=payables.repository.js.map