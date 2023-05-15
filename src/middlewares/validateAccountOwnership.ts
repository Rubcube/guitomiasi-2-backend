import { Request, Response, NextFunction } from "express";
import { getAccountAndUser } from "models/AccountModel";

export async function validateAccountOwnership(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userID: string = res.locals.parsedJWTToken.id;
  const accountID: string = req.params.id;

  const account = await getAccountAndUser(accountID);

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

  next();
}
