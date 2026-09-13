const particles = Array.from({ length: 70 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  x: `${((index % 7) - 3) * 18}px`,
  y: `${((index % 5) - 2) * 20}px`,
  duration: `${4 + (index % 6)}s`,
  color: index % 2 === 0 ? "#ff304f" : "#2878ff",
}));

export default function Home() {
  return (
    <main className="site-shell">
      <div className="particle-field" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              ["--x" as string]: particle.x,
              ["--y" as string]: particle.y,
              ["--duration" as string]: particle.duration,
              ["--particle-color" as string]: particle.color,
            }}
          />
        ))}
      </div>

      <header className="navbar">
        <a className="brand" href="#inicio">
          BARBER<span>OF</span>FRIENDS
        </a>
        <nav className="nav-links" aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#agendamento">Agendamento</a>
          <a href="#sobre">Sobre</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="btn btn-secondary" href="#agendamento">Agendar</a>
      </header>

      <section className="hero" id="inicio">
        <span className="eyebrow">Barbearia • Agendamento inteligente</span>
        <h1>
          Seu corte.<br />
          Seu horário.<br />
          <span className="gradient-text">Sem complicação.</span>
        </h1>
        <p>
          Uma experiência rápida para encontrar seu horário, escolher o melhor dia
          e chegar na cadeira sem perder tempo.
        </p>
        <div className="actions" id="agendamento">
          <a className="btn btn-primary" href="#agendar">Agendar meu corte</a>
          <a className="btn btn-secondary" href="#sobre">Conhecer a barbearia</a>
        </div>
      </section>

      <section className="feature-grid" id="sobre">
        <article className="feature glass">
          <span className="number">01</span>
          <h2>Escolha o horário</h2>
          <p>Atendimento de segunda a domingo, com horários organizados em blocos de 30 minutos.</p>
        </article>
        <article className="feature glass">
          <span className="number">02</span>
          <h2>Sem cadastro obrigatório</h2>
          <p>Agende rapidamente informando apenas os dados necessários para o atendimento.</p>
        </article>
        <article className="feature glass">
          <span className="number">03</span>
          <h2>Seu corte favorito</h2>
          <p>Clientes cadastrados poderão salvar o corte favorito para facilitar o atendimento do barbeiro.</p>
        </article>
      </section>

      <section className="page" id="agendar">
        <div className="panel glass">
          <h2 className="page-title">Agendamento em breve.</h2>
          <p className="page-subtitle">A estrutura visual está pronta. O próximo passo será conectar calendário, horários, clientes e banco de dados.</p>
          <a className="btn btn-primary" href="#inicio">Voltar ao início</a>
        </div>
      </section>

      <footer className="page" id="contato" style={{ paddingTop: 10 }}>
        <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>© 2026 Barber of Friends — todos os direitos reservados.</p>
      </footer>
    </main>
  );
}
