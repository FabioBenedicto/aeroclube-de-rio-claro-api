import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { FlightsRepository } from './flights.repository';
import { CreateFlightDto } from './dto/create-flight.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepository: FlightsRepository) {}

  async registerFlight(dto: CreateFlightDto) {
    const plane = await this.flightsRepository.findPlane(dto.plane_id);

    if (!plane) {
      throw new NotFoundException(`Aeronave ${dto.plane_id} não encontrada`);
    }

    if (dto.double_command && !dto.instructor_id) {
      throw new BadRequestException('Este tipo de voo requer instrutor');
    }

    const startDate = new Date(dto.start_date);
    const endDate = dto.end_date ? new Date(dto.end_date) : undefined;

    let totalHours: Decimal | undefined;
    let totalAmount: Decimal | undefined;

    if (endDate) {
      const diffHours = (endDate.getTime() - startDate.getTime()) / 3_600_000;
      totalHours = new Decimal(diffHours.toFixed(2));
      totalAmount = plane.flight_hour_value.mul(totalHours);
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const settings = await this.flightsRepository.findSettings();
    const instructorPct = settings?.instructor_percentage ?? new Decimal(0);
    const instructorAmount = totalAmount
      ? totalAmount.mul(instructorPct).div(new Decimal(100))
      : undefined;

    return this.flightsRepository.registerFlight({
      flightData: {
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
      },
      buildReceivable: totalAmount
        ? (flightId) => ({
            customer: { connect: { id: dto.customer_id } },
            flight: { connect: { id: flightId } },
            plane: { connect: { id: dto.plane_id } },
            ...(dto.instructor_id && {
              instructor: { connect: { id: dto.instructor_id } },
            }),
            title: `Voo ${dto.type.toUpperCase()} #${flightId}`,
            description: `${dto.origin} → ${dto.destination}`,
            expiration_date: expirationDate,
            total_amount: totalAmount,
            product: 'voo',
            payer_type: 'customer' as const,
          })
        : undefined,
      buildPayable:
        dto.double_command && dto.instructor_id && instructorAmount?.greaterThan(0)
          ? (flightId) => ({
              instructor: { connect: { id: dto.instructor_id! } },
              title: `Instrução voo #${flightId}`,
              description: `${dto.origin} → ${dto.destination}`,
              amount: instructorAmount,
              product: 'instrucao',
              due_date: expirationDate,
            })
          : undefined,
    });
  }

  async findAll(planeId?: number, customerId?: number, type?: string, dateFrom?: string, dateTo?: string, page = 1, limit = 20, search?: string) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;
    const { data, total } = await this.flightsRepository.findAll(planeId, customerId, type, from, to, page, limit, search);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
    const diffHours = (endDate.getTime() - flight.start_date.getTime()) / 3_600_000;
    const totalHours = new Decimal(diffHours.toFixed(2));

    const plane = await this.flightsRepository.findPlane(flight.plane_id);
    const totalAmount = plane!.flight_hour_value.mul(totalHours);

    const settings = await this.flightsRepository.findSettings();
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
      },
      buildReceivable: !hasReceivable
        ? () => ({
            customer: { connect: { id: flight.customer_id } },
            flight: { connect: { id } },
            plane: { connect: { id: flight.plane_id } },
            ...(flight.instructor_id && {
              instructor: { connect: { id: flight.instructor_id } },
            }),
            title: `Voo ${flight.type.toUpperCase()} #${id}`,
            description: `${flight.origin} → ${flight.destination}`,
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
              title: `Instrução voo #${id}`,
              description: `${flight.origin} → ${flight.destination}`,
              amount: instructorAmount,
              product: 'instrucao',
              due_date: expirationDate,
            })
          : undefined,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    if (await this.flightsRepository.hasReceivableWithPayments(id)) {
      throw new BadRequestException('Não é possível excluir um voo com pagamentos registrados no título vinculado');
    }
    return this.flightsRepository.delete(id);
  }
}
