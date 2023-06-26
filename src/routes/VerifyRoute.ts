import * as UserController from "controllers/UserController";
import { OnboardingUserStepValidationSchema } from "dtos/OnboardingDTO";
import { Router } from "express";
import { validateSchema } from "middlewares/validateSchema";

const VerifyRoute = Router();
VerifyRoute.post(
  "/user",
  validateSchema(OnboardingUserStepValidationSchema),
  UserController.validateUserOnboardingData,
);

export default VerifyRoute;
