import * as UserController from "controllers/UserController";
import { PatchSchema } from "dtos/PatchDTO";
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

const UserRoute = Router();
UserRoute.use("/", authentication, ValidatedRoute);

export default UserRoute;
