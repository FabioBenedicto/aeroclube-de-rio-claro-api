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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightsService = void 0;
const common_1 = require("@nestjs/common");
const client_runtime_utils_1 = require("@prisma/client-runtime-utils");
const payable_types_service_1 = require("../payable-types/payable-types.service");
const receivable_types_service_1 = require("../receivable-types/receivable-types.service");
const flights_repository_interface_1 = require("./repository/flights-repository.interface");
let FlightsService = class FlightsService {
    flightsRepository;
    receivableTypesService;
    payableTypesService;
    constructor(flightsRepository, receivableTypesService, payableTypesService) {
        this.flightsRepository = flightsRepository;
        this.receivableTypesService = receivableTypesService;
        this.payableTypesService = payableTypesService;
    }
    calculateAmount(aircraftType, startDate, endDate, aircraft, settings) {
        const diffMs = endDate.getTime() - startDate.getTime();
        const totalHours = new client_runtime_utils_1.Decimal((diffMs / 3_600_000).toFixed(2));
        if (aircraftType === 'glider') {
            const totalMinutes = Math.round(diffMs / 60_000);
            const initialMinutes = settings?.glider_initial_minutes ?? 45;
            const initialValue = new client_runtime_utils_1.Decimal(settings?.glider_initial_value ?? 330);
            const minuteValue = new client_runtime_utils_1.Decimal(settings?.glider_minute_value ?? 3);
            const exceededMinutes = Math.max(0, totalMinutes - initialMinutes);
            const totalAmount = new client_runtime_utils_1.Decimal(initialValue.plus(minuteValue.mul(exceededMinutes)).toFixed(2));
            return {
                totalHours,
                totalAmount,
                breakdown: {
                    aircraft_type: 'glider',
                    total_minutes: totalMinutes,
                    initial_minutes: initialMinutes,
                    exceeded_minutes: exceededMinutes,
                    initial_value: Number(initialValue),
                    minute_value: Number(minuteValue),
                    total_amount: Number(totalAmount),
                },
            };
        }
        if (!aircraft.flight_hour_value) {
            throw new common_1.BadRequestException('Aeronave não possui valor de hora de voo configurado');
        }
        const flightHourValue = new client_runtime_utils_1.Decimal(aircraft.flight_hour_value);
        const totalAmount = flightHourValue.mul(totalHours);
        return {
            totalHours,
            totalAmount,
            breakdown: {
                aircraft_type: 'airplane',
                total_hours: Number(totalHours),
                flight_hour_value: Number(flightHourValue),
                total_amount: Number(totalAmount.toFixed(2)),
            },
        };
    }
    async registerFlight(dto) {
        const aircraft = await this.flightsRepository.findAircraft(dto.aircraft_id);
        if (!aircraft) {
            throw new common_1.NotFoundException(`Aeronave ${dto.aircraft_id} não encontrada`);
        }
        const startDate = new Date(dto.start_date);
        const endDate = dto.end_date ? new Date(dto.end_date) : undefined;
        let totalHours;
        let totalAmount;
        let calculationBreakdown;
        let instructorAmount;
        if (endDate) {
            const settings = await this.flightsRepository.findSettings();
            const result = this.calculateAmount(aircraft.type, startDate, endDate, aircraft, settings);
            totalHours = result.totalHours;
            totalAmount = result.totalAmount;
            calculationBreakdown = result.breakdown;
            const instructorPct = new client_runtime_utils_1.Decimal(settings?.instructor_percentage ?? 0);
            instructorAmount = totalAmount.mul(instructorPct).div(new client_runtime_utils_1.Decimal(100));
        }
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const [flightType, instructionType] = await Promise.all([
            this.receivableTypesService.findById(dto.receivable_type_id),
            dto.instructor_id && dto.payable_type_id
                ? this.payableTypesService.findById(dto.payable_type_id)
                : Promise.resolve(null),
        ]);
        return this.flightsRepository.registerFlight({
            aircraftId: dto.aircraft_id,
            peopleId: dto.people_id,
            instructorId: dto.instructor_id,
            type: dto.type,
            origin: dto.origin,
            destination: dto.destination,
            startDate,
            endDate,
            totalHours: totalHours?.toNumber(),
            totalAmount: totalAmount?.toNumber(),
            calculationBreakdown,
            buildReceivable: totalAmount
                ? (flightId) => ({
                    peopleId: dto.people_id,
                    title: dto.receivable_title ?? `Flight ${flightId}`,
                    description: dto.receivable_description,
                    expirationDate: dto.receivable_expiration_date
                        ? new Date(dto.receivable_expiration_date)
                        : expirationDate,
                    totalAmount: totalAmount.toNumber(),
                    receivable_type_id: flightType.id,
                    stakeholder: 'PEOPLE',
                })
                : undefined,
            buildPayable: dto.instructor_id && instructorAmount !== undefined && instructionType
                ? (flightId) => ({
                    instructorId: dto.instructor_id,
                    title: dto.payable_title ?? `Instruction ${flightId}`,
                    description: dto.payable_description,
                    amount: instructorAmount.toNumber(),
                    payable_type_id: instructionType.id,
                    dueDate: dto.payable_due_date
                        ? new Date(dto.payable_due_date)
                        : expirationDate,
                })
                : undefined,
        });
    }
    findAll(dto) {
        return this.flightsRepository.findAll(dto);
    }
    getStats(dto) {
        return this.flightsRepository.getStats(dto);
    }
    async findOne(id) {
        const flight = await this.flightsRepository.findById(id);
        if (!flight) {
            throw new common_1.NotFoundException(`Voo ${id} não encontrado`);
        }
        return flight;
    }
    async closeFlight(id, endDateIso) {
        const flight = await this.findOne(id);
        const endDate = new Date(endDateIso);
        const [aircraft, settings] = await Promise.all([
            this.flightsRepository.findAircraft(flight.aircraft_id),
            this.flightsRepository.findSettings(),
        ]);
        if (!aircraft) {
            throw new common_1.NotFoundException(`Aeronave ${flight.aircraft_id} não encontrada`);
        }
        const { totalHours, totalAmount, breakdown } = this.calculateAmount(aircraft.type, flight.start_date, endDate, aircraft, settings);
        const instructorPct = new client_runtime_utils_1.Decimal(settings?.instructor_percentage ?? 0);
        const instructorAmount = totalAmount
            .mul(instructorPct)
            .div(new client_runtime_utils_1.Decimal(100));
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        const hasReceivable = (flight.receivables?.length ?? 0) > 0;
        const existingReceivable = flight.receivables?.[0];
        return this.flightsRepository.closeFlight(id, {
            endDate,
            totalHours: totalHours.toNumber(),
            totalAmount: totalAmount.toNumber(),
            breakdown,
            buildReceivable: !hasReceivable && existingReceivable?.receivable_type_id
                ? () => ({
                    peopleId: flight.people_id,
                    title: `Flight ${id}`,
                    expirationDate,
                    totalAmount: totalAmount.toNumber(),
                    receivable_type_id: existingReceivable.receivable_type_id,
                    stakeholder: 'PEOPLE',
                })
                : undefined,
            buildPayable: undefined,
        });
    }
    async update(id, dto) {
        const flight = await this.findOne(id);
        const effectiveAircraftId = dto.aircraft_id ?? flight.aircraft_id;
        const effectiveStartDate = dto.start_date
            ? new Date(dto.start_date)
            : flight.start_date;
        const effectiveEndDate = dto.end_date
            ? new Date(dto.end_date)
            : (flight.end_date ?? null);
        const effectiveInstructorId = dto.instructor_id !== undefined
            ? dto.instructor_id
            : flight.instructor_id;
        const needsRecalc = !!(dto.start_date || dto.end_date || dto.aircraft_id) &&
            effectiveEndDate !== null;
        let newTotalHours;
        let newTotalAmount;
        let newCalculationBreakdown;
        let newInstructorPayableAmount;
        if (needsRecalc) {
            const [aircraft, settings] = await Promise.all([
                this.flightsRepository.findAircraft(effectiveAircraftId),
                this.flightsRepository.findSettings(),
            ]);
            if (!aircraft)
                throw new common_1.NotFoundException(`Aeronave ${effectiveAircraftId} não encontrada`);
            const result = this.calculateAmount(aircraft.type, effectiveStartDate, effectiveEndDate, aircraft, settings);
            newTotalHours = result.totalHours.toNumber();
            newTotalAmount = result.totalAmount.toNumber();
            newCalculationBreakdown = result.breakdown;
            if (effectiveInstructorId) {
                const instructorPct = new client_runtime_utils_1.Decimal(settings?.instructor_percentage ?? 0);
                newInstructorPayableAmount = result.totalAmount
                    .mul(instructorPct)
                    .div(new client_runtime_utils_1.Decimal(100))
                    .toNumber();
            }
        }
        return this.flightsRepository.updateFlightAndRelations(id, {
            type: dto.type,
            origin: dto.origin,
            destination: dto.destination,
            startDate: dto.start_date ? new Date(dto.start_date) : undefined,
            endDate: dto.end_date ? new Date(dto.end_date) : undefined,
            aircraftId: dto.aircraft_id,
            peopleId: dto.people_id,
            instructorId: dto.instructor_id,
            totalHours: newTotalHours,
            totalAmount: newTotalAmount,
            calculationBreakdown: newCalculationBreakdown,
            newInstructorPayableAmount: effectiveInstructorId
                ? newInstructorPayableAmount
                : undefined,
        });
    }
    async remove(id) {
        await this.findOne(id);
        if (await this.flightsRepository.hasReceivableWithPayments(id)) {
            throw new common_1.BadRequestException('Não é possível excluir um voo com pagamentos registrados no recebível vinculado');
        }
        return this.flightsRepository.delete(id);
    }
    bulkRemove(ids) {
        return this.flightsRepository.bulkDelete(ids);
    }
};
exports.FlightsService = FlightsService;
exports.FlightsService = FlightsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(flights_repository_interface_1.FLIGHTS_REPOSITORY)),
    __metadata("design:paramtypes", [Object, receivable_types_service_1.ReceivableTypesService,
        payable_types_service_1.PayableTypesService])
], FlightsService);
//# sourceMappingURL=flights.service.js.map