import * as UserController from "controllers/UserController";
import { Router } from "express";
import { authentication } from "middlewares/auth";

/**
 * Rotas que precisam de validação da autenticação.
 */
const ValidatedRoute = Router();
ValidatedRoute.get("/", UserController.getInfo);

const UserRoute = Router();
UserRoute.use("/", authentication, ValidatedRoute);

export default UserRoute;
