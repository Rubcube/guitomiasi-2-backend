import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import * as AccountModel from "models/AccountModel";

/**
 * Valida que o usuário que fez a requisição (`id` é recuperado a partir do JWT)
 * é dono da conta referenciada pelo parâmetro `accountId`. Esse *middleware* é
 * para validar ou não o uso de rotas associadas à conta.
 */
export async function validateAccountOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userID: string = res.locals.parsedJWTToken.id;
  const accountID: string = req.params.accountId;

  const account = await AccountModel.getAccount(accountID, true);

  if (account === null) {
    return next(new RubError(404, "Account don't exist", "ACCOUNT-NOT-FOUND"));
  }

  if (account.user.id !== userID) {
    return next(
      new RubError(
        403,
        "User does not have account ownership",
        "ACCOUNT-NO-OWNERSHIP",
      ),
    );
  }

  if (account.account_status !== "ACTIVE") {
    return next(
      new RubError(403, "This account is not active", "ACCOUNT-NOT-ACTIVE"),
    );
  }

  res.locals.account = account;
  next();
}
