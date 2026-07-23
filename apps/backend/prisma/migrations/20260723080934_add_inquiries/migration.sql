-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('telegram', 'whatsapp', 'email', 'phone');

-- CreateTable
CREATE TABLE "inquiries" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contact_method" "ContactMethod" NOT NULL,
    "contact" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);
