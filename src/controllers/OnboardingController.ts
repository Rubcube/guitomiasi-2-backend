import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hash } from "bcrypt";
import { Onboarding } from "dtos/OnboardingDTO";
import { NextFunction, Request, Response } from "express";
import { RInternalError, RubError } from "handlers/errors/RubError";
import { sign } from "jsonwebtoken";
import * as UserModel from "models/UserModel";

/**
 * Realiza o *onboarding* de um usuário com base nas suas informações pessoais,
 * de endereço e de senha (transacional e de usuário).
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { user, address, account }: Onboarding = res.locals.parsedBody;
    const { password, ...userInfo } = user;

    const bcrypt_user_password = await hash(password, 10);
    const bcrypt_transaction_password = await hash(
      account.transaction_password,
      10,
    );

    const newUser = await UserModel.create(
      bcrypt_user_password,
      userInfo,
      address,
      bcrypt_transaction_password,
    );

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
    let err = e as Error;

    if ("clientVersion" in err) {
      const prismaErr = err as PrismaClientKnownRequestError;
      if (prismaErr.code === "P2002") {
        return next(
          new RubError(
            422,
            "New user violates unique key constraint",
            "ONBOARDING-VIOLATION-UNIQUE-CONSTRAINT",
          ),
        );
      }
    }

    return next(new RInternalError());
  }
}
