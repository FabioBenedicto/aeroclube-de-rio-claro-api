-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PayerType" ADD VALUE 'partner';
ALTER TYPE "PayerType" ADD VALUE 'employee';

-- AlterTable
ALTER TABLE "receivables" ADD COLUMN     "employee_id" INTEGER,
ADD COLUMN     "partner_id" INTEGER;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
