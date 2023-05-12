import { UserOnboarding } from "dtos/UsersDTO";
import bcrypt from "bcrypt";
import { PrismaTransactionalClient } from "types/index";
import { PrismaClient, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function onboardUserInfo(
  user: UserOnboarding,
  prisma: PrismaTransactionalClient,
) {
  const { password, ...userInfo } = user;
  const bcryptUserPassword = await bcrypt.hash(password, 10);

  const newUserUUID = (
    await prisma.userAuth.create({
      data: { bcrypt_user_password: bcryptUserPassword },
    })
  ).id;

  await prisma.userInfo.create({ data: { id: newUserUUID, ...userInfo } });

  return newUserUUID;
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
