import * as UserController from "controllers/UserController";
import { AddressOnboardingSchema } from "dtos/AddressDTO";
import { OnboardingUserStepValidationSchema } from "dtos/OnboardingDTO";
import { Router } from "express";
import { endingMiddleware } from "middlewares/endingMiddleware";
import { validateSchema } from "middlewares/validateSchema";
import { z } from "zod";
import { transactionPassword } from "zodTypes/account";
import { userPassword } from "zodTypes/user";

const VerifyRoute = Router();
VerifyRoute.post(
  "/user",
  validateSchema(OnboardingUserStepValidationSchema),
  UserController.validateUserOnboardingData,
);

VerifyRoute.post(
  "/address",
  validateSchema(AddressOnboardingSchema),
  endingMiddleware,
);

VerifyRoute.post(
  "/userPassword",
  validateSchema(
    z.object({
      password: userPassword,
    }),
  ),
  endingMiddleware,
);

VerifyRoute.post(
  "/transactionalPassword",
  validateSchema(
    z.object({
      password: transactionPassword,
    }),
  ),
  endingMiddleware,
);

export default VerifyRoute;
