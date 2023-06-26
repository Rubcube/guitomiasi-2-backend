import { Account, Address, Prisma, UserInfo, UserStatus } from "@prisma/client";
import { AddressOnboarding } from "dtos/AddressDTO";
import { UserOnboarding, UserPatch } from "dtos/UsersDTO";
import { RubError } from "handlers/errors/RubError";
import { prisma } from "prisma";
import { Omitter } from "utils/index";
import { ACCOUNT_DEFAULT_OPTIONS } from "./AccountModel";

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

export async function verifyUserEmail(email: string) {
  const userId = (
    await prisma.userInfo.findUnique({
      where: { email },
      select: { id: true },
    })
  )?.id;

  if (!userId) {
    throw new RubError(
      404,
      "Impossível verificar email: nenhum usuário associado a esse endereço de email",
      "EMAIL-NOT-FOUND",
    );
  }

  return await prisma.userAuth.update({
    where: { id: userId },
    data: { user_status: UserStatus.ACTIVE },
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

/**
 * Retorna informações de autenticação do usuário
 * @param whereUnique Atributos **unique** usados como busca
 * @returns Objeto com informações de autenticação do usuário
 */
export async function getAuth(whereUnique: Prisma.UserInfoWhereUniqueInput) {
  const user = await prisma.userInfo.findUnique({
    where: whereUnique,
    select: { id: true },
  });

  if (user === null) return null;

  return await prisma.userAuth.findUnique({
    where: { id: user.id },
    include: { user_info: true, accounts: true, address: true },
  });
}

/**
 * Atualiza o hash da senha de usuário para um determinado usuário
 * @param whereUnique Atributos **unique** usados como busca
 * @param newPasswordHash Novo hash de senha de usuário
 * @returns Objeto contendo novas informações de autenticação do usuário
 */
export async function updateUserPassword(
  whereUnique: Prisma.UserInfoWhereUniqueInput,
  newPasswordHash: string,
) {
  return await prisma.userAuth.update({
    where: whereUnique,
    data: { bcrypt_user_password: newPasswordHash },
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

  const userInfo = Omitter(userInfoRaw, ["created_at", "updated_at"]);

  const accountsMapped = userAccounts.map(account => ({
    id: account.id,
    number: account.account_number,
    agency: account.agency,
  }));
  const userAddress = Omitter(userAddressRaw, [
    "owner_id",
    "created_at",
    "updated_at",
  ]);

  return {
    user: userInfo,
    accounts: accountsMapped,
    address: userAddress,
  };
}

/**
 * Realiza o PATCH de algumas informações de usuário
 * @param id UUID do usuário que terá suas informações alteradas
 * @param newUserInfo Novas informações de usuário
 * @returns Novo objeto de usuário
 */
export async function patchUserInfo(id: string, newUserInfo?: UserPatch) {
  return await prisma.userInfo.update({
    where: { id },
    data: { ...newUserInfo },
  });
}

/**
 * Realiza o PATCH de algumas informações de endereço de um usuário
 * @param owner_id UUID do usuário que terá seu endereço alterado
 * @param newAddressInfo Novas informações de endereço
 * @returns Novo objeto de endereço
 */
export async function patchUserAddress(
  owner_id: string,
  newAddressInfo?: AddressOnboarding,
) {
  return await prisma.address.update({
    where: { owner_id },
    data: { ...newAddressInfo },
  });
}

/**
 * Verifica se um determinado email está disponível para cadastro
 * @param email Email a ser verificado
 * @returns `true` se o email estiver disponível, `false` caso contrário
 */
export async function isEmailAvailable(email: string) {
  const user = await prisma.userInfo.findUnique({
    where: { email },
  });

  return user === null;
}

/**
 * Verifica se um determinado documento está disponível para cadastro
 * @param document Documento a ser verificado
 * @returns `true` se o documento estiver disponível, `false` caso contrário
 */
export async function isDocumentAvailable(document: string) {
  const user = await prisma.userInfo.findUnique({
    where: { document },
  });

  return user === null;
}

/**
 * Verifica se um determinado telefone está disponível para cadastro
 * @param phone Telefone a ser verificado
 * @returns `true` se o telefone estiver disponível, `false` caso contrário
 */
export async function isPhoneAvailable(phone: string) {
  const user = await prisma.userInfo.findUnique({
    where: { phone },
  });

  return user === null;
}
