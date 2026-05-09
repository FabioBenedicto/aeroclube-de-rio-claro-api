-- AlterTable
ALTER TABLE "bills" RENAME CONSTRAINT "invoices_pkey" TO "bills_pkey";

-- AlterTable
ALTER TABLE "payables" ADD COLUMN     "client_id" INTEGER,
ADD COLUMN     "plane_id" INTEGER;

-- AlterTable
ALTER TABLE "receivables" ADD COLUMN     "instructor_id" INTEGER,
ADD COLUMN     "plane_id" INTEGER;

-- RenameForeignKey
ALTER TABLE "bills" RENAME CONSTRAINT "invoices_customer_id_fkey" TO "bills_customer_id_fkey";

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_plane_id_fkey" FOREIGN KEY ("plane_id") REFERENCES "planes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_plane_id_fkey" FOREIGN KEY ("plane_id") REFERENCES "planes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
