import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Onboarding } from "dtos/OnboardingDTO";
import { ACCOUNT_DEFAULT_OPTIONS } from "models/AccountModel";
import { hash } from "bcrypt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient();

export async function onboardUser(req: Request, res: Response) {
  const { user, address, account }: Onboarding = res.locals.parsedBody;
  const { password, ...userInfo } = user;

  const bcrypt_user_password = await hash(password, 10);
  const bcrypt_transaction_password = await hash(
    account.transaction_password,
    10,
  );

  try {
    const newUser = await prisma.userAuth.create({
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

    const jwtToken = sign(
      { id: newUser.id },
      process.env.SECRET_JWT as string,
      { expiresIn: parseInt(process.env.JWT_EXPIRATION_TIME || "60") },
    );

    const responseJson = {
      token: jwtToken,
      user_id: newUser.id,
      accounts_id: newUser.accounts.map(account => account.id),
    };

    return res.status(201).json(responseJson);
  } catch (e) {
    const err = e as Error;
    if ("clientVersion" in err) {
      const prismaErr = err as PrismaClientKnownRequestError;
      if (prismaErr.code === "P2002") {
        return res.status(422).json({
          error: "OBD-001",
          message: "New user violates unique key constraint",
          field: prismaErr.meta,
        });
      }
    }
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An internal error occurred",
    });
  }
}
