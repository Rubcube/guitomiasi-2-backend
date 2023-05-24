import { UserStatus } from "@prisma/client";
import { compare } from "bcrypt";
import { UserLogin } from "dtos/UsersDTO";
import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import { sign } from "jsonwebtoken";
import * as UserModel from "models/UserModel";

/**
 * Rota utilizada para realizar o login de um USUÁRIO.
 *
 * Em caso de sucesso, retorna um JWT.
 */
export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { document, password }: UserLogin = res.locals.parsedBody;

  const fetchedUser = await UserModel.getAuth({ document });

  if (fetchedUser === null) {
    return next(
      new RubError(
        404,
        "User is not present in the database",
        "LOGIN-USER-NOT-FOUND",
      ),
    );
  }

  if (fetchedUser.user_status !== UserStatus.ACTIVE) {
    return next(
      new RubError(
        403,
        "User is not currently active",
        "LOGIN-USER-NOT-ACTIVE",
      ),
    );
  }

  const passwordIsCorrect = await compare(
    password,
    fetchedUser.bcrypt_user_password,
  );

  if (passwordIsCorrect) {
    const jwtToken = sign(
      { id: fetchedUser.id },
      process.env.SECRET_JWT as string,
      { expiresIn: parseInt(process.env.JWT_EXPIRATION_TIME || "60") },
    );

    const responseJson = {
      token: jwtToken,
      user_id: fetchedUser.id,
      accounts_id: fetchedUser.accounts.map(account => account.id),
    };

    return res.status(200).json(responseJson);
  } else {
    return next(
      new RubError(403, "Authentication failed", "LOGIN-AUTHENTICATION-FAILED"),
    );
  }
}
