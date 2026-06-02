-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('open', 'pending_cnab', 'paid', 'cancelled');

-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "payment_method" VARCHAR(30),
ADD COLUMN     "payment_source" VARCHAR(10),
ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'open';
