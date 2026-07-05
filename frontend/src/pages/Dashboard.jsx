import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Banknote, CalendarDays, CreditCard, HandCoins, HeartPulse, Landmark, Plus, Receipt, ShieldAlert, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../api/client.js';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const colors = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed'];

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/dashboard/charts'),
      api.get('/dashboard/alerts'),
      api.get('/dashboard/financial-health')
    ]).then(([summaryRes, chartsRes, alertsRes, healthRes]) => {
      setSummary(summaryRes.data);
      setCharts(chartsRes.data);
      setAlerts(alertsRes.data);
      setHealth(healthRes.data);
    });
  }, []);

  if (!summary) return <div className="page">Carregando dashboard...</div>;

  const cards = [
    ['Saldo em Bancos', summary.totalBankBalance, Landmark, 'positive', '12,5% vs mes anterior'],
    ['Total de Dividas', summary.totalDebts, Receipt, 'danger', '2,7% vs mes anterior'],
    ['Cheque Especial', summary.totalOverdraftUsed, ShieldAlert, 'warning', '0,0% vs mes anterior'],
    ['Cartao de Credito', summary.totalCardOpen, CreditCard, 'purple', '8,3% vs mes anterior'],
    ['Receitas do Mes', summary.monthlyIncome, TrendingUp, 'positive', '5,3% vs mes anterior'],
    ['Despesas do Mes', summary.monthlyExpenses, TrendingDown, 'danger', '3,1% vs mes anterior']
  ];
  const statusCards = [
    ['Contas a Vencer', summary.upcomingBills, CalendarDays, 'purple'],
    ['Contas Vencidas', summary.overdueBills, Receipt, 'danger'],
    ['Renda Comprometida', `${summary.incomeCommitmentPercent}%`, HandCoins, 'warning'],
    ['Saldo Previsto', summary.expectedMonthlyBalance, Banknote, summary.expectedMonthlyBalance >= 0 ? 'positive' : 'danger'],
    ['Saude Financeira', `${health.score} / 100`, HeartPulse, 'positive']
  ];
  const upcoming = [
    ['20', 'Fatura Cartao', summary.totalCardOpen || 0],
    ['22', 'Conta de Luz', 180.9],
    ['25', 'Plano de Saude', 450],
    ['30', 'Financiamento', 980]
  ];
  const planSteps = ['Quitar o cheque especial', 'Negociar dividas vencidas', 'Reduzir uso do cartao', 'Cortar despesas nao essenciais', 'Criar reserva de emergencia'];

  return (
    <section className="page dashboard-page">
      <div className="page-title">
        <div>
          <h1>Dashboard</h1>
          <p>Visao geral da sua vida financeira</p>
        </div>
        <div className="dashboard-actions">
          <button className="month-button">Mes atual: Maio/2024 <CalendarDays size={16} /></button>
          <Link to="/receitas" className="primary-action"><Plus size={16} /> Acao rapida</Link>
        </div>
      </div>

      <div className="metric-grid dashboard-metrics">
        {cards.map(([label, value, Icon, tone, delta]) => (
          <article className="metric-card" key={label}>
            <span className={tone}><Icon size={20} /></span>
            <small>{label}</small>
            <strong>{typeof value === 'number' ? money.format(value) : value}</strong>
            <em className={tone === 'danger' ? 'down' : 'up'}>{delta}</em>
          </article>
        ))}
      </div>

      <div className="dashboard-board">
        <div className="dashboard-main">
        <article className="panel">
          <div className="panel-head"><h2>Entradas x Saidas</h2><span>Ultimos 5 meses</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts?.cashFlow || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => money.format(value)} />
              <Bar dataKey="entradas" fill="#16a34a" />
              <Bar dataKey="saidas" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="panel">
          <div className="panel-head"><h2>Evolucao das Dividas</h2><span>Ultimos 5 meses</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts?.debts?.length ? charts.debts : [{ name: 'Jan', valor: 15000 }, { name: 'Fev', valor: 18500 }, { name: 'Mar', valor: 16000 }, { name: 'Abr', valor: 15200 }, { name: 'Mai', valor: summary.totalDebts }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => money.format(value)} />
              <Line type="monotone" dataKey="valor" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <div className="status-strip">
          {statusCards.map(([label, value, Icon, tone]) => (
            <div className="status-item" key={label}>
              <span className={tone}><Icon size={20} /></span>
              <small>{label}</small>
              <strong>{typeof value === 'number' && label !== 'Contas a Vencer' && label !== 'Contas Vencidas' ? money.format(value) : value}</strong>
            </div>
          ))}
        </div>

        <article className="panel">
          <div className="panel-head"><h2>Gastos por Categoria</h2><span>Mes atual</span></div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={charts?.expensesByCategory || []} dataKey="value" nameKey="name" outerRadius={85}>
                {(charts?.expensesByCategory || []).map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => money.format(value)} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="panel">
          <div className="panel-head"><h2>Proximos vencimentos</h2><Link to="/despesas">Ver calendario</Link></div>
          <div className="due-list">
            {upcoming.map(([day, label, value]) => (
              <div key={`${day}-${label}`}><b>{day}<small>MAI</small></b><span>{label}</span><strong>{money.format(value)}</strong></div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-head"><h2>Dividas por prioridade</h2></div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={[{ name: 'Urgente', value: 40 }, { name: 'Alta', value: 30 }, { name: 'Media', value: 20 }, { name: 'Baixa', value: 10 }]} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86}>
                {colors.map((color) => <Cell key={color} fill={color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
        </div>

        <aside className="dashboard-side">
        <article className="panel">
          <div className="panel-head"><h2>Alertas importantes</h2><Link to="/despesas">Ver todos</Link></div>
          <div className="alert-list">
            {alerts.length === 0 && <p>Nenhum alerta critico no momento.</p>}
            {alerts.map((alert, index) => (
              <div className={`alert ${alert.severity}`} key={`${alert.title}-${index}`}>
                <AlertTriangle size={18} />
                <div><strong>{alert.title}</strong><span>{alert.message}</span></div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel action-card">
          <div className="panel-head"><h2>Plano de acao recomendado</h2><Link to="/plano-de-acao">Ver plano completo</Link></div>
          <p>Com base na sua situacao financeira, recomendamos:</p>
          <ol>
            {planSteps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
          </ol>
          <Link to="/plano-de-acao" className="full-action">Ver plano detalhado</Link>
        </article>
        </aside>
      </div>

      <div className="quick-action-bar">
        <strong>Acoes rapidas</strong>
        <Link to="/receitas"><Plus size={16} /> Nova Receita</Link>
        <Link to="/despesas"><Plus size={16} /> Nova Despesa</Link>
        <Link to="/dividas"><Plus size={16} /> Nova Divida</Link>
        <Link to="/cartoes"><CreditCard size={16} /> Novo Cartao</Link>
        <Link to="/bancos"><Landmark size={16} /> Novo Banco</Link>
        <Link to="/plano-de-acao"><Target size={16} /> Criar Plano</Link>
      </div>
    </section>
  );
}
