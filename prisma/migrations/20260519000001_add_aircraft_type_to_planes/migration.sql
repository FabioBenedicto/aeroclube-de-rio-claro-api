-- Add aircraft_type to planes (existing rows default to 'airplane')
ALTER TABLE "planes" ADD COLUMN "aircraft_type" VARCHAR(10) NOT NULL DEFAULT 'airplane';

-- Make flight_hour_value nullable (planadores não têm valor/hora)
ALTER TABLE "planes" ALTER COLUMN "flight_hour_value" DROP NOT NULL;
