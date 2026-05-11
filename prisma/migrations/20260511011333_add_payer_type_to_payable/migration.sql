-- AlterTable
ALTER TABLE "payables" ADD COLUMN     "employee_id" INTEGER,
ADD COLUMN     "partner_id" INTEGER,
ADD COLUMN     "payer_type" "PayerType" NOT NULL DEFAULT 'none';

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
