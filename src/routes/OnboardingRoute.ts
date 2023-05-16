import { Router } from "express";
import * as OnboardingController from "controllers/OnboardingController";

const OnboardingRoute = Router();
OnboardingRoute.post("/", OnboardingController.create);

export default OnboardingRoute;
