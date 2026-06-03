import { Injectable, NotFoundException } from '@nestjs/common';
import { CreditsRepository } from './credits.repository';
import { AddCreditDto } from './dto/add-credit.dto';

@Injectable()
export class CreditsService {
  constructor(private readonly repo: CreditsRepository) {}

  async getPersonCredits(personId: number) {
    const person = await this.repo.findPerson(personId);
    if (!person) throw new NotFoundException(`Person ${personId} not found`);
    const movements = await this.repo.getMovements(personId);
    return {
      person_id:           personId,
      flight_hour_balance: person.flight_hour_balance,
      movements,
    };
  }

  async addCredit(personId: number, dto: AddCreditDto) {
    const person = await this.repo.findPerson(personId);
    if (!person) throw new NotFoundException(`Person ${personId} not found`);
    const updated = await this.repo.addCredit(personId, dto.amount);
    return { person_id: personId, flight_hour_balance: updated.flight_hour_balance, added: dto.amount };
  }
}
