import { Router } from "express";
import * as OnboardingController from "controllers/OnboardingController";
import { validateSchema } from "middlewares/validateSchema";
import { OnboardingSchema } from "dtos/OnboardingDTO";

const OnboardingRoute = Router();
OnboardingRoute.post(
  "/",
  validateSchema(OnboardingSchema),
  OnboardingController.create,
);

export default OnboardingRoute;
