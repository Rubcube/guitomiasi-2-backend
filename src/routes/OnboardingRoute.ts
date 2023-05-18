import * as OnboardingController from "controllers/OnboardingController";
import { OnboardingSchema } from "dtos/OnboardingDTO";
import { Router } from "express";
import { validateSchema } from "middlewares/validateSchema";

const OnboardingRoute = Router();
OnboardingRoute.post(
  "/",
  validateSchema(OnboardingSchema),
  OnboardingController.create,
);

export default OnboardingRoute;
