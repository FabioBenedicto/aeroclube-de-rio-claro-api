CREATE TABLE "bill_items" (
  "id"            SERIAL PRIMARY KEY,
  "bill_id"       INTEGER NOT NULL,
  "receivable_id" INTEGER NOT NULL,
  "amount"        DECIMAL(10,2) NOT NULL,

  CONSTRAINT "bill_items_bill_id_fkey"
    FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "bill_items_receivable_id_fkey"
    FOREIGN KEY ("receivable_id") REFERENCES "receivables"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "bill_items_bill_id_receivable_id_key"
    UNIQUE ("bill_id", "receivable_id")
);

ALTER TABLE "receivables" DROP COLUMN IF EXISTS "bill_id";
