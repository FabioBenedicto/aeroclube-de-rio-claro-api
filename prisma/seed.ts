import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@aeroclube.com' },
    update: {},
    create: {
      name: 'Laura Administradora',
      email: 'admin@aeroclube.com',
      password,
      role: 'ADMIN',
    },
  });
  await prisma.user.upsert({
    where: { email: 'func@aeroclube.com' },
    update: {},
    create: {
      name: 'Tiago Funcionário',
      email: 'func@aeroclube.com',
      password,
      role: 'EMPLOYEE',
    },
  });

  // Planes
  await prisma.plane.createMany({
    skipDuplicates: true,
    data: [
      {
        registration: 'PR-AEC',
        model: 'Cessna 152',
        flight_hour_value: 680.0,
      },
      {
        registration: 'PT-RCL',
        model: 'Cessna 172N',
        flight_hour_value: 890.0,
      },
      {
        registration: 'PP-ARC',
        model: 'Piper PA-28',
        flight_hour_value: 950.0,
      },
      {
        registration: 'PT-AEE',
        model: 'Tecnam P2002',
        flight_hour_value: 760.0,
      },
    ],
  });

  // Customers
  const customersData = [
    {
      cpf: '412.908.557-03',
      name: 'Helena Marques',
      email: 'helena.m@aeroclube.rc.br',
      phone_number: '(19) 98112-4430',
      flight_hour_balance: 480,
    },
    {
      cpf: '128.775.341-22',
      name: 'Rafael Ozório',
      email: 'rafael.oz@aeroclube.rc.br',
      phone_number: '(19) 99408-1201',
      flight_hour_balance: 0,
    },
    {
      cpf: '005.661.902-87',
      name: 'Beatriz Tanaka',
      email: 'b.tanaka@ymail.com',
      phone_number: '(19) 98877-2109',
      flight_hour_balance: 120,
    },
    {
      cpf: '788.421.093-44',
      name: 'Diego Fontana',
      email: 'diego.f@aeroclube.rc.br',
      phone_number: '(19) 99120-8814',
      flight_hour_balance: 0,
    },
    {
      cpf: '902.113.882-51',
      name: 'Clara Nogueira',
      email: 'c.nogueira@gmail.com',
      phone_number: '(19) 98655-3344',
      flight_hour_balance: 0,
    },
    {
      cpf: '331.097.668-09',
      name: 'André Kobayashi',
      email: 'andre.k@outlook.com',
      phone_number: '(19) 98330-9985',
      flight_hour_balance: 60,
    },
    {
      cpf: '217.884.330-12',
      name: 'Marina Prado',
      email: 'marina.prado@gmail.com',
      phone_number: '(19) 99701-2234',
      flight_hour_balance: 220,
    },
    {
      cpf: '553.219.667-55',
      name: 'Juliana Ribeiro',
      email: 'j.ribeiro@aeroclube.rc.br',
      phone_number: '(19) 99887-0011',
      flight_hour_balance: 0,
    },
  ];
  for (const c of customersData) {
    await prisma.customer.upsert({
      where: { cpf: c.cpf },
      update: {},
      create: c,
    });
  }

  const customers = await prisma.customer.findMany({ orderBy: { id: 'asc' } });
  const byName = (name: string) => customers.find((c) => c.name === name)!;

  // Instructors (Rafael, Diego, Juliana)
  for (const name of ['Rafael Ozório', 'Diego Fontana', 'Juliana Ribeiro']) {
    const c = byName(name);
    const exists = await prisma.instructor.findFirst({ where: { customer_id: c.id } });
    if (!exists) await prisma.instructor.create({ data: { customer_id: c.id } });
  }

  // Students (Helena, Beatriz, André, Marina)
  for (const name of [
    'Helena Marques',
    'Beatriz Tanaka',
    'André Kobayashi',
    'Marina Prado',
  ]) {
    const c = byName(name);
    const exists = await prisma.student.findFirst({
      where: { customer_id: c.id },
    });
    if (!exists) await prisma.student.create({ data: { customer_id: c.id } });
  }

  // Partners (Rafael, Beatriz, Clara, Juliana)
  for (const name of [
    'Rafael Ozório',
    'Beatriz Tanaka',
    'Clara Nogueira',
    'Juliana Ribeiro',
  ]) {
    const c = byName(name);
    const exists = await prisma.partner.findFirst({
      where: { customer_id: c.id },
    });
    if (!exists)
      await prisma.partner.create({
        data: { customer_id: c.id, monthly_dues: 320.0, status: 'active' },
      });
  }

  console.log('Seed concluído — admin@aeroclube.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect().finally(() => pool.end()));
