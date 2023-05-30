import * as UserController from "controllers/UserController";
import { PatchSchema } from "dtos";
import { UserNewPasswordSchema, UserPasswordPatchSchema } from "dtos/UsersDTO";
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
UserRoute.get("/forgot/:document", UserController.forgotPassword);

// Ao invés de utilizar um endpoint próprio, utiliza o mesmo endpoint que altera senha
// para um usuário já logado. Isso é feito para reaproveitamento de código e
// permitir a invalidação do JWT. O endpoint patchUserPassword é afetada pelo estado
// do res.locals;
UserRoute.post(
  "/password/new/:jwt",
  validateSchema(UserNewPasswordSchema),
  UserController.appendNewPassword,
  UserController.patchUserPassword,
);
UserRoute.use("/", authentication, ValidatedRoute);

export default UserRoute;
