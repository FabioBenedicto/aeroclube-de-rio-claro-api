-- Add new columns with defaults for existing rows
ALTER TABLE "payables" ADD COLUMN "amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "payables" ADD COLUMN "amount_paid" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "payables" ADD COLUMN "due_date" DATE;

-- Copy existing data
UPDATE "payables" SET "amount" = "total_amount";

-- Remove old columns
ALTER TABLE "payables" DROP COLUMN "total_amount";
ALTER TABLE "payables" DROP COLUMN "installments_count";
ALTER TABLE "payables" DROP COLUMN "expiration_date";

-- Remove default from amount (was only needed for migration)
ALTER TABLE "payables" ALTER COLUMN "amount" DROP DEFAULT;

-- Drop installments table
DROP TABLE IF EXISTS "payable_installments";
