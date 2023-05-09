import { Request, Response } from "express";
import { UserOnboardingSchema } from "dtos/UsersDTO";
import { AddressOnboardingSchema } from "dtos/AddressDTO";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { ZodError } from "zod";
import { AccountOnboardingSchema } from "dtos/AccountDTO";

const prisma = new PrismaClient();

export async function onboardUser(req: Request, res: Response) {
  const reqBody: { user: any, address: any, account: any } = req.body;

  const userParse = UserOnboardingSchema.safeParse(reqBody.user);
  const addressParse = AddressOnboardingSchema.safeParse(reqBody.address);
  const accountParse = AccountOnboardingSchema.safeParse(reqBody.account);

  const parseSuccessfull = userParse.success && addressParse.success && accountParse.success;

  if (!parseSuccessfull) {
    const errors: ZodError[] = [];
    if (!userParse.success) errors.push(userParse.error);
    if (!addressParse.success) errors.push(addressParse.error);
    if (!accountParse.success) errors.push(accountParse.error);

    res.status(422).json({
      reason: "Failed to validate schema",
      errors
    }).end();
    return;
  }

  const { password, ...userInfo } = userParse.data;
  const addressInfo = addressParse.data;
  const { transaction_password } = accountParse.data;

  try {
    const newUserUUID = await prisma.$transaction(async (prisma) => {
      const bcryptUserPassword = await bcrypt.hash(password, 10);
      const bcryptTransactionPassword = await bcrypt.hash(transaction_password, 10);

      // 1. Generate user in "userAuth" table
      const newUserUUID = (await prisma.userAuth.create({
        data: { bcrypt_user_password: bcryptUserPassword }
      })).id;

      // 2. Generate user info in "userInfo" table
      const newUserInfo = await prisma.userInfo.create({
        data: {
          id: newUserUUID,
          ...userInfo
        }
      })

      // 3. Generate address info in "address" table
      const newAddress = await prisma.address.create({
        data: {
          owner_id: newUserUUID,
          ...addressInfo
        }
      })

      // 4. Generate account info in "account" table
      const newAccount = await prisma.account.create({
        data: {
          owner_id: newUserUUID,
          agency: 1,
          balance: 100,
          bcrypt_transaction_password: bcryptTransactionPassword
        }
      })

      return newUserUUID;
    })

    res.status(201).json({
      newUserUUID
    }).end();
  } catch (error) {
    console.log(error);
    res.status(400).end();
  }
}