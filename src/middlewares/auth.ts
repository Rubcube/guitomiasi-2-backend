import { UserStatus } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import { getUserStatus } from "models/UserModel";
import { parseJWT } from "services/jwt";

/**
 * *Middleware* de autenticação. Verifica se um JWT é disponibilizado pelo usuário.
 *
 * Se não houver JWT presente ou o mesmo for inválido, interrompe a requisição.
 */
export async function authentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fetchedToken = req.headers["authorization"];

  if (!fetchedToken) {
    return next(new RubError(401, "Falha na autenticação", "AUTH-NO-TOKEN"));
  }

  try {
    const parsedToken = parseJWT<{ id: string }>(fetchedToken);

    // Check for user status
    const userCurrentStatus = await getUserStatus(parsedToken.id);

    if (userCurrentStatus === UserStatus.ACTIVE) {
      res.locals.parsedJWTToken = parsedToken;
      next();
    } else {
      throw new RubError(
        403,
        "Conta de Usuário não está ativa atualmente",
        "AUTH-USER-NOT-ACTIVE",
      );
    }
  } catch (e) {
    return next(e);
  }
}
