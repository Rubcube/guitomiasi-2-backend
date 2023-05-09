/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `account_branch` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhood` on the `Address` table. All the data in the column will be lost.
  - You are about to alter the column `cep` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(8)`.
  - You are about to alter the column `street` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(120)`.
  - You are about to alter the column `complement` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(300)`.
  - You are about to alter the column `city` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `state` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(2)`.
  - You are about to drop the `Transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transfers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[account_number]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agency` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bcrypt_transaction_password` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `account_number` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `balance` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `updated_at` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `neighbourhood` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `number` on the `Address` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `updated_at` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('SCHEDULED', 'DONE', 'CANCELED');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transfers" DROP CONSTRAINT "Transfers_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Transfers" DROP CONSTRAINT "Transfers_toId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_addressId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
DROP COLUMN "account_branch",
DROP COLUMN "status",
DROP COLUMN "userId",
ADD COLUMN     "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "agency" INTEGER NOT NULL,
ADD COLUMN     "bcrypt_transaction_password" CHAR(60) NOT NULL,
ADD COLUMN     "owner_id" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "account_number",
ADD COLUMN     "account_number" INTEGER NOT NULL,
DROP COLUMN "balance",
ADD COLUMN     "balance" MONEY NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
DROP COLUMN "id",
DROP COLUMN "neighborhood",
ADD COLUMN     "neighbourhood" VARCHAR(100) NOT NULL,
ADD COLUMN     "owner_id" UUID NOT NULL,
ALTER COLUMN "cep" SET DATA TYPE CHAR(8),
ALTER COLUMN "street" SET DATA TYPE VARCHAR(120),
DROP COLUMN "number",
ADD COLUMN     "number" INTEGER NOT NULL,
ALTER COLUMN "complement" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "state" SET DATA TYPE CHAR(2),
ALTER COLUMN "updated_at" SET NOT NULL,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("owner_id");

-- DropTable
DROP TABLE "Transactions";

-- DropTable
DROP TABLE "Transfers";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "EnumStatusAccount";

-- DropEnum
DROP TYPE "StatementType";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "UserAuth" (
    "id" UUID NOT NULL,
    "bcrypt_user_password" CHAR(60) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "UserAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInfo" (
    "id" UUID NOT NULL,
    "document" VARCHAR(14) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" VARCHAR(13) NOT NULL,
    "birthday" DATE NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "UserInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" UUID NOT NULL,
    "account_id_from" UUID NOT NULL,
    "account_id_to" UUID NOT NULL,
    "value" MONEY NOT NULL,
    "time_to_transfer" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "transfer_status" "TransferStatus" NOT NULL DEFAULT 'DONE',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserInfo_document_key" ON "UserInfo"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_number_key" ON "Account"("account_number");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInfo" ADD CONSTRAINT "UserInfo_id_fkey" FOREIGN KEY ("id") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "UserAuth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_account_id_from_fkey" FOREIGN KEY ("account_id_from") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_account_id_to_fkey" FOREIGN KEY ("account_id_to") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
