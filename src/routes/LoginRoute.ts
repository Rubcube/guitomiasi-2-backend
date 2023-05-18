import * as LoginController from "controllers/LoginController";
import { UserLoginSchema } from "dtos/UsersDTO";
import { Router } from "express";
import { validateSchema } from "middlewares/validateSchema";

const LoginRoute = Router();
LoginRoute.post(
  "/",
  validateSchema(UserLoginSchema),
  LoginController.loginUser,
);

export default LoginRoute;
