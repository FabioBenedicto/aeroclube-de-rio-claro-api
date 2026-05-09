ALTER TABLE "invoices" RENAME TO "bills";

ALTER TABLE "receivables" RENAME COLUMN "invoice_id" TO "bill_id";
ALTER TABLE "receivable_payments" RENAME COLUMN "invoice_id" TO "bill_id";

ALTER TABLE "receivables" RENAME CONSTRAINT "receivables_invoice_id_fkey" TO "receivables_bill_id_fkey";
ALTER TABLE "receivable_payments" RENAME CONSTRAINT "receivable_payments_invoice_id_fkey" TO "receivable_payments_bill_id_fkey";
