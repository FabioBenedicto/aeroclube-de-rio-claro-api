import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';

import { PayableTypesService } from '../payable-types/payable-types.service';
import { ReceivableTypesService } from '../receivable-types/receivable-types.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FindAllFlightsDto } from './dto/find-all-flights.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightsRepository } from './repository/flights.repository';
import {
  FlightSettings,
  IFlightsRepository,
  PlaneSummary,
} from './repository/flights-repository.interface';

@Injectable()
export class FlightsService {
  constructor(
    @Inject(FlightsRepository)
    private readonly flightsRepository: IFlightsRepository,
    private readonly receivableTypesService: ReceivableTypesService,
    private readonly payableTypesService: PayableTypesService,
  ) {}

  private calculateAmount(
    aircraftType: string,
    startDate: Date,
    endDate: Date,
    aircraft: PlaneSummary,
    settings: FlightSettings | null,
  ): { totalHours: Decimal; totalAmount: Decimal; breakdown: object } {
    const diffMs = endDate.getTime() - startDate.getTime();
    const totalHours = new Decimal((diffMs / 3_600_000).toFixed(2));

    if (aircraftType === 'glider') {
      const totalMinutes = Math.round(diffMs / 60_000);
      const initialMinutes = settings?.glider_initial_minutes ?? 45;
      const initialValue = new Decimal(settings?.glider_initial_value ?? 330);
      const minuteValue = new Decimal(settings?.glider_minute_value ?? 3);
      const exceededMinutes = Math.max(0, totalMinutes - initialMinutes);
      const totalAmount = new Decimal(
        initialValue.plus(minuteValue.mul(exceededMinutes)).toFixed(2),
      );

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
      throw new BadRequestException(
        'Aeronave não possui valor de hora de voo configurado',
      );
    }
    const flightHourValue = new Decimal(aircraft.flight_hour_value);
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

  async registerFlight(dto: CreateFlightDto) {
    const aircraft = await this.flightsRepository.findAircraft(dto.aircraft_id);

    if (!aircraft) {
      throw new NotFoundException(`Aeronave ${dto.aircraft_id} não encontrada`);
    }

    const startDate = new Date(dto.start_date);
    const endDate = dto.end_date ? new Date(dto.end_date) : undefined;

    let totalHours: Decimal | undefined;
    let totalAmount: Decimal | undefined;
    let calculationBreakdown: object | undefined;
    let instructorAmount: Decimal | undefined;

    if (endDate) {
      const settings = await this.flightsRepository.findSettings();
      const result = this.calculateAmount(
        aircraft.type,
        startDate,
        endDate,
        aircraft,
        settings,
      );
      totalHours = result.totalHours;
      totalAmount = result.totalAmount;
      calculationBreakdown = result.breakdown;

      const instructorPct = new Decimal(settings?.instructor_percentage ?? 0);
      instructorAmount = totalAmount.mul(instructorPct).div(new Decimal(100));
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const [flightType, instructionType] = await Promise.all([
      this.receivableTypesService.findByName('FLIGHT'),
      this.payableTypesService.findByName('INSTRUCTION'),
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
            aircraftId: dto.aircraft_id,
            instructorId: dto.instructor_id,
            title: dto.receivable_title ?? `Flight ${flightId}`,
            expirationDate: dto.receivable_expiration_date
              ? new Date(dto.receivable_expiration_date)
              : expirationDate,
            totalAmount: totalAmount.toNumber(),
            receivable_type_id: flightType.id,
            stakeholder: 'PEOPLE',
          })
        : undefined,
      buildPayable:
        dto.instructor_id && instructorAmount !== undefined
          ? (flightId) => ({
              instructorId: dto.instructor_id!,
              title: dto.payable_title ?? `Instruction ${flightId}`,
              amount: instructorAmount.toNumber(),
              payable_type_id: instructionType.id,
              dueDate: dto.payable_due_date
                ? new Date(dto.payable_due_date)
                : expirationDate,
            })
          : undefined,
    });
  }

  findAll(dto: FindAllFlightsDto) {
    return this.flightsRepository.findAll(dto);
  }

  async findOne(id: number) {
    const flight = await this.flightsRepository.findById(id);

    if (!flight) {
      throw new NotFoundException(`Voo ${id} não encontrado`);
    }

    return flight;
  }

  async closeFlight(id: number, endDateIso: string) {
    const flight = await this.findOne(id);
    const endDate = new Date(endDateIso);

    const [aircraft, settings] = await Promise.all([
      this.flightsRepository.findAircraft(flight.aircraft_id),
      this.flightsRepository.findSettings(),
    ]);

    if (!aircraft) {
      throw new NotFoundException(
        `Aeronave ${flight.aircraft_id} não encontrada`,
      );
    }

    const { totalHours, totalAmount, breakdown } = this.calculateAmount(
      aircraft.type,
      flight.start_date,
      endDate,
      aircraft,
      settings,
    );

    const instructorPct = new Decimal(settings?.instructor_percentage ?? 0);
    const instructorAmount = totalAmount
      .mul(instructorPct)
      .div(new Decimal(100));

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const hasReceivable = (flight.receivables?.length ?? 0) > 0;

    const [flightType, instructionType] = await Promise.all([
      this.receivableTypesService.findByName('FLIGHT'),
      this.payableTypesService.findByName('INSTRUCTION'),
    ]);

    return this.flightsRepository.closeFlight(id, {
      endDate,
      totalHours: totalHours.toNumber(),
      totalAmount: totalAmount.toNumber(),
      breakdown,
      buildReceivable: !hasReceivable
        ? () => ({
            peopleId: flight.people_id,
            aircraftId: flight.aircraft_id,
            instructorId: flight.instructor_id ?? undefined,
            title: `Flight ${id}`,
            expirationDate,
            totalAmount: totalAmount.toNumber(),
            receivable_type_id: flightType.id,
            stakeholder: 'PEOPLE',
          })
        : undefined,
      buildPayable:
        flight.instructor_id && instructorAmount.greaterThan(0)
          ? () => ({
              instructorId: flight.instructor_id!,
              title: `Instruction ${id}`,
              amount: instructorAmount.toNumber(),
              payable_type_id: instructionType.id,
              dueDate: expirationDate,
            })
          : undefined,
    });
  }

  async update(id: number, dto: UpdateFlightDto) {
    const flight = await this.findOne(id);

    const effectiveAircraftId = dto.aircraft_id ?? flight.aircraft_id;
    const effectiveStartDate = dto.start_date
      ? new Date(dto.start_date)
      : flight.start_date;
    const effectiveEndDate = dto.end_date
      ? new Date(dto.end_date)
      : (flight.end_date ?? null);
    const effectiveInstructorId =
      dto.instructor_id !== undefined
        ? dto.instructor_id
        : flight.instructor_id;

    const needsRecalc =
      !!(dto.start_date || dto.end_date || dto.aircraft_id) &&
      effectiveEndDate !== null;

    let newTotalHours: number | undefined;
    let newTotalAmount: number | undefined;
    let newCalculationBreakdown: object | undefined;
    let newInstructorPayableAmount: number | undefined;

    if (needsRecalc) {
      const [aircraft, settings] = await Promise.all([
        this.flightsRepository.findAircraft(effectiveAircraftId),
        this.flightsRepository.findSettings(),
      ]);
      if (!aircraft)
        throw new NotFoundException(
          `Aeronave ${effectiveAircraftId} não encontrada`,
        );
      const result = this.calculateAmount(
        aircraft.type,
        effectiveStartDate,
        effectiveEndDate,
        aircraft,
        settings,
      );
      newTotalHours = result.totalHours.toNumber();
      newTotalAmount = result.totalAmount.toNumber();
      newCalculationBreakdown = result.breakdown;

      if (effectiveInstructorId) {
        const instructorPct = new Decimal(settings?.instructor_percentage ?? 0);
        newInstructorPayableAmount = result.totalAmount
          .mul(instructorPct)
          .div(new Decimal(100))
          .toNumber();
      }
    }

    let instructionPayableTypeId: number | undefined;
    if (effectiveInstructorId && newInstructorPayableAmount !== undefined) {
      const instructionType = await this.payableTypesService.findByName('INSTRUCTION');
      instructionPayableTypeId = instructionType.id;
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
      instructionPayableTypeId,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    if (await this.flightsRepository.hasReceivableWithPayments(id)) {
      throw new BadRequestException(
        'Não é possível excluir um voo com pagamentos registrados no recebível vinculado',
      );
    }
    return this.flightsRepository.delete(id);
  }
}
