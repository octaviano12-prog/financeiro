import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

export function ReportsPage() {
  const [report, setReport] = useState(null);
  useEffect(() => {
    api.get('/reports/monthly').then((response) => setReport(response.data));
  }, []);

  return (
    <section className="page">
      <div className="page-title">
        <div>
          <h1>Relatorios</h1>
          <p>Resumo mensal, dividas, fluxo de caixa e cartoes.</p>
        </div>
      </div>
      <article className="panel">
        <h2>Relatorio mensal</h2>
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </article>
    </section>
  );
}
