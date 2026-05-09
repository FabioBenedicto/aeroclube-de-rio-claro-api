CREATE TABLE "payable_payments" (
  "id"         SERIAL PRIMARY KEY,
  "payable_id" INTEGER NOT NULL,
  "amount"     DECIMAL(10,2) NOT NULL,
  "method"     VARCHAR(30),
  "paid_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes"      TEXT,

  CONSTRAINT "payable_payments_payable_id_fkey"
    FOREIGN KEY ("payable_id") REFERENCES "payables"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);
