import * as AccountController from "controllers/AccountController";
import {
  AccountPasswordPatchSchema,
  GetAssociatedUserSchema,
  GetUserAccounts,
  validateAccountOwnershipSchema,
} from "dtos/AccountDTO";
import { TransferInSchema, TransferOutSchema } from "dtos/TransferDTO";
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
  validateSchema(TransferOutSchema, "QUERY"),
  AccountController.getTransfers,
);
ValidatedRoute.get("/transfers/:transferId", AccountController.getTransfer);
ValidatedRoute.post(
  "/transfers",
  validateSchema(TransferInSchema),
  AccountController.postTransfer,
);
ValidatedRoute.patch(
  "/password/reset",
  validateSchema(AccountPasswordPatchSchema),
  AccountController.patchPassword,
);

const AccountRoute = Router();
AccountRoute.get("/", authentication, AccountController.getLoggedUserAccounts);
AccountRoute.get(
  "/:accountNumber",
  authentication,
  validateSchema(GetAssociatedUserSchema, "PARAMS"),
  AccountController.getAssociatedUser,
);
AccountRoute.get(
  "/user/:document",
  authentication,
  validateSchema(GetUserAccounts, "PARAMS"),
  AccountController.getUserAccounts,
);
AccountRoute.use(
  "/:accountId",
  authentication,
  validateSchema(validateAccountOwnershipSchema, "PARAMS"),
  validateAccountOwnership,
  ValidatedRoute,
);

export default AccountRoute;
