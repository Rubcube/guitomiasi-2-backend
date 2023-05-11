import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Onboarding } from "dtos/OnboardingDTO";
import { ACCOUNT_DEFAULT_OPTIONS } from "models/AccountModel";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export async function onboardUser(req: Request, res: Response) {
  const { user, address, account }: Onboarding = res.locals.parsedBody;
  const { password, ...userInfo } = user;

  const bcrypt_user_password = await hash(password, 10);
  const bcrypt_transaction_password = await hash(account.transaction_password, 10);

  const result = await prisma.userAuth.create({
    data: {
      bcrypt_user_password,
      user_info: {
        create: userInfo
      },
      address: {
        create: address
      },
      accounts: {
        create: {
          bcrypt_transaction_password,
          ...ACCOUNT_DEFAULT_OPTIONS
        }
      }
    }
  });
}
