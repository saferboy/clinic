-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" VARCHAR(200) NOT NULL,
    "tin" VARCHAR(50),
    "address" VARCHAR(500),
    "phone" VARCHAR(50),
    "email" VARCHAR(100),
    "website" VARCHAR(200),
    "work_start" VARCHAR(10),
    "work_end" VARCHAR(10),
    "logo_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);
