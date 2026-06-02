# CNAB History — API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Execute this plan BEFORE** `aeroclube-web/docs/superpowers/plans/2026-06-02-cnab-history-web.md`.

**Goal:** Persistir histórico de remessas e retornos CNAB no banco, salvar arquivos `.rem` em disco, e expor endpoints de listagem e download.

**Architecture:** Dois novos modelos Prisma (`CnabRemessa`, `CnabRetorno`). `POST /cnab/remessa` passa a salvar o arquivo em `uploads/cnab/` e retornar JSON em vez de stream binário. Novos endpoints `GET /cnab/remessas`, `GET /cnab/remessas/:id/download` e `GET /cnab/retornos`. `CnabService.processRetorno` persiste o resultado.

**Tech Stack:** NestJS, Prisma ORM, PostgreSQL, Jest, Node.js `fs` module

---

## Mapa de arquivos

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Adicionar `CnabRemessa` e `CnabRetorno` |
| `prisma/migrations/` | Nova migration gerada automaticamente |
| `src/cnab/cnab.repository.ts` | Adicionar 5 novos métodos |
| `src/cnab/cnab.service.ts` | Alterar `generateRemessa`, `processRetorno`; adicionar `downloadRemessa`, `listRemessas`, `listRetornos` |
| `src/cnab/cnab.service.spec.ts` | Atualizar mock de `generateRemessa`; adicionar mock de `saveRemessa`, `saveRetorno` |
| `src/cnab/cnab.controller.ts` | Modificar `POST /cnab/remessa`; adicionar 3 novos endpoints |

---

## Task 1: Schema Prisma — CnabRemessa e CnabRetorno

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Adicionar os dois modelos ao schema**

Adicionar ao final de `prisma/schema.prisma` (antes do fechamento do arquivo):

```prisma
model CnabRemessa {
  id              Int      @id @default(autoincrement())
  created_at      DateTime @default(now())
  sequence_number Int
  bill_ids        Json
  bill_count      Int
  total_amount    Decimal  @db.Decimal(12, 2)
  file_path       String   @db.VarChar(200)

  @@map("cnab_remessas")
}

model CnabRetorno {
  id             Int      @id @default(autoincrement())
  processed_at   DateTime @default(now())
  paid_ids       Json
  rejected_ids   Json
  errors         Json
  paid_count     Int
  rejected_count Int

  @@map("cnab_retornos")
}
```

- [ ] **Step 2: Gerar e aplicar migration**

```bash
cd C:\Users\FabioHenriqueBenedic\www\aeroclube\aeroclube-api
npx prisma migrate dev --name add_cnab_history
```

Saída esperada: `Your database is now in sync with your schema.`

- [ ] **Step 3: Regenerar Prisma Client**

```bash
npx prisma generate
```

Saída esperada: `Generated Prisma Client`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add CnabRemessa and CnabRetorno models"
```

---

## Task 2: CnabRepository — novos métodos

**Files:**
- Modify: `src/cnab/cnab.repository.ts`

- [ ] **Step 1: Adicionar os 5 novos métodos ao repositório**

Abrir `src/cnab/cnab.repository.ts` e adicionar após `incrementRemessaSequence`:

```typescript
saveRemessa(data: {
  sequence_number: number;
  bill_ids: number[];
  bill_count: number;
  total_amount: number;
  file_path: string;
}) {
  return this.prisma.cnabRemessa.create({ data });
}

async listRemessas(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.prisma.cnabRemessa.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.cnabRemessa.count(),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

findRemessa(id: number) {
  return this.prisma.cnabRemessa.findUnique({ where: { id } });
}

saveRetorno(data: {
  paid_ids: number[];
  rejected_ids: number[];
  errors: string[];
  paid_count: number;
  rejected_count: number;
}) {
  return this.prisma.cnabRetorno.create({ data });
}

async listRetornos(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    this.prisma.cnabRetorno.findMany({
      orderBy: { processed_at: 'desc' },
      skip,
      take: limit,
    }),
    this.prisma.cnabRetorno.count(),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}
```

- [ ] **Step 2: Verificar compilação**

```bash
cd C:\Users\FabioHenriqueBenedic\www\aeroclube\aeroclube-api
npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/cnab/cnab.repository.ts
git commit -m "feat: add saveRemessa, listRemessas, findRemessa, saveRetorno, listRetornos to CnabRepository"
```

---

## Task 3: CnabService — geração com persistência e download

**Files:**
- Modify: `src/cnab/cnab.service.ts`
- Modify: `src/cnab/cnab.service.spec.ts`

- [ ] **Step 1: Atualizar os testes que irão falhar**

Substituir o conteúdo de `src/cnab/cnab.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { CnabService } from './cnab.service';
import { CnabRepository } from './cnab.repository';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock-file')),
}));

describe('CnabService', () => {
  let service: CnabService;
  let repo: jest.Mocked<CnabRepository>;

  const mockSettings = {
    sicoob_cooperativa_prefix: '0756',
    sicoob_cooperativa_dv: '0',
    sicoob_conta: '123456789012',
    sicoob_conta_dv: '0',
    sicoob_carteira: '1',
    sicoob_modalidade: '01',
    sicoob_cnpj: '12345678000190',
    sicoob_nome_empresa: 'AEROCLUBE',
    sicoob_remessa_sequence: 1,
    sicoob_juros: 0,
    sicoob_juros_prazo: 0,
    sicoob_agencia: null,
  };

  const mockBill = {
    id: 1,
    total_amount: { toString: () => '100.00' },
    due_date: new Date(Date.UTC(2026, 6, 30)),
    issue_date: new Date(Date.UTC(2026, 5, 1)),
    customer: {
      cpf: '12345678900',
      name: 'JOAO SILVA',
      address: 'RUA A',
      neighborhood: 'CENTRO',
      city: 'RIO CLARO',
      state: 'SP',
      zip_code: '13500000',
    },
  };

  const mockRemessa = {
    id: 1,
    sequence_number: 1,
    bill_ids: [1],
    bill_count: 1,
    total_amount: 100,
    file_path: '/uploads/cnab/remessa_20260602_1.rem',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CnabService,
        {
          provide: CnabRepository,
          useValue: {
            getSettings: jest.fn(),
            findBillsByIds: jest.fn(),
            incrementRemessaSequence: jest.fn(),
            markBillsPendingCnab: jest.fn(),
            saveRemessa: jest.fn(),
            saveRetorno: jest.fn(),
            markBillPaid: jest.fn(),
            findRemessa: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(CnabService);
    repo = module.get(CnabRepository);
  });

  describe('generateRemessa', () => {
    it('salva arquivo, chama saveRemessa e retorna CnabRemessa', async () => {
      repo.getSettings.mockResolvedValue(mockSettings as any);
      repo.findBillsByIds.mockResolvedValue([mockBill as any]);
      repo.incrementRemessaSequence.mockResolvedValue(undefined as any);
      repo.markBillsPendingCnab.mockResolvedValue(undefined as any);
      repo.saveRemessa.mockResolvedValue(mockRemessa as any);

      const result = await service.generateRemessa({ bill_ids: [1] });

      expect(repo.saveRemessa).toHaveBeenCalledWith(
        expect.objectContaining({
          sequence_number: 1,
          bill_ids: [1],
          bill_count: 1,
        }),
      );
      expect(result).toEqual(mockRemessa);
    });

    it('chama markBillsPendingCnab com os ids', async () => {
      repo.getSettings.mockResolvedValue(mockSettings as any);
      repo.findBillsByIds.mockResolvedValue([mockBill as any]);
      repo.incrementRemessaSequence.mockResolvedValue(undefined as any);
      repo.markBillsPendingCnab.mockResolvedValue(undefined as any);
      repo.saveRemessa.mockResolvedValue(mockRemessa as any);

      await service.generateRemessa({ bill_ids: [1] });

      expect(repo.markBillsPendingCnab).toHaveBeenCalledWith([1]);
    });

    it('lança UnprocessableEntityException se settings estiverem incompletos', async () => {
      repo.getSettings.mockResolvedValue(null);
      await expect(service.generateRemessa({ bill_ids: [1] })).rejects.toThrow(
        'Configurações Sicoob incompletas',
      );
    });
  });

  describe('downloadRemessa', () => {
    it('retorna buffer e filename quando remessa existe', async () => {
      repo.findRemessa.mockResolvedValue(mockRemessa as any);
      const result = await service.downloadRemessa(1);
      expect(result.filename).toBe('remessa_20260602_1.rem');
      expect(result.buffer).toBeDefined();
    });

    it('lança NotFoundException quando remessa não existe', async () => {
      repo.findRemessa.mockResolvedValue(null);
      await expect(service.downloadRemessa(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('processRetorno', () => {
    it('chama saveRetorno e retorna retorno_id', async () => {
      const fakeRetorno = { id: 5, paid_count: 0, rejected_count: 0 };
      repo.saveRetorno.mockResolvedValue(fakeRetorno as any);

      const emptyContent = [
        '756' + '0000' + '0',
        '756' + '9999' + '9',
      ].map(l => l.padEnd(240, ' ')).join('\r\n');

      const result = await service.processRetorno(Buffer.from(emptyContent));
      expect(result.retorno_id).toBe(5);
      expect(repo.saveRetorno).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

```bash
cd C:\Users\FabioHenriqueBenedic\www\aeroclube\aeroclube-api
npx jest --testPathPattern=cnab.service.spec --no-coverage
```

Saída esperada: FAIL — métodos não existem ainda.

- [ ] **Step 3: Substituir o conteúdo de `src/cnab/cnab.service.ts`**

```typescript
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { join } from 'path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import * as iconv from 'iconv-lite';
import { CnabRepository } from './cnab.repository';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';
import { buildRemessaLines } from './builders/remessa.builder';
import { parseRetorno, RetornoResult } from './parsers/retorno.parser';

@Injectable()
export class CnabService {
  constructor(private readonly repo: CnabRepository) {}

  async generateRemessa(dto: GenerateRemessaDto) {
    const settings = await this.repo.getSettings();

    if (
      !settings?.sicoob_cooperativa_prefix ||
      !settings?.sicoob_cooperativa_dv ||
      !settings?.sicoob_conta ||
      !settings?.sicoob_conta_dv ||
      !settings?.sicoob_cnpj ||
      !settings?.sicoob_carteira ||
      !settings?.sicoob_modalidade ||
      !settings?.sicoob_nome_empresa
    ) {
      throw new UnprocessableEntityException(
        'Configurações Sicoob incompletas. Preencha em PUT /api/settings.',
      );
    }

    const bills = await this.repo.findBillsByIds(dto.bill_ids);

    const invalidBills = bills.filter((b) => !b.due_date);
    if (invalidBills.length > 0) {
      throw new UnprocessableEntityException(
        `Faturas sem data de vencimento: ${invalidBills.map((b) => b.id).join(', ')}`,
      );
    }

    const seqNumber = settings.sicoob_remessa_sequence;
    const now = new Date();

    const lines = buildRemessaLines(
      {
        sicoob_cooperativa_prefix: settings.sicoob_cooperativa_prefix,
        sicoob_cooperativa_dv: settings.sicoob_cooperativa_dv,
        sicoob_conta: settings.sicoob_conta,
        sicoob_conta_dv: settings.sicoob_conta_dv,
        sicoob_carteira: settings.sicoob_carteira,
        sicoob_modalidade: settings.sicoob_modalidade,
        sicoob_cnpj: settings.sicoob_cnpj,
        sicoob_nome_empresa: settings.sicoob_nome_empresa,
        sicoob_remessa_sequence: seqNumber,
        sicoob_juros: Number(settings.sicoob_juros ?? 0),
        sicoob_juros_prazo: settings.sicoob_juros_prazo ?? 0,
        sicoob_agencia: settings.sicoob_agencia,
      },
      bills as any,
      now,
    );
    const content = lines.join('\r\n') + '\r\n';
    const buffer = iconv.encode(content, 'win1252');

    const dd = String(now.getUTCDate()).padStart(2, '0');
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = String(now.getUTCFullYear());
    const dateStr = `${yyyy}${mm}${dd}`;
    const filename = `remessa_${dateStr}_${seqNumber}.rem`;
    const dir = join(process.cwd(), 'uploads', 'cnab');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), buffer);

    const totalAmount = bills.reduce((s, b) => s + parseFloat(String(b.total_amount)), 0);

    await this.repo.incrementRemessaSequence();
    await this.repo.markBillsPendingCnab(dto.bill_ids);

    return this.repo.saveRemessa({
      sequence_number: seqNumber,
      bill_ids: dto.bill_ids,
      bill_count: dto.bill_ids.length,
      total_amount: totalAmount,
      file_path: `/uploads/cnab/${filename}`,
    });
  }

  async downloadRemessa(id: number): Promise<{ buffer: Buffer; filename: string }> {
    const remessa = await this.repo.findRemessa(id);
    if (!remessa) throw new NotFoundException(`Remessa ${id} não encontrada`);

    const fullPath = join(process.cwd(), remessa.file_path);
    if (!existsSync(fullPath)) {
      throw new NotFoundException('Arquivo de remessa não encontrado no disco');
    }

    const buffer = readFileSync(fullPath);
    const filename = remessa.file_path.split('/').pop()!;
    return { buffer, filename };
  }

  listRemessas(page: number, limit: number) {
    return this.repo.listRemessas(page, limit);
  }

  listRetornos(page: number, limit: number) {
    return this.repo.listRetornos(page, limit);
  }

  async processRetorno(fileBuffer: Buffer): Promise<RetornoResult & { updated: number[]; retorno_id: number }> {
    const content = iconv.decode(fileBuffer, 'win1252');
    const result = parseRetorno(content);

    const updated: number[] = [];
    for (const entry of result.paid) {
      const bill = await this.repo.markBillPaid(entry.billId, entry.paymentDate).catch(() => null);
      if (bill) updated.push(entry.billId);
      else result.errors.push(`Fatura ${entry.billId} não encontrada no sistema`);
    }

    const retorno = await this.repo.saveRetorno({
      paid_ids: updated,
      rejected_ids: result.rejected,
      errors: result.errors,
      paid_count: updated.length,
      rejected_count: result.rejected.length,
    });

    return { ...result, updated, retorno_id: retorno.id };
  }
}
```

- [ ] **Step 4: Rodar os testes para confirmar que passam**

```bash
npx jest --testPathPattern=cnab.service.spec --no-coverage
```

Saída esperada: PASS — todos os testes passando.

- [ ] **Step 5: Garantir que todos os testes CNAB passam**

```bash
npx jest --testPathPattern=cnab --no-coverage
```

Saída esperada: PASS — todos os testes CNAB passando.

- [ ] **Step 6: Commit**

```bash
git add src/cnab/cnab.service.ts src/cnab/cnab.service.spec.ts
git commit -m "feat: generateRemessa saves file and returns JSON, add downloadRemessa, persist CnabRetorno"
```

---

## Task 4: CnabController — novos endpoints e modificação do POST

**Files:**
- Modify: `src/cnab/cnab.controller.ts`

- [ ] **Step 1: Substituir o conteúdo de `src/cnab/cnab.controller.ts`**

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CnabService } from './cnab.service';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';

@ApiTags('cnab')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cnab')
export class CnabController {
  constructor(private readonly cnabService: CnabService) {}

  @Post('remessa')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gerar arquivo CNAB 240 de remessa para o Sicoob' })
  generateRemessa(@Body() dto: GenerateRemessaDto) {
    return this.cnabService.generateRemessa(dto);
  }

  @Get('remessas')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar remessas CNAB geradas' })
  listRemessas(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.cnabService.listRemessas(Number(page), Number(limit));
  }

  @Get('remessas/:id/download')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Baixar arquivo .rem de uma remessa' })
  async downloadRemessa(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.cnabService.downloadRemessa(id);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('retornos')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar retornos CNAB processados' })
  listRetornos(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.cnabService.listRetornos(Number(page), Number(limit));
  }

  @Post('retorno')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Processar arquivo CNAB 240 de retorno do Sicoob' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async processRetorno(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo de retorno não enviado (campo: file)');
    return this.cnabService.processRetorno(file.buffer);
  }
}
```

- [ ] **Step 2: Verificar compilação TypeScript**

```bash
cd C:\Users\FabioHenriqueBenedic\www\aeroclube\aeroclube-api
npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 3: Rodar toda a suite de testes**

```bash
npx jest --no-coverage
```

Saída esperada: todos os testes passando.

- [ ] **Step 4: Commit**

```bash
git add src/cnab/cnab.controller.ts
git commit -m "feat: add GET /cnab/remessas, GET /cnab/remessas/:id/download, GET /cnab/retornos; POST /cnab/remessa returns JSON"
```
