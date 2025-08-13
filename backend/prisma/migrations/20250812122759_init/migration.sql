-- CreateTable
CREATE TABLE "public"."Registration" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "aadhar" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);
