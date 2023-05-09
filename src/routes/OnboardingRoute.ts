import { onboardUser } from 'controllers/OnboardingController';
import { Router } from 'express';

const routes = Router();
routes.post('/', onboardUser);

export default routes;