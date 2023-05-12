import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getAccountAndUser } from "models/AccountModel";

const prisma = new PrismaClient();

export async function getAccountBalance(req: Request, res: Response) {
  const userID: string = res.locals.parsedJWTToken.id;
  const accountID: string = req.params.id;

  const account = await getAccountAndUser(accountID);

  if (account === null) {
    return res
      .status(404)
      .json("No account with associated ID was found in the database.");
  }

  if (account.user.id !== userID) {
    return res.status(403).send();
  }

  return res.status(200).json(account.balance);
}
