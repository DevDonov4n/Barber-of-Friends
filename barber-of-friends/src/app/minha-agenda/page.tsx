import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MinhaAgendaPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/minha-agenda");

  const appointments = await prisma.appointment.findMany({
    where: { clientId: session.id },
    orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    include: { service: { select: { name: true } } },
  });

  const firstName = session.name.trim().split(/\s+/)[0];

  return (
    <main className="site-shell dashboard-shell">
      <section className="page dashboard">
        <div className="dashboard-head">
          <div>
            <a className="back-link" href="/">← Início</a>
            <span className="eyebrow">BARBER OF FRIENDS • CLIENTE</span>
            <h1 className="page-title">Olá, {firstName}.</h1>
            <p className="page-subtitle">Aqui estão seus agendamentos.</p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href="/agendar">Novo agendamento</a>
            <form action="/api/auth/logout" method="post"><button className="btn btn-secondary">Sair</button></form>
          </div>
        </div>

        <section className="panel glass">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MINHA AGENDA</span>
              <h2>Meus horários</h2>
            </div>
          </div>

          <div className="appointment-list">
            {appointments.length === 0 ? (
              <div>
                <p className="page-subtitle">Você ainda não possui agendamentos.</p>
                <a className="btn btn-primary" href="/agendar">Agendar meu corte</a>
              </div>
            ) : appointments.map(appointment => {
              const date = new Date(appointment.appointmentDate);
              const time = new Date(appointment.startTime);
              return (
                <div className="appointment" key={appointment.id}>
                  <div>
                    <strong>{appointment.service.name}</strong>
                    <span>{appointment.status} • R$ {Number(appointment.finalPrice).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <time>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date)} às {new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(time)}</time>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
