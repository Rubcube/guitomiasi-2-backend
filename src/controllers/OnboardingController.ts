import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { hash } from "bcrypt";
import { Onboarding } from "dtos/OnboardingDTO";
import { NextFunction, Request, Response } from "express";
import {
  INTERNAL_ERROR,
  RPrismaError,
  RubError,
} from "handlers/errors/RubError";
import { JsonWebTokenError } from "jsonwebtoken";
import * as UserModel from "models/UserModel";
import { sendVerificationMail } from "services/mail";

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

    const responseJson = {
      user_id: newUser.id,
      accounts_id: newUser.accounts.map(account => account.id),
    };

    sendVerificationMail(user.email);

    return res.status(201).json(responseJson);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      return next(new RPrismaError(e));
    } else if (e instanceof JsonWebTokenError) {
      return next(
        new RubError(500, "Falha na autenticação", "JWT-SIGNING-FAILED"),
      );
    }

    return next(INTERNAL_ERROR);
  }
}
