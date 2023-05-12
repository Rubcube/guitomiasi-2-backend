import { AccountOnboarding } from "dtos/AccountDTO";
import { PrismaTransactionalClient } from "types/index";
import { hash } from "bcrypt";

export const ACCOUNT_DEFAULT_OPTIONS = {
  agency: 1,
  balance: 100,
};

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
