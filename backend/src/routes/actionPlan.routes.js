import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { query } from '../config/db.js';
import { generateActionPlan, getActionPlan, listActionPlans } from '../services/actionPlanService.js';
import { httpError } from '../utils/httpError.js';

const router = Router();
router.use(authRequired);

router.post('/generate', async (req, res, next) => {
  try {
    const plan = await generateActionPlan(req.user.id, req.body.strategy_type || 'avalanche', req.body.monthly_available_amount);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await listActionPlans(req.user.id));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const plan = await getActionPlan(req.user.id, req.params.id);
    if (!plan) throw httpError(404, 'Plano nao encontrado');
    res.json(plan);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await query('UPDATE action_plans SET status = :status WHERE id = :id AND user_id = :userId', {
      status: req.body.status || 'ativo',
      id: req.params.id,
      userId: req.user.id
    });
    res.json(await getActionPlan(req.user.id, req.params.id));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM action_plans WHERE id = :id AND user_id = :userId', { id: req.params.id, userId: req.user.id });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
