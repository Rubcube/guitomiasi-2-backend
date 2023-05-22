import * as UserController from "controllers/UserController";
import { UserPutSchema } from "dtos/UsersDTO";
import { Router } from "express";
import { authentication } from "middlewares/auth";
import { validateSchema } from "middlewares/validateSchema";

/**
 * Rotas que precisam de validação da autenticação.
 */
const ValidatedRoute = Router();
ValidatedRoute.get("/", UserController.getInfo);
ValidatedRoute.put("/", validateSchema(UserPutSchema), UserController.putInfo);

const UserRoute = Router();
UserRoute.use("/", authentication, ValidatedRoute);

export default UserRoute;