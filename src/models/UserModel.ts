import { UserOnboarding } from "dtos/UsersDTO";
import bcrypt from "bcrypt";
import { PrismaTransactionalClient } from "types/index";
import { PrismaClient } from "@prisma/client";

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

export async function getUserAuthInfo(document: string) {
  const userUUID = await prisma.userInfo.findUnique({
    where: { document },
    select: { id: true },
  });

  if (userUUID === null) return null;

  return await prisma.userAuth.findUnique({
    where: { id: userUUID.id },
  });
}
