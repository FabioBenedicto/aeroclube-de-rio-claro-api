import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from '@prisma/client-runtime-utils';
import { PrismaService } from '../prisma/prisma.service';
import { FlightsRepository } from './flights.repository';
import { CreateFlightDto } from './dto/create-flight.dto';

@Injectable()
export class FlightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly flightsRepository: FlightsRepository,
  ) {}

  async registerFlight(dto: CreateFlightDto) {
    const plane = await this.prisma.plane.findUnique({ where: { id: dto.plane_id } });
    if (!plane) throw new NotFoundException(`Aeronave ${dto.plane_id} não encontrada`);
    if (plane.status !== 'active') throw new BadRequestException('Aeronave não está ativa');
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

    return this.prisma.$transaction(async (tx) => {
      const flight = await this.flightsRepository.createFlight(
        {
          plane: { connect: { id: dto.plane_id } },
          customer: { connect: { id: dto.customer_id } },
          ...(dto.instructor_id && { instructor: { connect: { id: dto.instructor_id } } }),
          type: dto.type,
          double_command: dto.double_command,
          origin: dto.origin,
          destination: dto.destination,
          start_date: startDate,
          ...(endDate && { end_date: endDate }),
          ...(totalHours !== undefined && { total_hours: totalHours }),
          ...(totalAmount !== undefined && { total_amount: totalAmount }),
        },
        tx,
      );

      if (totalAmount) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        await this.flightsRepository.createReceivable(
          {
            customer: { connect: { id: dto.customer_id } },
            flight: { connect: { id: flight.id } },
            title: `Voo ${dto.type.toUpperCase()} #${flight.id}`,
            description: `${dto.origin} → ${dto.destination}`,
            expiration_date: expirationDate,
            total_amount: totalAmount,
            product: 'hora_voo',
          },
          tx,
        );

        if (dto.double_command && dto.instructor_id) {
          const payable = await this.flightsRepository.createPayable(
            {
              instructor: { connect: { id: dto.instructor_id } },
              title: `Instrução voo #${flight.id}`,
              description: `Duplo comando — ${dto.origin} → ${dto.destination}`,
              total_amount: totalAmount,
              installments_count: 1,
              product: 'instrucao',
              expiration_date: expirationDate,
            },
            tx,
          );

          await this.flightsRepository.createPayableInstallment(
            {
              payable: { connect: { id: payable.id } },
              installment_number: 1,
              amount: totalAmount,
              expiration_date: expirationDate,
            },
            tx,
          );
        }
      }

      return flight;
    });
  }
}
