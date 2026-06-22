import { paginate } from '../../common/dto/pagination.dto';
import { FindAllFlightsDto } from '../dto/find-all-flights.dto';
import { Flight } from '../model/flight.model';

export type PaginatedFlights = ReturnType<typeof paginate<Flight>>;

export interface PlaneSummary {
  id: number;
  type: string;
  flight_hour_value: number | null;
}

export interface FlightSettings {
  instructor_percentage: number;
  glider_initial_minutes: number;
  glider_initial_value: number;
  glider_minute_value: number;
}

export interface ReceivableInput {
  peopleId: number;
  aircraftId: number;
  instructorId?: number;
  title: string;
  expirationDate: Date;
  totalAmount: number;
  receivable_type_id: number;
  stakeholder: string;
}

export interface PayableInput {
  instructorId: number;
  title: string;
  amount: number;
  payable_type_id: number;
  dueDate: Date;
}

export interface RegisterFlightData {
  aircraftId: number;
  peopleId: number;
  instructorId?: number;
  type: string;
  origin: string;
  destination: string;
  startDate: Date;
  endDate?: Date;
  totalHours?: number;
  totalAmount?: number;
  calculationBreakdown?: object;
  buildReceivable?: (flightId: number) => ReceivableInput;
  buildPayable?: (flightId: number) => PayableInput;
}

export interface CloseFlightData {
  endDate: Date;
  totalHours: number;
  totalAmount: number;
  breakdown: object;
  buildReceivable?: () => ReceivableInput;
  buildPayable?: () => PayableInput;
}

export interface UpdateFlightData {
  type?: string;
  origin?: string;
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  totalHours?: number;
  totalAmount?: number;
  calculationBreakdown?: object;
  aircraftId?: number;
  peopleId?: number;
  instructorId?: number | null;
  newInstructorPayableAmount?: number;
  instructionPayableTypeId?: number;
}

export interface IFlightsRepository {
  registerFlight(data: RegisterFlightData): Promise<Flight>;
  findAircraft(id: number): Promise<PlaneSummary | null>;
  findSettings(): Promise<FlightSettings | null>;
  findAll(dto: FindAllFlightsDto): Promise<PaginatedFlights>;
  findById(id: number): Promise<Flight | null>;
  updateFlightAndRelations(id: number, data: UpdateFlightData): Promise<Flight>;
  closeFlight(id: number, data: CloseFlightData): Promise<Flight>;
  hasReceivableWithPayments(flightId: number): Promise<boolean>;
  delete(id: number): Promise<Flight>;
}
