/*
  Warnings:

  - You are about to drop the column `status` on the `bills` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `flights` table. All the data in the column will be lost.
  - You are about to drop the column `canac` on the `instructors` table. All the data in the column will be lost.
  - You are about to drop the column `cht` on the `instructors` table. All the data in the column will be lost.
  - You are about to drop the column `canac` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `military_service_certificate` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `voter_registration` on the `student` table. All the data in the column will be lost.
  - You are about to drop the `bill_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bill_items" DROP CONSTRAINT "bill_items_bill_id_fkey";

-- DropForeignKey
ALTER TABLE "bill_items" DROP CONSTRAINT "bill_items_receivable_id_fkey";

-- DropIndex
DROP INDEX "instructors_canac_key";

-- AlterTable
ALTER TABLE "bills" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "flights" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "instructors" DROP COLUMN "canac",
DROP COLUMN "cht";

-- AlterTable
ALTER TABLE "payables" ADD COLUMN     "company_id" INTEGER;

-- AlterTable
ALTER TABLE "receivables" ADD COLUMN     "company_id" INTEGER;

-- AlterTable
ALTER TABLE "student" DROP COLUMN "canac",
DROP COLUMN "military_service_certificate",
DROP COLUMN "voter_registration";

-- DropTable
DROP TABLE "bill_items";

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "cnpj" VARCHAR(18),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_cnpj_key" ON "companies"("cnpj");

-- AddForeignKey
ALTER TABLE "receivables" ADD CONSTRAINT "receivables_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
