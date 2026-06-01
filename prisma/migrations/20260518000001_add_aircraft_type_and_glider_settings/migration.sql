-- Add aircraft_type to flights (existing rows default to 'airplane')
ALTER TABLE "flights" ADD COLUMN "aircraft_type" VARCHAR(10) NOT NULL DEFAULT 'airplane';

-- Add calculation_breakdown to flights (nullable JSON for transparency)
ALTER TABLE "flights" ADD COLUMN "calculation_breakdown" JSONB;

-- Add glider pricing parameters to settings
ALTER TABLE "settings" ADD COLUMN "glider_initial_minutes" INTEGER NOT NULL DEFAULT 45;
ALTER TABLE "settings" ADD COLUMN "glider_initial_value" DECIMAL(10,2) NOT NULL DEFAULT 330.00;
ALTER TABLE "settings" ADD COLUMN "glider_minute_value" DECIMAL(10,2) NOT NULL DEFAULT 3.00;
