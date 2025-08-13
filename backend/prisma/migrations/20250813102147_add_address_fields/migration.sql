/*
  Warnings:

  - Added the required column `city` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pincode` to the `Registration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Registration" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "pincode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
