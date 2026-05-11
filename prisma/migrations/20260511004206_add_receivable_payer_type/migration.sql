-- CreateEnum
CREATE TYPE "PayerType" AS ENUM ('customer', 'company', 'instructor', 'none');

-- AlterTable
ALTER TABLE "receivables" ADD COLUMN     "payer_type" "PayerType" NOT NULL DEFAULT 'none';

-- Backfill payer_type from existing FK columns (priority: client > company > instructor > none)
UPDATE "receivables" SET payer_type = 'customer'   WHERE client_id IS NOT NULL;
UPDATE "receivables" SET payer_type = 'company'    WHERE client_id IS NULL AND company_id IS NOT NULL;
UPDATE "receivables" SET payer_type = 'instructor' WHERE client_id IS NULL AND company_id IS NULL AND instructor_id IS NOT NULL;
