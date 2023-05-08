import { Request, Response } from "express";
import { UserOnboarding } from "dtos/UsersDTO";
import UserModel from "models/UserModel";
 
const userModel = new UserModel();

export default class UserController {
  create = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const userOnboardingBody : UserOnboarding = req.body;
      const newUser = await userModel.create(userOnboardingBody);
      res.status(201).json(newUser);
    } catch (e) {
      console.log("Failed to onboard user.", e);
      res.status(500).send({
        error: "USR-01",
        message: "Failed to create user",
      })
    }
  }
}
