import { faker } from '@faker-js/faker';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CompaniesService } from './companies.service';
import {
  COMPANIES_REPOSITORY,
  ICompaniesRepository,
} from './repository/companies-repository.interface';
import { FakeCompaniesRepository } from './repository/fake-companies.repository';

describe('CompaniesService', () => {
  let companiesService: CompaniesService;
  let companiesRepository: ICompaniesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: COMPANIES_REPOSITORY,
          useClass: FakeCompaniesRepository,
        },
      ],
    }).compile();

    companiesService = module.get(CompaniesService);
    companiesRepository =
      module.get<ICompaniesRepository>(COMPANIES_REPOSITORY);
  });

  it('findOne returns company when found', async () => {
    const company = {
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };

    await companiesRepository.create(company);

    expect(await companiesService.findOne(1)).toMatchObject(company);
  });

  it('findOne throws NotFoundException when not found', async () => {
    await expect(companiesService.findOne(faker.number.int())).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create throws ConflictException when CNPJ is already in use', async () => {
    const cnpj = faker.string.numeric(14);

    await companiesRepository.create({
      name: faker.company.name(),
      cnpj,
      email: faker.internet.email(),
      phone: faker.phone.number(),
    });

    await expect(
      companiesService.create({
        name: faker.company.name(),
        cnpj,
        email: faker.internet.email(),
        phone: faker.phone.number(),
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('create throws ConflictException when e-mail is already in use', async () => {
    const email = faker.internet.email();

    await companiesRepository.create({
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      email,
      phone: faker.phone.number(),
    });

    await expect(
      companiesService.create({
        name: faker.company.name(),
        cnpj: faker.string.numeric(14),
        email,
        phone: faker.phone.number(),
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('update throws ConflictException when CNPJ belongs to another company', async () => {
    const cnpj = faker.string.numeric(14);

    await companiesRepository.create({
      name: faker.company.name(),
      cnpj,
      email: faker.internet.email(),
      phone: faker.phone.number(),
    });

    const target = await companiesRepository.create({
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    });

    await expect(companiesService.update(target.id, { cnpj })).rejects.toThrow(
      ConflictException,
    );
  });

  it('update throws ConflictException when e-mail belongs to another company', async () => {
    const email = faker.internet.email();

    await companiesRepository.create({
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      email,
      phone: faker.phone.number(),
    });

    const target = await companiesRepository.create({
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    });

    await expect(companiesService.update(target.id, { email })).rejects.toThrow(
      ConflictException,
    );
  });

  it('update allows keeping the same CNPJ and e-mail on the same company', async () => {
    const company = await companiesRepository.create({
      name: faker.company.name(),
      cnpj: faker.string.numeric(14),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    });

    await expect(
      companiesService.update(company.id, {
        name: faker.company.name(),
        cnpj: company.cnpj,
        email: company.email,
        phone: faker.phone.number(),
      }),
    ).resolves.not.toThrow();
  });

  it('delete throws NotFoundException when not found', async () => {
    await expect(companiesService.delete(faker.number.int())).rejects.toThrow(
      NotFoundException,
    );
  });
});
