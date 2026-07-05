import { query } from '../config/db.js';
import { roundMoney, toNumber } from '../utils/money.js';
import { getFinancialSnapshot } from './dashboardService.js';

export async function generateActionPlan(userId, strategyType = 'avalanche', customMonthlyAmount) {
  const snapshot = await getFinancialSnapshot(userId);
  const activeDebts = snapshot.debts.filter((debt) => debt.status !== 'quitada' && toNumber(debt.current_amount) > 0);
  const monthlyAvailable = toNumber(customMonthlyAmount) || Math.max(0, snapshot.summary.monthlyIncome - snapshot.summary.monthlyExpenses);
  const ordered = orderDebts(activeDebts, strategyType);
  const urgentDebt = ordered[0];
  const totalDebt = activeDebts.reduce((sum, item) => sum + toNumber(item.current_amount), 0);
  const estimatedMonths = monthlyAvailable > 0 ? Math.ceil(totalDebt / monthlyAvailable) : null;

  const recommendationText = buildRecommendation({ snapshot, ordered, strategyType, monthlyAvailable, totalDebt });
  const result = await query(
    `INSERT INTO action_plans (user_id, strategy_type, total_debt, monthly_available_amount, recommendation_text, estimated_months, status)
     VALUES (:userId, :strategyType, :totalDebt, :monthlyAvailable, :recommendationText, :estimatedMonths, 'ativo')`,
    { userId, strategyType, totalDebt, monthlyAvailable, recommendationText, estimatedMonths }
  );

  const actionPlanId = result.insertId;
  for (const [index, debt] of ordered.entries()) {
    const suggested = index === 0 ? monthlyAvailable : Math.min(toNumber(debt.installment_value), monthlyAvailable * 0.15);
    await query(
      `INSERT INTO action_plan_items (action_plan_id, debt_id, payment_order, suggested_monthly_payment, reason, status)
       VALUES (:actionPlanId, :debtId, :paymentOrder, :suggestedMonthlyPayment, :reason, 'pendente')`,
      {
        actionPlanId,
        debtId: debt.id,
        paymentOrder: index + 1,
        suggestedMonthlyPayment: roundMoney(suggested),
        reason: reasonForDebt(debt, strategyType)
      }
    );
  }

  return getActionPlan(userId, actionPlanId);
}

function orderDebts(debts, strategyType) {
  const list = [...debts];
  if (strategyType === 'bola_de_neve') return list.sort((a, b) => toNumber(a.current_amount) - toNumber(b.current_amount));
  if (strategyType === 'emergencial') {
    return list.sort((a, b) => priorityScore(b) - priorityScore(a));
  }
  return list.sort((a, b) => toNumber(b.monthly_interest_rate) - toNumber(a.monthly_interest_rate));
}

function priorityScore(debt) {
  let score = 0;
  if (debt.status === 'atrasada') score += 40;
  if (['cheque_especial', 'cartao_credito'].includes(debt.debt_type)) score += 25;
  if (debt.priority === 'urgente') score += 20;
  score += Math.min(20, toNumber(debt.monthly_interest_rate));
  return score;
}

function reasonForDebt(debt, strategyType) {
  if (strategyType === 'bola_de_neve') return 'Divida menor, escolhida para gerar progresso rapido.';
  if (strategyType === 'emergencial') return 'Divida com maior risco imediato por atraso, juros ou tipo.';
  return 'Divida priorizada pela taxa de juros mais alta.';
}

function buildRecommendation({ snapshot, ordered, strategyType, monthlyAvailable, totalDebt }) {
  if (!ordered.length) return 'Voce nao possui dividas abertas cadastradas. Mantenha o fluxo de caixa atualizado e fortaleça sua reserva.';
  const first = ordered[0];
  const strategyName = {
    avalanche: 'Avalanche',
    bola_de_neve: 'Bola de Neve',
    emergencial: 'Emergencial',
    personalizado: 'Personalizado'
  }[strategyType] || 'Avalanche';

  const warnings = [];
  if (snapshot.summary.totalOverdraftUsed > 0) warnings.push('reduzir o cheque especial antes de assumir novas parcelas');
  if (snapshot.summary.totalCardOpen > snapshot.summary.monthlyIncome * 0.4) warnings.push('evitar pagar apenas o minimo do cartao');
  if (snapshot.summary.incomeCommitmentPercent > 70) warnings.push('cortar despesas nao essenciais por 30 dias');

  return `Plano ${strategyName}: voce possui R$ ${roundMoney(totalDebt).toFixed(2)} em dividas abertas. A primeira prioridade e "${first.debt_name}", com juros de ${toNumber(first.monthly_interest_rate).toFixed(2)}% ao mes. Recomenda-se separar R$ ${roundMoney(monthlyAvailable).toFixed(2)} por mes para amortizacao. ${warnings.length ? `Tambem e recomendado ${warnings.join(', ')}.` : 'Mantenha os pagamentos em dia e acompanhe a evolucao semanalmente.'} As recomendacoes sao simulacoes de organizacao financeira, nao consultoria financeira oficial.`;
}

export async function listActionPlans(userId) {
  return query('SELECT * FROM action_plans WHERE user_id = :userId ORDER BY created_at DESC', { userId });
}

export async function getActionPlan(userId, id) {
  const plans = await query('SELECT * FROM action_plans WHERE id = :id AND user_id = :userId', { id, userId });
  const plan = plans[0];
  if (!plan) return null;
  const items = await query(
    `SELECT api.*, d.debt_name, d.creditor, d.current_amount, d.monthly_interest_rate, d.status AS debt_status
     FROM action_plan_items api
     LEFT JOIN debts d ON d.id = api.debt_id
     WHERE api.action_plan_id = :id
     ORDER BY api.payment_order ASC`,
    { id }
  );
  return { ...plan, items };
}
