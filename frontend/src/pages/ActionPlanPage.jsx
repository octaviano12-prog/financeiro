import { useEffect, useState } from 'react';
import { Wand2 } from 'lucide-react';
import { api } from '../api/client.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function ActionPlanPage() {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [strategy, setStrategy] = useState('avalanche');
  const [amount, setAmount] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const response = await api.get('/action-plan');
    setPlans(response.data);
    if (response.data[0]) {
      const detail = await api.get(`/action-plan/${response.data[0].id}`);
      setSelected(detail.data);
    }
  }

  async function generate() {
    const response = await api.post('/action-plan/generate', {
      strategy_type: strategy,
      monthly_available_amount: amount || undefined
    });
    setSelected(response.data);
    await load();
  }

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <h1>Plano de acao</h1>
          <p>Gere simulacoes para priorizar dividas e reduzir juros.</p>
        </div>
      </div>
      <div className="form-panel compact">
        <label>
          <span>Estrategia</span>
          <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
            <option value="avalanche">Avalanche</option>
            <option value="bola_de_neve">Bola de Neve</option>
            <option value="emergencial">Emergencial</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </label>
        <label>
          <span>Valor mensal disponivel</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Calcular automaticamente" />
        </label>
        <button type="button" onClick={generate}><Wand2 size={16} /> Gerar plano</button>
      </div>

      {selected && (
        <article className="panel">
          <h2>Recomendacao</h2>
          <p>{selected.recommendation_text}</p>
          <div className="metric-grid small">
            <div><small>Total de dividas</small><strong>{money.format(selected.total_debt)}</strong></div>
            <div><small>Valor mensal</small><strong>{money.format(selected.monthly_available_amount)}</strong></div>
            <div><small>Prazo estimado</small><strong>{selected.estimated_months || '-'} meses</strong></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ordem</th><th>Divida</th><th>Pagamento sugerido</th><th>Motivo</th></tr></thead>
              <tbody>
                {selected.items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.payment_order}</td>
                    <td>{item.debt_name}</td>
                    <td>{money.format(item.suggested_monthly_payment)}</td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </section>
  );
}
