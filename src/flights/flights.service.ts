import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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

    if (plane.status !== 'active') {
      throw new BadRequestException('Aeronave não está ativa');
    }

    if (dto.double_command && !dto.instructor_id) {
      throw new BadRequestException('Duplo comando requer instructor_id');
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
            title: `Voo ${dto.type.toUpperCase()} #${flightId}`,
            description: `${dto.origin} → ${dto.destination}`,
            expiration_date: expirationDate,
            total_amount: totalAmount,
            product: 'hora_voo',
          })
        : undefined,
      buildPayable:
        dto.double_command && dto.instructor_id && totalAmount
          ? (flightId) => ({
              instructor: { connect: { id: dto.instructor_id! } },
              title: `Instrução voo #${flightId}`,
              description: `Duplo comando — ${dto.origin} → ${dto.destination}`,
              amount: totalAmount,
              product: 'instrucao',
              due_date: expirationDate,
            })
          : undefined,
    });
  }

  findAll(status?: string) {
    return this.flightsRepository.findAll(status);
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

    if (flight.status !== 'in-flight') {
      throw new BadRequestException('Voo já está encerrado ou cancelado');
    }

    const endDate = new Date(endDateIso);
    const diffHours =
      (endDate.getTime() - flight.start_date.getTime()) / 3_600_000;
    const totalHours = new Decimal(diffHours.toFixed(2));

    const plane = await this.flightsRepository.findPlane(flight.plane_id);
    const totalAmount = plane!.flight_hour_value.mul(totalHours);

    return this.flightsRepository.updateFlight(id, {
      end_date: endDate,
      total_hours: totalHours,
      total_amount: totalAmount,
      status: 'closed',
    });
  }

  async cancelFlight(id: number) {
    const flight = await this.findOne(id);

    if (flight.status === 'cancelled') {
      throw new BadRequestException('Voo já está cancelado');
    }

    return this.flightsRepository.updateFlight(id, { status: 'cancelled' });
  }

  async remove(id: number) {
    const flight = await this.findOne(id);
    if (flight.status === 'closed') {
      throw new BadRequestException('Não é possível remover um voo encerrado');
    }
    return this.flightsRepository.delete(id);
  }
}
