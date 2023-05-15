import { UserOnboarding } from "dtos/UsersDTO";
import { PrismaClient } from "@prisma/client";
import { AddressOnboarding } from "dtos/AddressDTO";
import { ACCOUNT_DEFAULT_OPTIONS } from "./AccountModel";

const prisma = new PrismaClient();

export async function onboardUserInfo(
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

export async function getUserAuthInfo(document: string) {
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
