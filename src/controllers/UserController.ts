import { Request, Response } from "express";
import { UserIn, UserOut } from "dtos/UsersDTO";
import UserModel from "models/UserModel";

const userModel = new UserModel();

export default class UserController {
  create = async (req: Request, res: Response) => {
    try {
      const user: UserIn = req.body;
      const newUser: UserOut = await userModel.create(user);
      res.status(201).json(newUser);
    } catch (e) {
      console.log("Failed to create user", e);
      res.status(500).send({
        error: "USR-01",
        message: "Failed to create user",
      });
    }
  };

  get = async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const newUser: UserOut | null = await userModel.get(id);

      if (newUser) {
        res.status(200).json(newUser);
      } else {
        res.status(404).json({
          error: "USR-06",
          message: "User not found.",
        });
      }
    } catch (e) {
      console.log("Failed to get user", e);
      res.status(500).send({
        error: "USR-02",
        message: "Failed to get user",
      });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const users: UserOut[] | null = await userModel.getAll();
      res.status(200).json(users);
    } catch (e) {
      console.log("Failed to get all users", e);
      res.status(500).send({
        error: "USR-03",
        message: "Failed to get all users",
      });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const updateUser: UserIn = req.body;
      const userUpdated: UserOut | null = await userModel.update(
        id,
        updateUser
      );

      if (userUpdated) {
        res.status(200).json(userUpdated);
      } else {
        res.status(404).json({
          error: "USR-06",
          message: "User not found.",
        });
      }
    } catch (e) {
      console.log("Failed to update user", e);
      res.status(500).send({
        error: "USR-04",
        message: "Failed to update user",
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id: number = parseInt(req.params.id);
      const userDeleted = await userModel.delete(id);
      res.status(204).json(userDeleted);
    } catch (e) {
      console.log("Failed to delete user", e);
      res.status(500).send({
        error: "USR-05",
        message: "Failed to delete user",
      });
    }
  };
}
