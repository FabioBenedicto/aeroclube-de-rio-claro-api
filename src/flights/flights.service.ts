import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { FlightsRepository } from './flights.repository';
import { CreateFlightDto } from './dto/create-flight.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';

type Settings = {
  instructor_percentage: Decimal;
  glider_initial_minutes: number;
  glider_initial_value: Decimal;
  glider_minute_value: Decimal;
} | null;

type Plane = { flight_hour_value: Decimal | null };

@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepository: FlightsRepository) {}

  private calculateAmount(
    aircraftType: string,
    startDate: Date,
    endDate: Date,
    plane: Plane,
    settings: Settings,
  ): { totalHours: Decimal; totalAmount: Decimal; breakdown: object } {
    const diffMs = endDate.getTime() - startDate.getTime();
    const totalHours = new Decimal((diffMs / 3_600_000).toFixed(2));

    if (aircraftType === 'glider') {
      const totalMinutes = Math.round(diffMs / 60_000);
      const initialMinutes = settings?.glider_initial_minutes ?? 45;
      const initialValue = settings?.glider_initial_value ?? new Decimal(330);
      const minuteValue = settings?.glider_minute_value ?? new Decimal(3);
      const exceededMinutes = Math.max(0, totalMinutes - initialMinutes);

      const totalAmount = new Decimal(
        initialValue.plus(minuteValue.mul(new Decimal(exceededMinutes))).toFixed(2),
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

    if (!plane.flight_hour_value) {
      throw new BadRequestException('Plane has no flight hour value configured');
    }
    const totalAmount = plane.flight_hour_value.mul(totalHours);
    return {
      totalHours,
      totalAmount,
      breakdown: {
        aircraft_type: 'airplane',
        total_hours: Number(totalHours),
        flight_hour_value: Number(plane.flight_hour_value),
        total_amount: Number(totalAmount.toFixed(2)),
      },
    };
  }

  async registerFlight(dto: CreateFlightDto) {
    const plane = await this.flightsRepository.findPlane(dto.plane_id);

    if (!plane) {
      throw new NotFoundException(`Plane ${dto.plane_id} not found`);
    }

    if (dto.double_command && !dto.instructor_id) {
      throw new BadRequestException('This flight type requires an instructor');
    }

    const startDate = new Date(dto.start_date);
    const endDate = dto.end_date ? new Date(dto.end_date) : undefined;

    let totalHours: Decimal | undefined;
    let totalAmount: Decimal | undefined;
    let calculationBreakdown: object | undefined;
    let instructorAmount: Decimal | undefined;

    if (endDate) {
      const settings = await this.flightsRepository.findSettings();
      const result = this.calculateAmount(dto.aircraft_type, startDate, endDate, plane, settings);
      totalHours = result.totalHours;
      totalAmount = result.totalAmount;
      calculationBreakdown = result.breakdown;

      const instructorPct = settings?.instructor_percentage ?? new Decimal(0);
      instructorAmount = totalAmount.mul(instructorPct).div(new Decimal(100));
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    return this.flightsRepository.registerFlight({
      flightData: {
        aircraft_type: dto.aircraft_type,
        plane: { connect: { id: dto.plane_id } },
        customer: { connect: { id: dto.customer_id } },
        ...(dto.instructor_id && {
          instructor: { connect: { id: dto.instructor_id } },
        }),
        type: dto.type,
        double_command: dto.double_command,
        origin: dto.origin,
        destination: dto.destination,
        start_date: startDate,
        ...(endDate && { end_date: endDate }),
        ...(totalHours !== undefined && { total_hours: totalHours }),
        ...(totalAmount !== undefined && { total_amount: totalAmount }),
        ...(calculationBreakdown !== undefined && { calculation_breakdown: calculationBreakdown as any }),
      },
      buildReceivable: totalAmount
        ? (flightId) => ({
            customer: { connect: { id: dto.customer_id } },
            flight: { connect: { id: flightId } },
            plane: { connect: { id: dto.plane_id } },
            ...(dto.instructor_id && {
              instructor: { connect: { id: dto.instructor_id } },
            }),
            title: dto.receivable_title ?? `Flight ${flightId}`,
            expiration_date: dto.receivable_expiration_date
              ? new Date(dto.receivable_expiration_date)
              : expirationDate,
            total_amount: totalAmount,
            product: dto.receivable_product ?? 'voo',
            payer_type: 'customer' as const,
          })
        : undefined,
      buildPayable:
        dto.double_command && dto.instructor_id && instructorAmount !== undefined
          ? (flightId) => ({
              instructor: { connect: { id: dto.instructor_id! } },
              title: dto.payable_title ?? `Instruction ${flightId}`,
              amount: instructorAmount,
              product: 'instrucao',
              due_date: dto.payable_due_date
                ? new Date(dto.payable_due_date)
                : expirationDate,
            })
          : undefined,
    });
  }

  async findAll(planeId?: number, customerId?: number, type?: string, dateFrom?: string, dateTo?: string, page = 1, limit = 20, search?: string, instructorId?: number) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    const { data, total } = await this.flightsRepository.findAll(planeId, customerId, type, from, to, page, limit, search, instructorId);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const flight = await this.flightsRepository.findById(id);

    if (!flight) {
      throw new NotFoundException(`Flight ${id} not found`);
    }

    return flight;
  }

  async closeFlight(id: number, endDateIso: string) {
    const flight = await this.findOne(id);
    const endDate = new Date(endDateIso);

    const [plane, settings] = await Promise.all([
      this.flightsRepository.findPlane(flight.plane_id),
      this.flightsRepository.findSettings(),
    ]);

    const { totalHours, totalAmount, breakdown } = this.calculateAmount(
      flight.aircraft_type,
      flight.start_date,
      endDate,
      plane!,
      settings,
    );

    const instructorPct = settings?.instructor_percentage ?? new Decimal(0);
    const instructorAmount = totalAmount.mul(instructorPct).div(new Decimal(100));

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const hasReceivable = flight.receivables.length > 0;

    return this.flightsRepository.closeFlight(id, {
      flightData: {
        end_date: endDate,
        total_hours: totalHours,
        total_amount: totalAmount,
        calculation_breakdown: breakdown as any,
      },
      buildReceivable: !hasReceivable
        ? () => ({
            customer: { connect: { id: flight.customer_id } },
            flight: { connect: { id } },
            plane: { connect: { id: flight.plane_id } },
            ...(flight.instructor_id && {
              instructor: { connect: { id: flight.instructor_id } },
            }),
            title: `Flight ${id}`,
            expiration_date: expirationDate,
            total_amount: totalAmount,
            product: 'voo',
            payer_type: 'customer' as const,
          })
        : undefined,
      buildPayable:
        flight.double_command && flight.instructor_id && instructorAmount.greaterThan(0)
          ? () => ({
              instructor: { connect: { id: flight.instructor_id! } },
              title: `Instruction ${id}`,
              amount: instructorAmount,
              product: 'instrucao',
              due_date: expirationDate,
            })
          : undefined,
    });
  }

  async update(id: number, dto: UpdateFlightDto) {
    const flight = await this.findOne(id);

    const effectivePlaneId = dto.plane_id ?? flight.plane_id;
    const effectiveStartDate = dto.start_date ? new Date(dto.start_date) : flight.start_date;
    const effectiveEndDate = dto.end_date ? new Date(dto.end_date) : flight.end_date ?? null;
    const effectiveDoubleCommand = dto.double_command !== undefined ? dto.double_command : flight.double_command;
    const effectiveInstructorId = dto.instructor_id !== undefined ? dto.instructor_id : flight.instructor_id;
    const effectiveAircraftType = dto.aircraft_type ?? flight.aircraft_type;

    if (effectiveDoubleCommand && !effectiveInstructorId) {
      throw new BadRequestException('This flight type requires an instructor');
    }

    const needsRecalc =
      !!(dto.start_date || dto.end_date || dto.plane_id || dto.aircraft_type) &&
      effectiveEndDate !== null;

    let newTotalHours: Decimal | undefined;
    let newTotalAmount: Decimal | undefined;
    let newCalculationBreakdown: object | undefined;
    let instructorPct = new Decimal(0);

    if (needsRecalc) {
      const [plane, settings] = await Promise.all([
        this.flightsRepository.findPlane(effectivePlaneId),
        this.flightsRepository.findSettings(),
      ]);
      if (!plane) throw new NotFoundException(`Plane ${effectivePlaneId} not found`);
      const result = this.calculateAmount(effectiveAircraftType, effectiveStartDate, effectiveEndDate!, plane, settings);
      newTotalHours = result.totalHours;
      newTotalAmount = result.totalAmount;
      newCalculationBreakdown = result.breakdown;
      instructorPct = settings?.instructor_percentage ?? new Decimal(0);
    }

    const { instructor_id, plane_id, customer_id, start_date, end_date, ...rest } = dto;

    return this.flightsRepository.updateFlightAndRelations(id, {
      flightData: {
        ...rest,
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(newTotalHours !== undefined && { total_hours: newTotalHours }),
        ...(newTotalAmount !== undefined && { total_amount: newTotalAmount }),
        ...(newCalculationBreakdown !== undefined && { calculation_breakdown: newCalculationBreakdown as any }),
        ...(plane_id !== undefined && { plane: { connect: { id: plane_id } } }),
        ...(customer_id !== undefined && { customer: { connect: { id: customer_id } } }),
        ...(instructor_id !== undefined && {
          instructor: instructor_id ? { connect: { id: instructor_id } } : { disconnect: true },
        }),
      },
      newTotalAmount,
      instructorPct: newTotalAmount ? instructorPct : undefined,
      instructorId: effectiveDoubleCommand ? effectiveInstructorId : undefined,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    if (await this.flightsRepository.hasReceivableWithPayments(id)) {
      throw new BadRequestException('Cannot delete a flight that has payments recorded on the linked receivable');
    }
    return this.flightsRepository.delete(id);
  }
}
