-- DropForeignKey
ALTER TABLE "payable_payments" DROP CONSTRAINT "payable_payments_payable_id_fkey";

-- AddForeignKey
ALTER TABLE "payable_payments" ADD CONSTRAINT "payable_payments_payable_id_fkey" FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
