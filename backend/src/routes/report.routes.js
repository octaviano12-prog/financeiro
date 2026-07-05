import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import { getFinancialSnapshot } from '../services/dashboardService.js';

const router = Router();
router.use(authRequired);

router.get('/monthly', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json({ summary: snapshot.summary, health: snapshot.health, alerts: snapshot.alerts });
  } catch (error) {
    next(error);
  }
});

router.get('/debts', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json(snapshot.debts);
  } catch (error) {
    next(error);
  }
});

router.get('/cash-flow', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json({ incomes: snapshot.incomes, expenses: snapshot.expenses, expectedBalance: snapshot.summary.expectedMonthlyBalance });
  } catch (error) {
    next(error);
  }
});

router.get('/cards', async (req, res, next) => {
  try {
    const snapshot = await getFinancialSnapshot(req.user.id);
    res.json(snapshot.cards);
  } catch (error) {
    next(error);
  }
});

export default router;
