-- DropForeignKey
ALTER TABLE "payables" DROP CONSTRAINT "payables_instructor_id_fkey";

-- AlterTable
ALTER TABLE "payables" ALTER COLUMN "instructor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payables" ADD CONSTRAINT "payables_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
