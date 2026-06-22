-- Drop address columns from peoples
ALTER TABLE "peoples" DROP COLUMN IF EXISTS "address";
ALTER TABLE "peoples" DROP COLUMN IF EXISTS "neighborhood";
ALTER TABLE "peoples" DROP COLUMN IF EXISTS "city";
ALTER TABLE "peoples" DROP COLUMN IF EXISTS "state";
ALTER TABLE "peoples" DROP COLUMN IF EXISTS "zip_code";

-- Create addresses table
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "street" VARCHAR(40),
    "neighborhood" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(2),
    "zip_code" VARCHAR(8),
    "people_id" INTEGER NOT NULL,
    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- Unique index on people_id (enforces 1:1)
CREATE UNIQUE INDEX "addresses_people_id_key" ON "addresses"("people_id");

-- Foreign key with cascade delete
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_people_id_fkey"
    FOREIGN KEY ("people_id") REFERENCES "peoples"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
