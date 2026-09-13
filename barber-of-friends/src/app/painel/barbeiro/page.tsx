export default function BarberDashboardPage() {
  return (
    <main className="site-shell">
      <section className="page">
        <span className="eyebrow">Área administrativa</span>
        <h1 className="page-title">Painel do barbeiro</h1>
        <p className="page-subtitle">Base preparada para agenda, clientes, cancelamentos e visão dos atendimentos.</p>
        <div className="feature-grid" style={{ width: "100%", padding: 0, margin: 0 }}>
          <article className="feature glass"><span className="number">AGENDA</span><h2>Agendamentos</h2><p>Visualização diária e semanal dos horários.</p></article>
          <article className="feature glass"><span className="number">CLIENTES</span><h2>Clientes</h2><p>Cadastro, contato e corte favorito.</p></article>
          <article className="feature glass"><span className="number">GESTÃO</span><h2>Controle</h2><p>Confirmação e cancelamento dos atendimentos.</p></article>
        </div>
      </section>
    </main>
  );
}
