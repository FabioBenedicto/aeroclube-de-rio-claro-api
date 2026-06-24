-- Rename receivable types from English to Portuguese (capitalize)
UPDATE "receivable_types" SET "name" = 'Voo'        WHERE "name" = 'FLIGHT';
UPDATE "receivable_types" SET "name" = 'Crédito'    WHERE "name" = 'CREDIT';
UPDATE "receivable_types" SET "name" = 'Outro'       WHERE "name" = 'OTHER';
INSERT INTO "receivable_types" ("name") VALUES ('Mensalidade'), ('Serviço')
  ON CONFLICT ("name") DO NOTHING;

-- Rename payable types from English to Portuguese (capitalize)
UPDATE "payable_types" SET "name" = 'Instrução'    WHERE "name" = 'INSTRUCTION';
UPDATE "payable_types" SET "name" = 'Outro'         WHERE "name" = 'OTHER';
INSERT INTO "payable_types" ("name") VALUES ('Serviço'), ('Manutenção')
  ON CONFLICT ("name") DO NOTHING;
