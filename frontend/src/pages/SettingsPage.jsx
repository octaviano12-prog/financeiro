export function SettingsPage() {
  return (
    <section className="page">
      <div className="page-title">
        <div>
          <h1>Configuracoes</h1>
          <p>Preferencias de moeda, tema, alertas e notificacoes.</p>
        </div>
      </div>
      <div className="settings-grid">
        <article className="panel"><h2>Moeda padrao</h2><p>Real brasileiro (BRL)</p></article>
        <article className="panel"><h2>Tema</h2><p>Tema claro ativo. Tema escuro preparado para evolucao futura.</p></article>
        <article className="panel"><h2>Limites de alerta</h2><p>Comprometimento recomendado: ate 50% da renda mensal.</p></article>
      </div>
    </section>
  );
}
