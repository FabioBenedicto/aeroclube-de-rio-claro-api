-- DropForeignKey
ALTER TABLE "receivable_payments" DROP CONSTRAINT "receivable_payments_receivable_id_fkey";

-- AddForeignKey
ALTER TABLE "receivable_payments" ADD CONSTRAINT "receivable_payments_receivable_id_fkey" FOREIGN KEY ("receivable_id") REFERENCES "receivables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
