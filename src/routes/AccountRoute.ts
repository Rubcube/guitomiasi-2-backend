import { getAccountBalance } from "controllers/AccountController";
import { Router } from "express";
import { authentication } from "middlewares/auth";

const routes = Router();
routes.get("/balance/:id", authentication, getAccountBalance);

export default routes;
