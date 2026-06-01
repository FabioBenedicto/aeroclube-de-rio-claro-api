-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "address" VARCHAR(40),
ADD COLUMN     "city" VARCHAR(15),
ADD COLUMN     "neighborhood" VARCHAR(15),
ADD COLUMN     "state" VARCHAR(2),
ADD COLUMN     "zip_code" VARCHAR(8);

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "sicoob_carteira" VARCHAR(1),
ADD COLUMN     "sicoob_cnpj" VARCHAR(14),
ADD COLUMN     "sicoob_conta" VARCHAR(12),
ADD COLUMN     "sicoob_conta_dv" VARCHAR(1),
ADD COLUMN     "sicoob_cooperativa_dv" VARCHAR(1),
ADD COLUMN     "sicoob_cooperativa_prefix" VARCHAR(5),
ADD COLUMN     "sicoob_modalidade" VARCHAR(2),
ADD COLUMN     "sicoob_nome_empresa" VARCHAR(30),
ADD COLUMN     "sicoob_remessa_sequence" INTEGER NOT NULL DEFAULT 0;
