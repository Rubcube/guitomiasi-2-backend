import { Request, Response } from "express";
import { UserLogin } from "dtos/UsersDTO";
import { compare } from "bcrypt";
import * as UserModel from "models/UserModel";
import { sign } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";

/**
 * Rota utilizada para realizar o login de um USUÁRIO.
 *
 * Em caso de sucesso, retorna um JWT.
 */
export async function loginUser(req: Request, res: Response) {
  const { document, password }: UserLogin = res.locals.parsedBody;

  try {
    const fetchedUser = await UserModel.getAuth(document);

    if (fetchedUser === null) {
      return res.status(404).json({
        error: "LOGIN-USER-NOT-FOUND",
        message: "User is not present in the database",
      });
    }

    if (fetchedUser.user_status !== UserStatus.ACTIVE) {
      return res.status(403).json({
        error: "LOGIN-USER-NOT-ACTIVE",
        message: "User is not currently active",
        user_status: fetchedUser.user_status,
      });
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
      return res.status(403).json({
        error: "LOGIN-AUTHENTICATION-FAILED",
        message: "Authentication failed",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An internal error occurred",
    });
  }
}
