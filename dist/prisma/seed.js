"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");
const pg_1 = require("pg");
const client_1 = require("../src/generated/prisma/client");
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@aeroclube.com' },
        update: {},
        create: {
            name: 'Laura Administradora',
            email: 'admin@aeroclube.com',
            password,
            role: client_1.Role.ADMIN,
        },
    });
    await prisma.user.upsert({
        where: { email: 'func@aeroclube.com' },
        update: {},
        create: {
            name: 'Tiago Funcionário',
            email: 'func@aeroclube.com',
            password,
            role: client_1.Role.USER,
        },
    });
    const PERMISSION_CATALOG = [
        {
            key: 'receivables:view',
            module: 'receivables',
            module_label: 'Títulos a receber',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'receivables:create',
            module: 'receivables',
            module_label: 'Títulos a receber',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'receivables:update',
            module: 'receivables',
            module_label: 'Títulos a receber',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'receivables:delete',
            module: 'receivables',
            module_label: 'Títulos a receber',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'payables:view',
            module: 'payables',
            module_label: 'Títulos a pagar',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'payables:create',
            module: 'payables',
            module_label: 'Títulos a pagar',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'payables:update',
            module: 'payables',
            module_label: 'Títulos a pagar',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'payables:delete',
            module: 'payables',
            module_label: 'Títulos a pagar',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'bills:view',
            module: 'bills',
            module_label: 'Faturas',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'bills:create',
            module: 'bills',
            module_label: 'Faturas',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'bills:update',
            module: 'bills',
            module_label: 'Faturas',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'bills:delete',
            module: 'bills',
            module_label: 'Faturas',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'flights:view',
            module: 'flights',
            module_label: 'Voos',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'flights:create',
            module: 'flights',
            module_label: 'Voos',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'flights:update',
            module: 'flights',
            module_label: 'Voos',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'flights:delete',
            module: 'flights',
            module_label: 'Voos',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'aircraft:view',
            module: 'aircraft',
            module_label: 'Aeronaves',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'aircraft:create',
            module: 'aircraft',
            module_label: 'Aeronaves',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'aircraft:update',
            module: 'aircraft',
            module_label: 'Aeronaves',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'aircraft:delete',
            module: 'aircraft',
            module_label: 'Aeronaves',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'customers:view',
            module: 'customers',
            module_label: 'Pessoas',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'customers:create',
            module: 'customers',
            module_label: 'Pessoas',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'customers:update',
            module: 'customers',
            module_label: 'Pessoas',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'customers:delete',
            module: 'customers',
            module_label: 'Pessoas',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'companies:view',
            module: 'companies',
            module_label: 'Empresas',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'companies:create',
            module: 'companies',
            module_label: 'Empresas',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'companies:update',
            module: 'companies',
            module_label: 'Empresas',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'companies:delete',
            module: 'companies',
            module_label: 'Empresas',
            action: 'delete',
            action_label: 'Excluir',
        },
        {
            key: 'reports:view',
            module: 'reports',
            module_label: 'Relatórios',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'title-types:view',
            module: 'title-types',
            module_label: 'Tipos de Título',
            action: 'view',
            action_label: 'Visualizar',
        },
        {
            key: 'title-types:create',
            module: 'title-types',
            module_label: 'Tipos de Título',
            action: 'create',
            action_label: 'Criar',
        },
        {
            key: 'title-types:update',
            module: 'title-types',
            module_label: 'Tipos de Título',
            action: 'update',
            action_label: 'Editar',
        },
        {
            key: 'title-types:delete',
            module: 'title-types',
            module_label: 'Tipos de Título',
            action: 'delete',
            action_label: 'Excluir',
        },
    ];
    for (const p of PERMISSION_CATALOG) {
        await prisma.permission.upsert({
            where: { key: p.key },
            update: {},
            create: p,
        });
    }
    for (const name of ['FLIGHT', 'MENSALIDADE', 'OUTROS']) {
        await prisma.receivableType.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    for (const name of ['INSTRUCTION', 'OUTROS']) {
        await prisma.payableType.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    await prisma.aircraft.createMany({
        skipDuplicates: true,
        data: [
            {
                registration: 'PP-NVA',
                model: 'Neiva 56-C-1',
                type: 'AIRPLANE',
                flight_hour_value: null,
            },
            {
                registration: 'PP-PAC',
                model: 'Piper Aircraft J3C-65',
                type: 'AIRPLANE',
                flight_hour_value: null,
            },
            {
                registration: 'PT-RCL',
                model: 'Cessna Aircraft 172D',
                type: 'AIRPLANE',
                flight_hour_value: null,
            },
            {
                registration: 'PR-AEC',
                model: 'Cessna Aircraft 152',
                type: 'AIRPLANE',
                flight_hour_value: null,
            },
            {
                registration: 'PP-ABR',
                model: 'Aero Boero AB-180',
                type: 'AIRPLANE',
                flight_hour_value: null,
            },
            {
                registration: 'PP-ZPC',
                model: 'PZL-Bielsko SZD-50-3 Puchacz',
                type: 'GLIDER',
                flight_hour_value: null,
            },
            {
                registration: 'PP-GRB',
                model: 'Grob G103',
                type: 'GLIDER',
                flight_hour_value: null,
            },
            {
                registration: 'PP-ZJT',
                model: 'PZL-Bielsko SZD-48-1 Jantar 2',
                type: 'GLIDER',
                flight_hour_value: null,
            },
            {
                registration: 'PP-PW5',
                model: 'PZL Swidnik PW-5',
                type: 'GLIDER',
                flight_hour_value: null,
            },
        ],
    });
    const peopleData = [
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
    for (const p of peopleData) {
        await prisma.people.upsert({
            where: { cpf: p.cpf },
            update: {},
            create: { ...p },
        });
    }
    const people = await prisma.people.findMany({ orderBy: { id: 'asc' } });
    const byName = (name) => people.find((p) => p.name === name);
    for (const name of ['Rafael Ozório', 'Diego Fontana', 'Juliana Ribeiro']) {
        const p = byName(name);
        const exists = await prisma.instructor.findFirst({
            where: { people_id: p.id },
        });
        if (!exists)
            await prisma.instructor.create({ data: { people_id: p.id } });
    }
    for (const name of [
        'Helena Marques',
        'Beatriz Tanaka',
        'André Kobayashi',
        'Marina Prado',
    ]) {
        const p = byName(name);
        const exists = await prisma.student.findFirst({
            where: { people_id: p.id },
        });
        if (!exists)
            await prisma.student.create({ data: { people_id: p.id } });
    }
    for (const name of [
        'Rafael Ozório',
        'Beatriz Tanaka',
        'Clara Nogueira',
        'Juliana Ribeiro',
    ]) {
        const p = byName(name);
        const exists = await prisma.partner.findFirst({
            where: { people_id: p.id },
        });
        if (!exists)
            await prisma.partner.create({
                data: { people_id: p.id, monthly_dues: 320.0, status: 'active' },
            });
    }
    console.log('Seed concluído — admin@aeroclube.com / admin123');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect().finally(() => pool.end()));
//# sourceMappingURL=seed.js.map