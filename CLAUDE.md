# CLAUDE.md — Aeroclube API

## Stack

NestJS · Prisma · PostgreSQL · JWT · class-validator · class-transformer · Jest

---

## Padrões de código

### Injeção de dependência — Symbol tokens

Todo repositório e provider usa um Symbol token co-localizado no arquivo de interface:

```ts
// src/bills/repository/bills-repository.interface.ts
export const BILLS_REPOSITORY = Symbol('IBillsRepository');
export interface IBillsRepository { ... }
```

No módulo:

```ts
providers: [BillsService, { provide: BILLS_REPOSITORY, useClass: BillsRepository }]
exports: [BILLS_REPOSITORY] // apenas quando outros módulos precisam injetar
```

No serviço:

```ts
constructor(@Inject(BILLS_REPOSITORY) private readonly repo: IBillsRepository) {}
```

Nos testes:

```ts
{ provide: BILLS_REPOSITORY, useClass: FakeBillsRepository }
repo = module.get<FakeBillsRepository>(BILLS_REPOSITORY);
```

### Repository pattern

Cada domínio tem três arquivos de repositório:

- `repository/x-repository.interface.ts` — interface + Symbol token
- `repository/x.repository.ts` — implementação real com Prisma
- `repository/fake-x.repository.ts` — implementação in-memory para testes

Fake repositories implementam a interface e expõem arrays públicos para asserções:

```ts
export class FakeBillsRepository implements IBillsRepository {
  bills: Bill[] = [];
  private nextId = 1;

  async create(data: CreateBillDto): Promise<Bill> {
    const bill = plainToInstance(Bill, { id: this.nextId++, ...data });
    this.bills.push(bill);
    return bill;
  }

  async findById(id: number): Promise<Bill | null> {
    return this.bills.find(b => b.id === id) ?? null;
  }
}
```

Regras para fakes:
- Implementam 100% da interface (`implements IXRepository`)
- Expõem arrays/mapas públicos para asserções nos testes
- Retornam `null` (não `undefined`) quando um item não é encontrado
- Usam `nextId` privado incremental para IDs auto-gerados

### Prisma — includes tipados

```ts
const personInclude = {
  address: true,
  instructors: true,
};

type PersonRaw = Prisma.PeopleGetPayload<{ include: typeof personInclude }>;
```

O mapper `toModel()` converte `PersonRaw` → model class:

```ts
function toPerson(raw: PersonRaw): Person {
  return plainToInstance(Person, raw);
}
```

### Paginação

Usar `Paginated<T>` de `common/dto/pagination.dto` como tipo de retorno:

```ts
listAll(page: number, limit: number, search?: string): Promise<Paginated<Person>>;
```

### Módulos

Estrutura padrão de diretórios:

```
src/bills/
  dto/
    create-bill.dto.ts
    update-bill.dto.ts
  model/
    bill.model.ts
  repository/
    bills-repository.interface.ts  ← Symbol token aqui
    bills.repository.ts
    fake-bills.repository.ts
  bills.controller.ts
  bills.service.ts
  bills.service.spec.ts
  bills.module.ts
```

### Convenções de nomes

| Artefato | Case | Exemplo |
|---|---|---|
| Classes, DTOs, Models | PascalCase | `BillsService`, `CreateBillDto` |
| Interfaces | PascalCase com prefixo `I` | `IBillsRepository` |
| Enums | PascalCase com prefixo `E` | `EStakeholder` |
| Symbol tokens | SCREAMING_SNAKE_CASE | `BILLS_REPOSITORY` |
| Variáveis e funções | camelCase | `findById`, `totalAmount` |
| Arquivos | kebab-case | `bills.service.ts`, `fake-bills.repository.ts` |

### PrismaModule

`@Global()` — disponível em todos os módulos sem necessidade de importar explicitamente.

### Testes — valores de teste

Usar `@faker-js/faker` para gerar valores, nunca strings hardcoded:

```ts
import { faker } from '@faker-js/faker';

const name = faker.person.fullName();
const email = faker.internet.email();
const amount = faker.number.int({ min: 100, max: 10000 });
```

### Erros nos serviços

- `NotFoundException` — entidade não encontrada
- `ConflictException` — violação de unicidade
- `UnprocessableEntityException` — regra de negócio violada

Mensagens sempre em português.

### Guards e permissões

Todo endpoint de controller deve ter:

```ts
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission(PERM.MODULE.ACTION)
```

As constantes de permissão ficam em `src/common/constants/permissions.ts`.

### DTOs de entrada

- `@IsNotEmpty()` em campos obrigatórios
- `@IsOptional()` em todos os campos de update
- `@Type(() => Number)` para numéricos vindos de query string
- `@ValidateNested()` + `@Type()` para objetos aninhados

---

## Arquitetura — responsabilidades por camada

```
Request → Controller → Service → Repository → Prisma → DB
```

### Controller

- Recebe e valida a request via DTO (class-validator faz o trabalho)
- Chama o service e retorna a response
- Não contém lógica de negócio
- Declara guards, permissões e serialização

### Service

- Contém toda a lógica de negócio e regras do domínio
- Orquestra chamadas a repositórios (e outros services quando necessário)
- Lança exceções HTTP (`NotFoundException`, `ConflictException`, etc.)
- Nunca acessa o Prisma diretamente — sempre via repositório

### Repository

- Única camada que conhece o Prisma
- Define includes tipados e mapeia `Raw → Model` com `plainToInstance`
- Não contém lógica de negócio — apenas queries e mapeamento
- Implementa a interface `IXRepository`

### Model

- Classe que representa a entidade do domínio
- Decorada com `@Expose()` para serialização via `ClassSerializerInterceptor`
- Sem lógica — apenas propriedades tipadas

### DTO

- Define o contrato de entrada de dados (create, update, query params)
- Validação declarada com decorators de `class-validator`
- Transformação com `class-transformer` (`@Type`, `@Transform`)

### Common

Utilitários e infraestrutura compartilhados entre todos os módulos:

```
src/common/
  constants/        ← PERM, outras constantes globais
  decorators/       ← @RequirePermission, @CurrentUser, etc.
  dto/              ← Paginated<T>, QueryDto base
  filters/          ← GlobalExceptionFilter
  guards/           ← JwtAuthGuard, PermissionsGuard
  interceptors/     ← ClassSerializerInterceptor config
  providers/
    azure-blob/     ← IAzureBlobService, AzureBlobService, FakeAzureBlobService, AzureBlobModule
    outro-provider/ ← cada provider futuro em sua própria subpasta
```

---

## Plano de refatoração

### Prioridade 1 — Corrigir ESM do @faker-js/faker no Jest

Três specs falham com `SyntaxError: Cannot use import statement outside a module`:

- `peoples.service.spec.ts`
- `users.service.spec.ts`
- `companies.service.spec.ts`

Solução: ajustar `jest.config.ts` para transformar o pacote — remover `@faker-js/faker` do `transformIgnorePatterns` (ou adicionar regra de transformação explícita via `babel-jest`).

### Prioridade 2 — Criar fakes e spec para payable-types e receivable-types

Repositórios sem fake implementations:

- `src/payable-types/repository/` — criar `fake-payable-types.repository.ts`
- `src/receivable-types/repository/` — criar `fake-receivable-types.repository.ts`

Specs ausentes:

- `src/payable-types/payable-types.service.spec.ts` — criar cobrindo CRUD e validações

O `receivable-types.service.spec.ts` já existe mas usa dados hardcoded — migrar para faker.

### Prioridade 3 — Migrar specs hardcoded para faker

Os seguintes specs usam strings e IDs hardcoded em vez de faker:

- `aircraft.service.spec.ts`
- `auth.service.spec.ts`
- `bills.service.spec.ts`
- `dashboard.service.spec.ts`
- `flights.service.spec.ts`
- `payables.service.spec.ts`
- `receivables.service.spec.ts`
- `settings.service.spec.ts`

### Prioridade 4 — Adicionar repositório ao ReportsModule

`src/reports/` não tem camada de repositório. O service acessa o Prisma diretamente. Avaliar se a complexidade das queries justifica a abstração ou se o acesso direto ao Prisma com includes tipados é suficiente para o caso.

### Prioridade 5 — Auditar validações de DTOs

Varrer todos os `create-*.dto.ts` e `update-*.dto.ts` garantindo as regras de decorators descritas acima.

### Prioridade 6 — Auditar guards nos controllers

Verificar que todos os endpoints têm `@UseGuards(JwtAuthGuard, PermissionsGuard)` e `@RequirePermission()` com o token correto.

### Prioridade 7 — Revisar grafo de dependências entre módulos

Com Symbol tokens + module exports, verificar que não há ciclos. Pontos de atenção:

- `CnabModule` importa `BillsModule` e `SettingsModule`
- `FlightsModule` importa `ReceivablesModule` e `PayablesModule`
- `BillsModule` exporta `BILLS_REPOSITORY` para uso externo
