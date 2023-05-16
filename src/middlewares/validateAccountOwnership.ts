import { Request, Response, NextFunction } from "express";
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
    return res.status(404).json({
      error: "ACCOUNT-NOT-FOUND",
      message: "Account don't exist",
    });
  }

  if (account.user.id !== userID) {
    return res.status(403).json({
      error: "ACCOUNT-NO-OWNERSHIP",
      message: "User does not have account ownership",
    });
  }

  res.locals.account = account;
  next();
}
