import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Onboarding } from "dtos/OnboardingDTO";
import { onboardUserInfo } from "models/UserModel";
import { onboardUserAddress } from "models/AddressModel";
import { onboardUserAccount } from "models/AccountModel";

const prisma = new PrismaClient();

export async function onboardUser(req: Request, res: Response) {
  const { user, address, account }: Onboarding = res.locals.parsedBody;

  try {
    const newUserUUID = await prisma.$transaction(async (prisma) => {
      const newUserUUID = await onboardUserInfo(user, prisma);
      await onboardUserAddress(address, newUserUUID, prisma);
      await onboardUserAccount(account, newUserUUID, prisma);
      return newUserUUID;
    })

    return res.status(201).json({
      newUserUUID
    });
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
}