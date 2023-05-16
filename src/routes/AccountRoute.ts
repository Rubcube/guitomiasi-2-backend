import * as AccountController from "controllers/AccountController";
import { DateRangeSchema } from "dtos/DateDTO";
import { TransferInSchema } from "dtos/TransferDTO";
import { Router } from "express";
import { authentication } from "middlewares/auth";
import { validateAccountOwnership } from "middlewares/validateAccountOwnership";
import { validateSchema } from "middlewares/validateSchema";

/**
 * Rotas que precisam de validação da conta, isto é: o usuário logado
 * deve ser dono da conta para prosseguir.
 */
const ValidatedRoute = Router({
  mergeParams: true,
});
ValidatedRoute.get("/balance", AccountController.getBalance);
ValidatedRoute.get(
  "/transfers",
  validateSchema(DateRangeSchema, "QUERY"),
  AccountController.getTransfers,
);
ValidatedRoute.get("/transfers/:transferId", AccountController.getTransfer);
ValidatedRoute.post(
  "/transfers",
  validateSchema(TransferInSchema),
  AccountController.postTransfer,
);

const AccountRoute = Router();
AccountRoute.use(
  "/:accountId",
  authentication,
  validateAccountOwnership,
  ValidatedRoute,
);

export default AccountRoute;
