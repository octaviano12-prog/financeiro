import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import * as crud from '../services/crudService.js';

const router = Router();
const resources = ['bank-accounts', 'credit-cards', 'card-transactions', 'debts', 'incomes', 'expenses', 'goals', 'categories', 'alerts'];

router.use(authRequired);

for (const resource of resources) {
  router.get(`/${resource}`, async (req, res, next) => {
    try {
      res.json(await crud.list(resource, req.user.id));
    } catch (error) {
      next(error);
    }
  });

  router.post(`/${resource}`, async (req, res, next) => {
    try {
      res.status(201).json(await crud.create(resource, req.user.id, req.body));
    } catch (error) {
      next(error);
    }
  });

  router.put(`/${resource}/:id`, async (req, res, next) => {
    try {
      res.json(await crud.update(resource, req.user.id, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  });

  router.delete(`/${resource}/:id`, async (req, res, next) => {
    try {
      res.json(await crud.remove(resource, req.user.id, req.params.id));
    } catch (error) {
      next(error);
    }
  });
}

export default router;
