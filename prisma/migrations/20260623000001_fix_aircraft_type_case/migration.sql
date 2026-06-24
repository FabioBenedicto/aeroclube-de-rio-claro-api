-- Normalize aircraft type values to uppercase to match EAircraftType enum
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'aircrafts') THEN
    UPDATE "aircrafts" SET "type" = 'AIRPLANE' WHERE "type" = 'airplane';
    UPDATE "aircrafts" SET "type" = 'GLIDER'   WHERE "type" = 'glider';
    ALTER TABLE "aircrafts" ALTER COLUMN "type" SET DEFAULT 'AIRPLANE';
  END IF;
END $$;
