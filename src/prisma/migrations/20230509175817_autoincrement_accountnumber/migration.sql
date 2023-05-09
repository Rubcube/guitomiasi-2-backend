-- AlterTable
CREATE SEQUENCE account_account_number_seq;
ALTER TABLE "Account" ALTER COLUMN "account_number" SET DEFAULT nextval('account_account_number_seq');
ALTER SEQUENCE account_account_number_seq OWNED BY "Account"."account_number";
