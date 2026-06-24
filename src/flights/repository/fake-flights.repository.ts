import { UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { FindAllFlightsDto } from '../dto/find-all-flights.dto';
import { Flight } from '../model/flight.model';
import {
  CloseFlightData,
  FlightSettings,
  FlightStats,
  IFlightsRepository,
  PayableInput,
  PlaneSummary,
  ReceivableInput,
  RegisterFlightData,
  UpdateFlightData,
} from './flights-repository.interface';

export class FakeFlightsRepository implements IFlightsRepository {
  readonly flights: any[] = [];
  readonly receivables: Array<ReceivableInput & { flightId: number }> = [];
  readonly payables: Array<PayableInput & { flightId: number }> = [];

  aircraft: PlaneSummary | null = null;
  settings: FlightSettings | null = null;

  private nextId = 1;

  async registerFlight(data: RegisterFlightData): Promise<Flight> {
    const id = this.nextId++;
    const flight = {
      id,
      aircraft_id: data.aircraftId,
      people_id: data.peopleId,
      instructor_id: data.instructorId ?? null,
      type: data.type,
      origin: data.origin,
      destination: data.destination,
      start_date: data.startDate,
      end_date: data.endDate ?? null,
      total_hours: data.totalHours ?? null,
      total_amount: data.totalAmount ?? null,
      calculation_breakdown: data.calculationBreakdown ?? null,
    };
    this.flights.push(flight);

    if (data.buildReceivable) {
      this.receivables.push({ ...data.buildReceivable(id), flightId: id });
    }
    if (data.buildPayable) {
      this.payables.push({ ...data.buildPayable(id), flightId: id });
    }

    return plainToInstance(Flight, flight);
  }

  async findAircraft(_id: number): Promise<PlaneSummary | null> {
    return this.aircraft;
  }

  async findSettings(): Promise<FlightSettings | null> {
    return this.settings;
  }

  async findAll({
    page = 1,
    limit = 20,
    aircraft_id,
    people_id,
    instructor_id,
    type,
    search,
    date_from,
    date_to,
  }: FindAllFlightsDto) {
    let data = [...this.flights];
    if (aircraft_id) data = data.filter((f) => f.aircraft_id === aircraft_id);
    if (people_id) data = data.filter((f) => f.people_id === people_id);
    if (instructor_id)
      data = data.filter((f) => f.instructor_id === instructor_id);
    if (type)
      data = data.filter((f) =>
        f.type.toLowerCase().includes(type.toLowerCase()),
      );
    if (search)
      data = data.filter((f) =>
        f.type.toLowerCase().includes(search.toLowerCase()),
      );
    if (date_from) data = data.filter((f) => f.start_date >= date_from);
    if (date_to) data = data.filter((f) => f.start_date <= date_to);
    const total = data.length;
    return { data: data.slice((page - 1) * limit, page * limit).map((f) => plainToInstance(Flight, f)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStats(dto: FindAllFlightsDto): Promise<FlightStats> {
    const { total, data } = await this.findAll(dto);
    const total_hours = data.reduce((s, f) => s + Number(f.total_hours ?? 0), 0);
    const total_revenue = data.reduce((s, f) => s + Number(f.total_amount ?? 0), 0);
    return {
      total,
      total_hours: total_hours > 0 ? total_hours : null,
      total_revenue: total_revenue > 0 ? total_revenue : null,
    };
  }

  async findById(id: number): Promise<Flight | null> {
    const f = this.flights.find((f) => f.id === id);
    return f ? plainToInstance(Flight, f) : null;
  }

  async updateFlightAndRelations(
    id: number,
    data: UpdateFlightData,
  ): Promise<Flight> {
    const idx = this.flights.findIndex((f) => f.id === id);
    this.flights[idx] = { ...this.flights[idx], ...data };

    if (data.peopleId !== undefined) {
      for (const r of this.receivables.filter((r) => r.flightId === id)) {
        r.peopleId = data.peopleId;
      }
    }
    if (data.instructorId !== undefined && data.instructorId !== null) {
      for (const p of this.payables.filter((p) => p.flightId === id)) {
        p.instructorId = data.instructorId as number;
      }
    }

    return plainToInstance(Flight, this.flights[idx]);
  }

  async closeFlight(id: number, data: CloseFlightData): Promise<Flight> {
    const idx = this.flights.findIndex((f) => f.id === id);
    this.flights[idx] = {
      ...this.flights[idx],
      end_date: data.endDate,
      total_hours: data.totalHours,
      total_amount: data.totalAmount,
      calculation_breakdown: data.breakdown,
    };
    if (data.buildReceivable) {
      this.receivables.push({ ...data.buildReceivable(), flightId: id });
    }
    if (data.buildPayable) {
      this.payables.push({ ...data.buildPayable(), flightId: id });
    }
    return plainToInstance(Flight, this.flights[idx]);
  }

  async hasReceivableWithPayments(_flightId: number): Promise<boolean> {
    return false;
  }

  async delete(id: number): Promise<Flight> {
    const idx = this.flights.findIndex((f) => f.id === id);
    const [removed] = this.flights.splice(idx, 1);
    return plainToInstance(Flight, removed);
  }

  async bulkDelete(ids: number[]): Promise<void> {
    const found = this.flights.filter((f) => ids.includes(f.id));
    if (found.length !== ids.length)
      throw new UnprocessableEntityException('Um ou mais voos não foram encontrados');
    this.flights.splice(0, this.flights.length, ...this.flights.filter((f) => !ids.includes(f.id)));
  }
}
