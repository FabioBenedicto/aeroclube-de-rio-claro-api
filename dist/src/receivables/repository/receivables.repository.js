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
exports.ReceivablesRepository = void 0;
const recurrence_enum_1 = require("../../common/enums/recurrence.enum");
const stakeholder_enum_1 = require("../../common/enums/stakeholder.enum");
const common_1 = require("@nestjs/common");
const client_runtime_utils_1 = require("@prisma/client-runtime-utils");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const title_status_enum_1 = require("../../common/enums/title-status.enum");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const receivable_model_1 = require("../model/receivable.model");
const receivable_payment_model_1 = require("../model/receivable-payment.model");
const receivablesInclude = {
    receivable_type: true,
    people: true,
    student: { include: { people: true } },
    partner: { include: { people: true } },
    instructor: { include: { people: true } },
    employee: { include: { people: true } },
    company: true,
    aircraft: true,
    flight: {
        include: {
            aircraft: true,
            people: true,
            instructor: { include: { people: true } },
        },
    },
    payments: {
        orderBy: { payment_date: client_1.Prisma.SortOrder.desc },
        include: { file: true },
    },
};
let ReceivablesRepository = class ReceivablesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll({ status, search, date_from, date_to, people_id, page = 1, limit = 20, }) {
        const now = new Date();
        const AND = [];
        if (status === '1') {
            AND.push({ status: title_status_enum_1.ETitleStatus.PAID });
        }
        else if (status === '0') {
            AND.push({ status: title_status_enum_1.ETitleStatus.PENDING, expiration_date: { gte: now } });
        }
        else if (status === 'partial') {
            AND.push({ status: title_status_enum_1.ETitleStatus.PARTIAL });
        }
        else if (status === 'overdue') {
            AND.push({
                status: { not: title_status_enum_1.ETitleStatus.PAID },
                expiration_date: { lt: now },
            });
        }
        if (search) {
            AND.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { people: { name: { contains: search, mode: 'insensitive' } } },
                    { company: { name: { contains: search, mode: 'insensitive' } } },
                ],
            });
        }
        if (people_id) {
            AND.push({ people_id });
        }
        if (date_from || date_to) {
            const range = {};
            if (date_from)
                range.gte = (0, date_fns_1.startOfDay)(date_from);
            if (date_to)
                range.lte = (0, date_fns_1.endOfDay)(date_to);
            AND.push({ created_at: range });
        }
        const where = AND.length > 0 ? { AND } : {};
        const args = {
            where,
            orderBy: {
                created_at: 'desc',
            },
            include: receivablesInclude,
            skip: (page - 1) * limit,
            take: limit,
        };
        const [data, total] = await this.prisma.$transaction([
            this.prisma.receivable.findMany(args),
            this.prisma.receivable.count({ where }),
        ]);
        return {
            data: data.map((item) => (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const raw = await this.prisma.receivable.findUnique({
            where: { id },
            include: receivablesInclude,
        });
        return raw ? (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, raw) : null;
    }
    async create({ person_id, student_id, company_id, plane_id, flight_id, instructor_id, partner_id, employee_id, recurrence, occurrences, receivable_type_id, ...dto }) {
        const receiverRelation = {
            [stakeholder_enum_1.EStakeholder.PEOPLE]: { people: { connect: { id: person_id } } },
            [stakeholder_enum_1.EStakeholder.STUDENT]: { student: { connect: { id: student_id } } },
            [stakeholder_enum_1.EStakeholder.COMPANY]: { company: { connect: { id: company_id } } },
            [stakeholder_enum_1.EStakeholder.INSTRUCTOR]: {
                instructor: { connect: { id: instructor_id } },
            },
            [stakeholder_enum_1.EStakeholder.PARTNER]: { partner: { connect: { id: partner_id } } },
            [stakeholder_enum_1.EStakeholder.EMPLOYEE]: { employee: { connect: { id: employee_id } } },
            [stakeholder_enum_1.EStakeholder.NONE]: {},
        }[dto.stakeholder ?? stakeholder_enum_1.EStakeholder.NONE];
        const relations = {
            ...receiverRelation,
            ...(plane_id && { aircraft: { connect: { id: plane_id } } }),
            ...(flight_id && { flight: { connect: { id: flight_id } } }),
            ...(receivable_type_id && {
                receivable_type: { connect: { id: receivable_type_id } },
            }),
        };
        if (recurrence) {
            const expirations_date = Array.from({ length: occurrences }, (_, i) => {
                return {
                    [recurrence_enum_1.ERecurrence.WEEKLY]: (0, date_fns_1.addWeeks)(dto.expiration_date, i),
                    [recurrence_enum_1.ERecurrence.MONTHLY]: (0, date_fns_1.addMonths)(dto.expiration_date, i),
                    [recurrence_enum_1.ERecurrence.YEARLY]: (0, date_fns_1.addYears)(dto.expiration_date, i),
                }[recurrence];
            });
            const results = await this.prisma.$transaction(expirations_date.map((expiration_date, i) => this.prisma.receivable.create({
                data: {
                    ...dto,
                    ...relations,
                    expiration_date,
                    title: `${dto.title} (${i + 1}/${occurrences})`,
                },
                include: receivablesInclude,
            })));
            return results.map((item) => (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, item));
        }
        const result = await this.prisma.receivable.create({
            data: {
                ...dto,
                ...relations,
            },
            include: receivablesInclude,
        });
        return (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, result);
    }
    async update(id, { person_id, student_id, company_id, plane_id, flight_id, instructor_id, partner_id, employee_id, receivable_type_id, ...dto }) {
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
            ...(flight_id !== undefined && {
                flight: flight_id
                    ? { connect: { id: flight_id } }
                    : { disconnect: true },
            }),
            ...(receivable_type_id !== undefined && {
                receivable_type: { connect: { id: receivable_type_id } },
            }),
        };
        const raw = await this.prisma.receivable.update({
            where: { id },
            data: {
                ...dto,
                ...relations,
            },
            include: {
                people: true,
                company: true,
                flight: {
                    include: {
                        aircraft: true,
                        people: true,
                        instructor: { include: { people: true } },
                    },
                },
                aircraft: true,
                receivable_type: true,
            },
        });
        return (0, class_transformer_1.plainToInstance)(receivable_model_1.Receivable, raw);
    }
    async delete(id) {
        await this.prisma.receivable.delete({ where: { id } });
    }
    async findPaymentById(paymentId) {
        const raw = await this.prisma.receivablePayment.findUnique({
            where: { id: paymentId },
            include: { file: true },
        });
        return raw ? (0, class_transformer_1.plainToInstance)(receivable_payment_model_1.ReceivablePayment, raw) : null;
    }
    async createPayment(receivableId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const receivable = await tx.receivable.findUnique({
                where: { id: receivableId },
            });
            if (!receivable)
                throw new common_1.NotFoundException(`Recebível ${receivableId} não encontrado`);
            if (receivable.status === title_status_enum_1.ETitleStatus.PAID)
                throw new common_1.BadRequestException('Recebível já liquidado');
            const paymentDate = dto.payment_date
                ? new Date(dto.payment_date)
                : new Date();
            let outstanding = receivable.total_amount.sub(receivable.amount_received);
            let totalApplied = new client_runtime_utils_1.Decimal(0);
            if (dto.use_credit && receivable.people_id) {
                const customer = await tx.people.findUnique({
                    where: { id: receivable.people_id },
                    select: { credit_balance: true },
                });
                const creditAvailable = customer?.credit_balance ?? new client_runtime_utils_1.Decimal(0);
                const creditToApply = client_runtime_utils_1.Decimal.min(creditAvailable, outstanding);
                if (creditToApply.gt(0)) {
                    await tx.people.update({
                        where: { id: receivable.people_id },
                        data: { credit_balance: { decrement: creditToApply.toNumber() } },
                    });
                    await tx.receivablePayment.create({
                        data: {
                            receivable: { connect: { id: receivableId } },
                            amount: creditToApply,
                            method: 'Credit',
                            payment_date: paymentDate,
                        },
                    });
                    totalApplied = totalApplied.add(creditToApply);
                    outstanding = outstanding.sub(creditToApply);
                }
            }
            let cashPayment = null;
            const cashAmount = new client_runtime_utils_1.Decimal(dto.amount_received);
            if (cashAmount.gt(0)) {
                const cashToApply = client_runtime_utils_1.Decimal.min(cashAmount, outstanding);
                totalApplied = totalApplied.add(cashToApply);
                const raw = await tx.receivablePayment.create({
                    data: {
                        receivable: { connect: { id: receivableId } },
                        amount: cashAmount,
                        method: dto.payment_method,
                        payment_date: paymentDate,
                    },
                });
                cashPayment = (0, class_transformer_1.plainToInstance)(receivable_payment_model_1.ReceivablePayment, raw);
            }
            const newAmountReceived = receivable.amount_received.add(totalApplied);
            const newStatus = newAmountReceived.gte(receivable.total_amount)
                ? title_status_enum_1.ETitleStatus.PAID
                : title_status_enum_1.ETitleStatus.PARTIAL;
            await tx.receivable.update({
                where: { id: receivableId },
                data: { amount_received: newAmountReceived, status: newStatus },
            });
            if (receivable.adds_credit && receivable.people_id && cashAmount.gt(0)) {
                await tx.people.update({
                    where: { id: receivable.people_id },
                    data: { credit_balance: { increment: cashAmount.toNumber() } },
                });
            }
            return {
                payment: cashPayment,
                status: newStatus === title_status_enum_1.ETitleStatus.PAID ? 'paid' : 'partial',
            };
        });
    }
    async deletePayment(paymentId) {
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.receivablePayment.findUniqueOrThrow({
                where: { id: paymentId },
            });
            const receivable = await tx.receivable.findUniqueOrThrow({
                where: { id: payment.receivable_id },
            });
            if (receivable) {
                const newAmountReceived = receivable.amount_received.sub(payment.amount);
                await tx.receivable.update({
                    where: { id: receivable.id },
                    data: {
                        amount_received: newAmountReceived.lte(0) ? 0 : newAmountReceived,
                        status: newAmountReceived.lte(0)
                            ? title_status_enum_1.ETitleStatus.PENDING
                            : title_status_enum_1.ETitleStatus.PARTIAL,
                    },
                });
                if (receivable.adds_credit &&
                    receivable.people_id &&
                    payment.method !== 'Credit') {
                    await tx.people.update({
                        where: { id: receivable.people_id },
                        data: {
                            credit_balance: { decrement: payment.amount.toNumber() },
                        },
                    });
                }
            }
            await tx.receivablePayment.delete({
                where: { id: paymentId },
            });
        });
    }
    async attachPaymentInvoice(paymentId, fileData) {
        const raw = await this.prisma.$transaction(async (tx) => {
            const existing = await tx.receivablePayment.findUnique({
                where: { id: paymentId },
                select: { file_id: true },
            });
            if (existing?.file_id) {
                await tx.file.delete({ where: { id: existing.file_id } });
            }
            const file = await tx.file.create({ data: fileData });
            return tx.receivablePayment.update({
                where: { id: paymentId },
                data: { file: { connect: { id: file.id } } },
            });
        });
        return (0, class_transformer_1.plainToInstance)(receivable_payment_model_1.ReceivablePayment, raw);
    }
    async removePaymentInvoice(paymentId) {
        await this.prisma.$transaction(async (tx) => {
            const existing = await tx.receivablePayment.findUnique({
                where: { id: paymentId },
                select: { file_id: true },
            });
            if (existing?.file_id) {
                await tx.receivablePayment.update({
                    where: { id: paymentId },
                    data: { file: { disconnect: true } },
                });
                await tx.file.delete({ where: { id: existing.file_id } });
            }
        });
    }
    async bulkDelete(ids) {
        const count = await this.prisma.receivable.count({
            where: { id: { in: ids } },
        });
        if (count !== ids.length)
            throw new common_1.UnprocessableEntityException('Um ou mais recebíveis não foram encontrados');
        const paidCount = await this.prisma.receivable.count({
            where: { id: { in: ids }, status: title_status_enum_1.ETitleStatus.PAID },
        });
        if (paidCount > 0)
            throw new common_1.UnprocessableEntityException('Não é possível excluir recebíveis já pagos');
        await this.prisma.receivable.deleteMany({ where: { id: { in: ids } } });
    }
};
exports.ReceivablesRepository = ReceivablesRepository;
exports.ReceivablesRepository = ReceivablesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceivablesRepository);
//# sourceMappingURL=receivables.repository.js.map