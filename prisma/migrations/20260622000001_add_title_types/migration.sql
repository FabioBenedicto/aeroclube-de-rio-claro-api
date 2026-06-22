-- Create type tables
CREATE TABLE IF NOT EXISTS "receivable_types" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "receivable_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "receivable_types_name_key" ON "receivable_types"("name");

CREATE TABLE IF NOT EXISTS "payable_types" (
  "id" SERIAL NOT NULL,
  "name" VARCHAR(50) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payable_types_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "payable_types_name_key" ON "payable_types"("name");

-- Seed initial types (skip if already seeded)
INSERT INTO "receivable_types" ("name") VALUES ('FLIGHT'), ('CREDIT'), ('OTHER')
  ON CONFLICT ("name") DO NOTHING;
INSERT INTO "payable_types" ("name") VALUES ('INSTRUCTION'), ('OTHER')
  ON CONFLICT ("name") DO NOTHING;

-- Add FK columns (nullable first to allow data migration)
ALTER TABLE "receivables" ADD COLUMN IF NOT EXISTS "receivable_type_id" INTEGER;
ALTER TABLE "payables" ADD COLUMN IF NOT EXISTS "payable_type_id" INTEGER;

-- Migrate existing string type values to FK (using 'product' column which is the actual DB column)
UPDATE "receivables"
SET "receivable_type_id" = COALESCE(
  (SELECT "id" FROM "receivable_types" WHERE "name" = "receivables"."product"),
  (SELECT "id" FROM "receivable_types" WHERE "name" = 'OTHER')
)
WHERE "receivable_type_id" IS NULL;

UPDATE "payables"
SET "payable_type_id" = COALESCE(
  (SELECT "id" FROM "payable_types" WHERE "name" = "payables"."product"),
  (SELECT "id" FROM "payable_types" WHERE "name" = 'OTHER')
)
WHERE "payable_type_id" IS NULL;

-- Make receivable_type_id NOT NULL after data migration
ALTER TABLE "receivables" ALTER COLUMN "receivable_type_id" SET NOT NULL;

-- Add foreign key constraints (skip if already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'receivables_receivable_type_id_fkey'
  ) THEN
    ALTER TABLE "receivables"
      ADD CONSTRAINT "receivables_receivable_type_id_fkey"
      FOREIGN KEY ("receivable_type_id") REFERENCES "receivable_types"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payables_payable_type_id_fkey'
  ) THEN
    ALTER TABLE "payables"
      ADD CONSTRAINT "payables_payable_type_id_fkey"
      FOREIGN KEY ("payable_type_id") REFERENCES "payable_types"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Drop old string type columns
ALTER TABLE "receivables" DROP COLUMN IF EXISTS "product";
ALTER TABLE "payables" DROP COLUMN IF EXISTS "product";
