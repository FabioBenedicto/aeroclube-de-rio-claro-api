-- CreateTable
CREATE TABLE "cnab_remessas" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sequence_number" INTEGER NOT NULL,
    "bill_ids" JSONB NOT NULL,
    "bill_count" INTEGER NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "file_path" VARCHAR(200) NOT NULL,

    CONSTRAINT "cnab_remessas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cnab_retornos" (
    "id" SERIAL NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_ids" JSONB NOT NULL,
    "rejected_ids" JSONB NOT NULL,
    "errors" JSONB NOT NULL,
    "paid_count" INTEGER NOT NULL,
    "rejected_count" INTEGER NOT NULL,

    CONSTRAINT "cnab_retornos_pkey" PRIMARY KEY ("id")
);
