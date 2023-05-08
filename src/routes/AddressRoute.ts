import { Router } from 'express';
import AddressController from 'controllers/AddressController';

const routes = Router();
const addressController = new AddressController();

routes.post('/', addressController.create);

export default routes;
