import { Request, Response } from "express";
import { AccountOnboarding } from "dtos/AccountDTO";
import AccountModel from "models/AccountModel";
 
const accountModel = new AccountModel();

export default class AccountController {
  create = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const accountOnboardingBody : AccountOnboarding = req.body;
      const newAccount  = await accountModel.create(accountOnboardingBody);
      res.status(201).json(newAccount);
    } catch (e) {
      console.log("Failed to onboard account.", e);
      res.status(500).send({
        error: "ACC-01",
        message: "Failed to create account",
      })
    }
  }
}
