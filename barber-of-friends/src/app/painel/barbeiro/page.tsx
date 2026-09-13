import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BarberDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "BARBER") redirect("/login?next=/painel/barbeiro");
  const appointments = await prisma.appointment.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 20, include: { client: { select: { name: true, email: true } } } });
  const today = new Date();
  const todayAppointments = appointments.filter(a => a.date.toDateString() === today.toDateString()).length;
  return <main className="site-shell dashboard-shell"><section className="page dashboard"><div className="dashboard-head"><div><span className="eyebrow">BARBER OF FRIENDS • ADMIN</span><h1 className="page-title">Olá, {session.name}.</h1><p className="page-subtitle">Central de controle da sua barbearia.</p></div><form action="/api/auth/logout" method="post"><button className="btn btn-secondary">Sair</button></form></div><div className="stats-grid"><article className="stat glass"><span>Próximos</span><strong>{appointments.length}</strong><small>agendamentos</small></article><article className="stat glass"><span>Hoje</span><strong>{todayAppointments}</strong><small>atendimentos</small></article><article className="stat glass"><span>Operação</span><strong>Online</strong><small>painel protegido</small></article></div><section className="panel glass"><div className="panel-heading"><div><span className="eyebrow">AGENDA</span><h2>Próximos atendimentos</h2></div><a className="btn btn-primary" href="/agendar">Novo agendamento</a></div><div className="appointment-list">{appointments.length === 0 ? <p className="page-subtitle">Nenhum agendamento futuro.</p> : appointments.map(a => <div className="appointment" key={a.id}><div><strong>{a.client?.name || a.guestName || "Cliente"}</strong><span>{a.service} • {a.client?.email || a.guestEmail || a.guestPhone || "Contato não informado"}</span></div><time>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(a.date)}</time><b className="appointment-price">R$ {Number(a.price).toFixed(2).replace(".", ",")}</b></div>)}</div></section></section></main>;
}
