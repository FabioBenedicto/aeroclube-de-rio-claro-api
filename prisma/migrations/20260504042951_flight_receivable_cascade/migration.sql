-- DropForeignKey
ALTER TABLE "receivables" DROP CONSTRAINT "receivables_flight_id_fkey";

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flights"("id") ON DELETE CASCADE ON UPDATE CASCADE;
