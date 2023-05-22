import { Account, Address, PrismaClient, UserInfo } from "@prisma/client";
import { AddressOnboarding } from "dtos/AddressDTO";
import { UserOnboarding, UserPut } from "dtos/UsersDTO";
import { ACCOUNT_DEFAULT_OPTIONS } from "./AccountModel";

const prisma = new PrismaClient();

/**
 * Realiza o cadastro de informações pessoais do usuário,
 * seu endereço e conta no banco de dados.
 */
export async function create(
  bcrypt_user_password: string,
  userInfo: Omit<UserOnboarding, "password">,
  address: AddressOnboarding,
  bcrypt_transaction_password: string,
) {
  return await prisma.userAuth.create({
    data: {
      bcrypt_user_password,
      user_info: {
        create: userInfo,
      },
      address: {
        create: address,
      },
      accounts: {
        create: {
          bcrypt_transaction_password,
          ...ACCOUNT_DEFAULT_OPTIONS,
        },
      },
    },
    include: {
      accounts: true,
    },
  });
}

export async function getUserStatus(id: string) {
  const user = await prisma.userAuth.findUnique({
    where: { id },
  });

  if (user === null) {
    return null;
  }

  return user.user_status;
}

export async function getAuth(document: string) {
  const user = await prisma.userInfo.findUnique({
    where: { document },
    select: { id: true },
  });

  if (user === null) return null;

  return await prisma.userAuth.findUnique({
    where: { id: user.id },
    include: { user_info: true, accounts: true, address: true },
  });
}

/**
 * Realiza a recuperação de todas as informações de um usuário,
 * tal como suas contas e seu endereço no Banco de Dados.
 * @param id ID do usuário do qual deseja recuperar as informações.
 * @returns Informações de usuário, suas contas e seu enderçeo.
 */
export async function getUserInfo(id: string) {
  const allUserInfo = await prisma.userAuth.findUnique({
    where: { id },
    include: { user_info: true, accounts: true, address: true },
  });

  const userInfoRaw = allUserInfo!.user_info as UserInfo;
  const userAccounts = allUserInfo!.accounts as Account[];
  const userAddressRaw = allUserInfo!.address as Address;

  const { created_at: _1, updated_at: _2, ...userInfo } = userInfoRaw;
  const accountsMapped = userAccounts.map(account => ({
    id: account.id,
    number: account.account_number,
    agency: account.agency,
  }));
  const {
    owner_id: _3,
    created_at: _4,
    updated_at: _5,
    ...userAddress
  } = userAddressRaw;

  return {
    user: userInfo,
    accounts: accountsMapped,
    address: userAddress,
  };
}

export async function putUserInfo(id: string, newUserInfo: UserPut) {
  return await prisma.userInfo.update({
    where: { id },
    data: { ...newUserInfo },
  });
}
