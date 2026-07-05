import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { buildCharts, getFinancialSnapshot } from '../services/dashboardService.js';

const router = Router();
router.use(authRequired);

router.get('/summary', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json(snapshot.summary);
  } catch (error) {
    next(error);
  }
});

router.get('/charts', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json(buildCharts(snapshot));
  } catch (error) {
    next(error);
  }
});

router.get('/alerts', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json(snapshot.alerts);
  } catch (error) {
    next(error);
  }
});

router.get('/financial-health', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json(snapshot.health);
  } catch (error) {
    next(error);
  }
});

export default router;
