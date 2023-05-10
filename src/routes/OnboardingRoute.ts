import { onboardUser } from 'controllers/OnboardingController';
import { OnboardingSchema } from 'dtos/OnboardingDTO';
import { Router } from 'express';
import { validateSchema } from 'middlewares/validateSchema';

const routes = Router();
routes.post('/', validateSchema(OnboardingSchema), onboardUser);

export default routes;