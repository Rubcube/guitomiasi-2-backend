import {
  getAccountBalance,
  getAllTransfers,
} from "controllers/AccountController";
import { DateRangeSchema } from "dtos/DateDTO";
import { Router } from "express";
import { authentication } from "middlewares/auth";
import { validateAccountOwnership } from "middlewares/validateAccountOwnership";
import { validateSchema } from "middlewares/validateSchema";

const routes = Router();
routes.get(
  "/:id/balance",
  authentication,
  validateAccountOwnership,
  getAccountBalance,
);
routes.get(
  "/:id/transfers",
  authentication,
  validateAccountOwnership,
  validateSchema(DateRangeSchema, "QUERY"),
  getAllTransfers,
);

export default routes;
