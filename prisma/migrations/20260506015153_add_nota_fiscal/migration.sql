-- AlterTable
ALTER TABLE "bills" ADD COLUMN     "nota_fiscal_path" TEXT;

-- AlterTable
ALTER TABLE "payable_payments" ADD COLUMN     "nota_fiscal_path" TEXT;

-- AlterTable
ALTER TABLE "receivable_payments" ADD COLUMN     "nota_fiscal_path" TEXT;
