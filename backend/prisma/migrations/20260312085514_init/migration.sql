-- CreateEnum
CREATE TYPE "ClientGender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('INCOME', 'OUTCOME');

-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ServiceUserType" AS ENUM ('FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'DONE');

-- CreateEnum
CREATE TYPE "VisitRoomStatus" AS ENUM ('ASSIGNED', 'IN_USE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER,
    "full_name" VARCHAR(100) NOT NULL,
    "login" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "permissions" JSONB,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "group_id" INTEGER,
    "gender" "ClientGender" NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "region_id" INTEGER,
    "district_id" INTEGER,
    "address" VARCHAR(255),
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "source_id" INTEGER,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "client_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_paid" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "visit_id" INTEGER,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "client_paid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loc_regions" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "loc_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loc_districts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "region_id" INTEGER,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "loc_districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_paid" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "other_paid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "other_paid_groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "other_paid_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "user_id" INTEGER,
    "visit_id" INTEGER,
    "amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payment_type" "PaymentType" NOT NULL DEFAULT 'INCOME',
    "description" TEXT,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "room_number" VARCHAR(20),
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "description" TEXT,
    "record_status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "duration_min" INTEGER DEFAULT 30,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_users" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER,
    "user_id" INTEGER,
    "type" "ServiceUserType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "service_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER,
    "doctor_id" INTEGER,
    "status" "VisitStatus" NOT NULL,
    "total_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "debt_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_referrals" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER,
    "referral_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "visit_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_rooms" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER,
    "room_id" INTEGER,
    "status" "VisitRoomStatus" NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "visit_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_services" (
    "id" SERIAL NOT NULL,
    "visit_id" INTEGER,
    "service_id" INTEGER,
    "price" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "total" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "registered_by" INTEGER,
    "modified_by" INTEGER,

    CONSTRAINT "visit_services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "users_login_idx" ON "users"("login");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_roles_status_idx" ON "user_roles"("status");

-- CreateIndex
CREATE INDEX "user_roles_name_idx" ON "user_roles"("name");

-- CreateIndex
CREATE INDEX "clients_group_id_idx" ON "clients"("group_id");

-- CreateIndex
CREATE INDEX "clients_region_id_idx" ON "clients"("region_id");

-- CreateIndex
CREATE INDEX "clients_district_id_idx" ON "clients"("district_id");

-- CreateIndex
CREATE INDEX "clients_source_id_idx" ON "clients"("source_id");

-- CreateIndex
CREATE INDEX "clients_status_idx" ON "clients"("status");

-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_created_at_idx" ON "clients"("created_at");

-- CreateIndex
CREATE INDEX "clients_deleted_at_idx" ON "clients"("deleted_at");

-- CreateIndex
CREATE INDEX "clients_status_deleted_at_idx" ON "clients"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "clients_phone_status_idx" ON "clients"("phone", "status");

-- CreateIndex
CREATE INDEX "client_groups_status_idx" ON "client_groups"("status");

-- CreateIndex
CREATE INDEX "client_groups_name_idx" ON "client_groups"("name");

-- CreateIndex
CREATE INDEX "client_groups_deleted_at_idx" ON "client_groups"("deleted_at");

-- CreateIndex
CREATE INDEX "client_paid_client_id_idx" ON "client_paid"("client_id");

-- CreateIndex
CREATE INDEX "client_paid_visit_id_idx" ON "client_paid"("visit_id");

-- CreateIndex
CREATE INDEX "client_paid_payment_date_idx" ON "client_paid"("payment_date");

-- CreateIndex
CREATE INDEX "client_paid_deleted_at_idx" ON "client_paid"("deleted_at");

-- CreateIndex
CREATE INDEX "client_paid_client_id_payment_date_idx" ON "client_paid"("client_id", "payment_date");

-- CreateIndex
CREATE INDEX "client_paid_visit_id_payment_date_idx" ON "client_paid"("visit_id", "payment_date");

-- CreateIndex
CREATE INDEX "departments_status_idx" ON "departments"("status");

-- CreateIndex
CREATE INDEX "departments_name_idx" ON "departments"("name");

-- CreateIndex
CREATE INDEX "departments_deleted_at_idx" ON "departments"("deleted_at");

-- CreateIndex
CREATE INDEX "loc_regions_status_idx" ON "loc_regions"("status");

-- CreateIndex
CREATE INDEX "loc_regions_name_idx" ON "loc_regions"("name");

-- CreateIndex
CREATE INDEX "loc_regions_deleted_at_idx" ON "loc_regions"("deleted_at");

-- CreateIndex
CREATE INDEX "loc_districts_region_id_idx" ON "loc_districts"("region_id");

-- CreateIndex
CREATE INDEX "loc_districts_status_idx" ON "loc_districts"("status");

-- CreateIndex
CREATE INDEX "loc_districts_name_idx" ON "loc_districts"("name");

-- CreateIndex
CREATE INDEX "loc_districts_deleted_at_idx" ON "loc_districts"("deleted_at");

-- CreateIndex
CREATE INDEX "loc_districts_region_id_status_idx" ON "loc_districts"("region_id", "status");

-- CreateIndex
CREATE INDEX "other_paid_group_id_idx" ON "other_paid"("group_id");

-- CreateIndex
CREATE INDEX "other_paid_type_idx" ON "other_paid"("type");

-- CreateIndex
CREATE INDEX "other_paid_payment_date_idx" ON "other_paid"("payment_date");

-- CreateIndex
CREATE INDEX "other_paid_deleted_at_idx" ON "other_paid"("deleted_at");

-- CreateIndex
CREATE INDEX "other_paid_type_payment_date_idx" ON "other_paid"("type", "payment_date");

-- CreateIndex
CREATE INDEX "other_paid_groups_status_idx" ON "other_paid_groups"("status");

-- CreateIndex
CREATE INDEX "other_paid_groups_name_idx" ON "other_paid_groups"("name");

-- CreateIndex
CREATE INDEX "other_paid_groups_deleted_at_idx" ON "other_paid_groups"("deleted_at");

-- CreateIndex
CREATE INDEX "payments_client_id_idx" ON "payments"("client_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_visit_id_idx" ON "payments"("visit_id");

-- CreateIndex
CREATE INDEX "payments_payment_type_idx" ON "payments"("payment_type");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "payments_deleted_at_idx" ON "payments"("deleted_at");

-- CreateIndex
CREATE INDEX "payments_client_id_payment_date_idx" ON "payments"("client_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_payment_type_payment_date_idx" ON "payments"("payment_type", "payment_date");

-- CreateIndex
CREATE INDEX "payments_payment_date_deleted_at_idx" ON "payments"("payment_date", "deleted_at");

-- CreateIndex
CREATE INDEX "referrals_status_idx" ON "referrals"("status");

-- CreateIndex
CREATE INDEX "referrals_phone_idx" ON "referrals"("phone");

-- CreateIndex
CREATE INDEX "referrals_deleted_at_idx" ON "referrals"("deleted_at");

-- CreateIndex
CREATE INDEX "rooms_department_id_idx" ON "rooms"("department_id");

-- CreateIndex
CREATE INDEX "rooms_status_idx" ON "rooms"("status");

-- CreateIndex
CREATE INDEX "rooms_record_status_idx" ON "rooms"("record_status");

-- CreateIndex
CREATE INDEX "rooms_deleted_at_idx" ON "rooms"("deleted_at");

-- CreateIndex
CREATE INDEX "rooms_department_id_status_idx" ON "rooms"("department_id", "status");

-- CreateIndex
CREATE INDEX "services_department_id_idx" ON "services"("department_id");

-- CreateIndex
CREATE INDEX "services_status_idx" ON "services"("status");

-- CreateIndex
CREATE INDEX "services_deleted_at_idx" ON "services"("deleted_at");

-- CreateIndex
CREATE INDEX "services_department_id_status_idx" ON "services"("department_id", "status");

-- CreateIndex
CREATE INDEX "service_users_service_id_idx" ON "service_users"("service_id");

-- CreateIndex
CREATE INDEX "service_users_user_id_idx" ON "service_users"("user_id");

-- CreateIndex
CREATE INDEX "service_users_status_idx" ON "service_users"("status");

-- CreateIndex
CREATE INDEX "service_users_deleted_at_idx" ON "service_users"("deleted_at");

-- CreateIndex
CREATE INDEX "service_users_service_id_user_id_idx" ON "service_users"("service_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_users_service_id_user_id_key" ON "service_users"("service_id", "user_id");

-- CreateIndex
CREATE INDEX "sources_status_idx" ON "sources"("status");

-- CreateIndex
CREATE INDEX "sources_name_idx" ON "sources"("name");

-- CreateIndex
CREATE INDEX "sources_deleted_at_idx" ON "sources"("deleted_at");

-- CreateIndex
CREATE INDEX "visits_client_id_idx" ON "visits"("client_id");

-- CreateIndex
CREATE INDEX "visits_doctor_id_idx" ON "visits"("doctor_id");

-- CreateIndex
CREATE INDEX "visits_status_idx" ON "visits"("status");

-- CreateIndex
CREATE INDEX "visits_visit_date_idx" ON "visits"("visit_date");

-- CreateIndex
CREATE INDEX "visits_deleted_at_idx" ON "visits"("deleted_at");

-- CreateIndex
CREATE INDEX "visits_client_id_visit_date_idx" ON "visits"("client_id", "visit_date");

-- CreateIndex
CREATE INDEX "visits_doctor_id_visit_date_idx" ON "visits"("doctor_id", "visit_date");

-- CreateIndex
CREATE INDEX "visits_status_visit_date_idx" ON "visits"("status", "visit_date");

-- CreateIndex
CREATE INDEX "visits_visit_date_deleted_at_idx" ON "visits"("visit_date", "deleted_at");

-- CreateIndex
CREATE INDEX "visit_referrals_visit_id_idx" ON "visit_referrals"("visit_id");

-- CreateIndex
CREATE INDEX "visit_referrals_referral_id_idx" ON "visit_referrals"("referral_id");

-- CreateIndex
CREATE INDEX "visit_referrals_deleted_at_idx" ON "visit_referrals"("deleted_at");

-- CreateIndex
CREATE INDEX "visit_referrals_registered_by_idx" ON "visit_referrals"("registered_by");

-- CreateIndex
CREATE INDEX "visit_referrals_modified_by_idx" ON "visit_referrals"("modified_by");

-- CreateIndex
CREATE UNIQUE INDEX "visit_referrals_visit_id_referral_id_key" ON "visit_referrals"("visit_id", "referral_id");

-- CreateIndex
CREATE INDEX "visit_rooms_visit_id_idx" ON "visit_rooms"("visit_id");

-- CreateIndex
CREATE INDEX "visit_rooms_room_id_idx" ON "visit_rooms"("room_id");

-- CreateIndex
CREATE INDEX "visit_rooms_status_idx" ON "visit_rooms"("status");

-- CreateIndex
CREATE INDEX "visit_rooms_deleted_at_idx" ON "visit_rooms"("deleted_at");

-- CreateIndex
CREATE INDEX "visit_rooms_visit_id_status_idx" ON "visit_rooms"("visit_id", "status");

-- CreateIndex
CREATE INDEX "visit_rooms_registered_by_idx" ON "visit_rooms"("registered_by");

-- CreateIndex
CREATE INDEX "visit_rooms_modified_by_idx" ON "visit_rooms"("modified_by");

-- CreateIndex
CREATE INDEX "visit_services_visit_id_idx" ON "visit_services"("visit_id");

-- CreateIndex
CREATE INDEX "visit_services_service_id_idx" ON "visit_services"("service_id");

-- CreateIndex
CREATE INDEX "visit_services_deleted_at_idx" ON "visit_services"("deleted_at");

-- CreateIndex
CREATE INDEX "visit_services_visit_id_service_id_idx" ON "visit_services"("visit_id", "service_id");

-- CreateIndex
CREATE INDEX "visit_services_registered_by_idx" ON "visit_services"("registered_by");

-- CreateIndex
CREATE INDEX "visit_services_modified_by_idx" ON "visit_services"("modified_by");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "user_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "client_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "loc_districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "loc_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_groups" ADD CONSTRAINT "client_groups_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_groups" ADD CONSTRAINT "client_groups_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_paid" ADD CONSTRAINT "client_paid_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_paid" ADD CONSTRAINT "client_paid_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_paid" ADD CONSTRAINT "client_paid_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_paid" ADD CONSTRAINT "client_paid_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loc_regions" ADD CONSTRAINT "loc_regions_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loc_regions" ADD CONSTRAINT "loc_regions_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loc_districts" ADD CONSTRAINT "loc_districts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "loc_regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loc_districts" ADD CONSTRAINT "loc_districts_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loc_districts" ADD CONSTRAINT "loc_districts_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_paid" ADD CONSTRAINT "other_paid_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "other_paid_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_paid" ADD CONSTRAINT "other_paid_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_paid" ADD CONSTRAINT "other_paid_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_paid_groups" ADD CONSTRAINT "other_paid_groups_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_paid_groups" ADD CONSTRAINT "other_paid_groups_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_users" ADD CONSTRAINT "service_users_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_users" ADD CONSTRAINT "service_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_users" ADD CONSTRAINT "service_users_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_users" ADD CONSTRAINT "service_users_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_referrals" ADD CONSTRAINT "visit_referrals_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_referrals" ADD CONSTRAINT "visit_referrals_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_referrals" ADD CONSTRAINT "visit_referrals_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_referrals" ADD CONSTRAINT "visit_referrals_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_rooms" ADD CONSTRAINT "visit_rooms_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_rooms" ADD CONSTRAINT "visit_rooms_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_rooms" ADD CONSTRAINT "visit_rooms_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_rooms" ADD CONSTRAINT "visit_rooms_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_services" ADD CONSTRAINT "visit_services_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
