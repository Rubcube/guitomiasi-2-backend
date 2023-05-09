-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'INACTIVE');

-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "complement" DROP NOT NULL,
ALTER COLUMN "owner_id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Transfer" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "user_status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "UserInfo" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "birthday" DROP NOT NULL;
