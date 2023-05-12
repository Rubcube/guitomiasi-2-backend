import { AccountOnboarding } from "dtos/AccountDTO";
import { PrismaTransactionalClient } from "types/index";
import { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ACCOUNT_DEFAULT_OPTIONS = {
  agency: 1,
  balance: 100,
};

export async function getAccountAndUser(accountID: string) {
  return await prisma.account.findUnique({
    where: { id: accountID },
    include: { user: true },
  });
}

export async function onboardUserAccount(
  account: AccountOnboarding,
  owner_id: string,
  prisma: PrismaTransactionalClient,
) {
  const { transaction_password } = account;
  const bcrypt_transaction_password = await hash(transaction_password, 10);

  await prisma.account.create({
    data: {
      owner_id,
      bcrypt_transaction_password,
      ...ACCOUNT_DEFAULT_OPTIONS,
    },
  });
}
