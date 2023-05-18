import { NextFunction, Request, Response } from "express";
import { RubError } from "handlers/errors/RubError";
import * as AccountModel from "models/AccountModel";

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

  res.locals.account = account;
  next();
}
