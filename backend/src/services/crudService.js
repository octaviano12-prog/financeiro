import { query } from '../config/db.js';
import { httpError } from '../utils/httpError.js';

const resources = {
  'bank-accounts': {
    table: 'bank_accounts',
    fields: ['bank_name', 'account_type', 'current_balance', 'overdraft_limit', 'overdraft_used', 'overdraft_interest_rate', 'interest_due_day', 'notes']
  },
  'credit-cards': {
    table: 'credit_cards',
    fields: ['card_name', 'issuer', 'total_limit', 'used_limit', 'closing_day', 'due_day', 'revolving_interest_rate', 'current_invoice_value', 'minimum_payment_value', 'status', 'notes']
  },
  'card-transactions': {
    table: 'card_transactions',
    fields: ['credit_card_id', 'description', 'amount', 'purchase_date', 'installments', 'current_installment', 'category_id', 'status']
  },
  debts: {
    table: 'debts',
    fields: ['debt_name', 'creditor', 'debt_type', 'original_amount', 'current_amount', 'monthly_interest_rate', 'start_date', 'due_date', 'installments_total', 'installments_paid', 'installment_value', 'status', 'priority', 'has_guarantee', 'notes']
  },
  incomes: {
    table: 'incomes',
    fields: ['description', 'amount', 'received_date', 'category_id', 'bank_account_id', 'is_recurring', 'recurrence_type', 'status']
  },
  expenses: {
    table: 'expenses',
    fields: ['description', 'amount', 'due_date', 'payment_date', 'category_id', 'bank_account_id', 'is_recurring', 'recurrence_type', 'status', 'notes']
  },
  goals: {
    table: 'financial_goals',
    fields: ['goal_name', 'target_amount', 'current_amount', 'deadline', 'priority', 'status']
  },
  categories: {
    table: 'categories',
    fields: ['name', 'type', 'color', 'icon', 'active']
  },
  alerts: {
    table: 'alerts',
    fields: ['title', 'message', 'alert_type', 'severity', 'is_read', 'related_table', 'related_id']
  }
};

export function getResource(name) {
  const resource = resources[name];
  if (!resource) throw httpError(404, 'Recurso nao encontrado');
  return resource;
}

export async function list(resourceName, userId) {
  const resource = getResource(resourceName);
  return query(`SELECT * FROM ${resource.table} WHERE user_id = :userId ORDER BY created_at DESC`, { userId });
}

export async function create(resourceName, userId, payload) {
  const resource = getResource(resourceName);
  const fields = resource.fields.filter((field) => Object.prototype.hasOwnProperty.call(payload, field));
  if (!fields.length) throw httpError(400, 'Nenhum campo valido informado');

  const columns = ['user_id', ...fields].join(', ');
  const values = [':userId', ...fields.map((field) => `:${field}`)].join(', ');
  const result = await query(`INSERT INTO ${resource.table} (${columns}) VALUES (${values})`, { userId, ...payload });
  const rows = await query(`SELECT * FROM ${resource.table} WHERE id = :id AND user_id = :userId`, { id: result.insertId, userId });
  return rows[0];
}

export async function update(resourceName, userId, id, payload) {
  const resource = getResource(resourceName);
  const fields = resource.fields.filter((field) => Object.prototype.hasOwnProperty.call(payload, field));
  if (!fields.length) throw httpError(400, 'Nenhum campo valido informado');

  const setSql = fields.map((field) => `${field} = :${field}`).join(', ');
  await query(`UPDATE ${resource.table} SET ${setSql} WHERE id = :id AND user_id = :userId`, { id, userId, ...payload });
  const rows = await query(`SELECT * FROM ${resource.table} WHERE id = :id AND user_id = :userId`, { id, userId });
  if (!rows[0]) throw httpError(404, 'Registro nao encontrado');
  return rows[0];
}

export async function remove(resourceName, userId, id) {
  const resource = getResource(resourceName);
  const result = await query(`DELETE FROM ${resource.table} WHERE id = :id AND user_id = :userId`, { id, userId });
  if (!result.affectedRows) throw httpError(404, 'Registro nao encontrado');
  return { ok: true };
}
