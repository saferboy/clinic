/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `client_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,region_id]` on the table `loc_districts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `loc_regions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `sources` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `user_roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "client_groups_name_idx";

-- DropIndex
DROP INDEX "departments_name_idx";

-- DropIndex
DROP INDEX "loc_regions_name_idx";

-- DropIndex
DROP INDEX "sources_name_idx";

-- DropIndex
DROP INDEX "user_roles_name_idx";

-- AlterTable
ALTER TABLE "user_roles" ADD COLUMN     "modified_by" INTEGER,
ADD COLUMN     "registered_by" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "client_groups_name_key" ON "client_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "loc_districts_name_region_id_key" ON "loc_districts"("name", "region_id");

-- CreateIndex
CREATE UNIQUE INDEX "loc_regions_name_key" ON "loc_regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sources_name_key" ON "sources"("name");

-- CreateIndex
CREATE INDEX "user_roles_deleted_at_idx" ON "user_roles"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
