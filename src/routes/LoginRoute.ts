import { loginUser } from 'controllers/LoginController';
import { UserLoginSchema } from 'dtos/UsersDTO';
import { Router } from 'express';
import { validateSchema } from 'middlewares/validateSchema';

const routes = Router();
routes.post('/', validateSchema(UserLoginSchema), loginUser);

export default routes;