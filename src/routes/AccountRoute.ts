import { Router } from 'express';
import AccountController from 'controllers/AccountController';

const routes = Router();
const accountController = new AccountController();

routes.post('/', accountController.create);

export default routes;
