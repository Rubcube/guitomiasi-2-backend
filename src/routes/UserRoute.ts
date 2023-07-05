import * as UserController from "controllers/UserController";
import { PatchSchema } from "dtos";
import {
  UserForgotPasswordSchema,
  UserNewPasswordSchema,
  UserPasswordPatchSchema,
} from "dtos/UsersDTO";
import { Router } from "express";
import { authentication } from "middlewares/auth";
import { validateSchema } from "middlewares/validateSchema";

/**
 * Rotas que precisam de validação da autenticação.
 */
const ValidatedRoute = Router();
ValidatedRoute.get("/", UserController.getInfo);
ValidatedRoute.patch(
  "/",
  validateSchema(PatchSchema),
  UserController.patchInfo,
);
ValidatedRoute.patch(
  "/password/reset",
  validateSchema(UserPasswordPatchSchema),
  UserController.patchUserPassword,
);

const UserRoute = Router();
UserRoute.get("/verify/:jwt", UserController.verifyUserEmail);
UserRoute.post(
  "/forgot",
  validateSchema(UserForgotPasswordSchema),
  UserController.forgotPassword,
);

UserRoute.post(
  "/password/new",
  validateSchema(UserNewPasswordSchema),
  UserController.resetPassword,
);
UserRoute.use("/", authentication, ValidatedRoute);

export default UserRoute;
