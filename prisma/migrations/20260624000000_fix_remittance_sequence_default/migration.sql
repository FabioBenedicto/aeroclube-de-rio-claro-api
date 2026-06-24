-- Fix remittance_sequence default from 0 to 1 (Sicoob rejects NSA = 0)
ALTER TABLE "sicoob_config" ALTER COLUMN "remittance_sequence" SET DEFAULT 1;

-- Correct any existing row that was never used (sequence still at 0)
UPDATE "sicoob_config" SET "remittance_sequence" = 1 WHERE "remittance_sequence" = 0;
