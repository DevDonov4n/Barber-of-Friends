import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppointmentActions from "./AppointmentActions";

type AppointmentRow = {
  id: number;
  appointment_date: string;
  start_time: string;
  final_price: number;
  status: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  favorite_cut: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  service_name: string;
};

type FinanceRow = {
  today_count: number;
  today_revenue: number;
  week_count: number;
  week_revenue: number;
  month_count: number;
  month_revenue: number;
  year_count: number;
  year_revenue: number;
};

const money = (value: number) =>
  "R$ " + Number(value || 0).toFixed(2).replace(".", ",");

const dateLabel = (value: string) => value.split("-").reverse().join("/");

function AppointmentCard({ appointment }: { appointment: AppointmentRow }) {
  const name = appointment.client_name || appointment.guest_name || "Cliente";
  const contact =
    appointment.client_phone ||
    appointment.client_email ||
    appointment.guest_phone ||
    appointment.guest_email ||
    "Contato não informado";

  const statusLabel =
    appointment.status === "COMPLETED"
      ? "CONCLUÍDO"
      : appointment.status === "NO_SHOW"
        ? "NÃO COMPARECEU"
        : "CONFIRMADO";

  return (
    <div className="appointment">
      <div>
        <strong>{name}</strong>
        <span>{appointment.service_name} • {contact}</span>
        {appointment.favorite_cut && (
          <small>
            Favorito: <strong>{appointment.favorite_cut}</strong>
          </small>
        )}
      </div>

      <time>
        {dateLabel(appointment.appointment_date)} às {appointment.start_time}
      </time>

      <b className="appointment-price">{money(appointment.final_price)}</b>

      <div className="appointment-status-column">
        <span className={"appointment-status status-" + appointment.status.toLowerCase()}>
          {statusLabel}
        </span>
        <AppointmentActions id={appointment.id} status={appointment.status} />
      </div>
    </div>
  );
}

export default async function BarberDashboardPage() {
  const session = await getSession();

  if (!session || (session.role !== "BARBER" && session.role !== "ADMIN")) {
    redirect("/login?next=/painel/barbeiro");
  }

  const [todayAppointments, upcomingAppointments, financeRows] =
    await Promise.all([
      prisma.$queryRaw<AppointmentRow[]>\`
        SELECT
          a.id,
          DATE_FORMAT(a.appointment_date,'%Y-%m-%d') AS appointment_date,
          TIME_FORMAT(a.start_time,'%H:%i') AS start_time,
          a.final_price,
          a.status,
          u.name AS client_name,
          u.email AS client_email,
          u.phone AS client_phone,
          u.favorite_cut,
          a.guest_name,
          a.guest_email,
          a.guest_phone,
          s.name AS service_name
        FROM appointments a
        INNER JOIN services s ON s.id = a.service_id
        LEFT JOIN users u ON u.id = a.client_id
        WHERE a.appointment_date = CURDATE()
          AND a.status IN ('CONFIRMED', 'COMPLETED')
        ORDER BY a.start_time ASC
      \`,
      prisma.$queryRaw<AppointmentRow[]>\`
        SELECT
          a.id,
          DATE_FORMAT(a.appointment_date,'%Y-%m-%d') AS appointment_date,
          TIME_FORMAT(a.start_time,'%H:%i') AS start_time,
          a.final_price,
          a.status,
          u.name AS client_name,
          u.email AS client_email,
          u.phone AS client_phone,
          u.favorite_cut,
          a.guest_name,
          a.guest_email,
          a.guest_phone,
          s.name AS service_name
        FROM appointments a
        INNER JOIN services s ON s.id = a.service_id
        LEFT JOIN users u ON u.id = a.client_id
        WHERE a.appointment_date >= CURDATE()
          AND a.status IN ('CONFIRMED', 'COMPLETED')
        ORDER BY a.appointment_date ASC, a.start_time ASC
        LIMIT 50
      \`,
      prisma.$queryRaw<FinanceRow[]>\`
        SELECT
          SUM(CASE WHEN appointment_date = CURDATE() AND status = 'COMPLETED' THEN 1 ELSE 0 END) AS today_count,
          COALESCE(SUM(CASE WHEN appointment_date = CURDATE() AND status = 'COMPLETED' THEN final_price ELSE 0 END), 0) AS today_revenue,

          SUM(CASE WHEN YEARWEEK(appointment_date, 1) = YEARWEEK(CURDATE(), 1) AND status = 'COMPLETED' THEN 1 ELSE 0 END) AS week_count,
          COALESCE(SUM(CASE WHEN YEARWEEK(appointment_date, 1) = YEARWEEK(CURDATE(), 1) AND status = 'COMPLETED' THEN final_price ELSE 0 END), 0) AS week_revenue,

          SUM(CASE WHEN YEAR(appointment_date) = YEAR(CURDATE()) AND MONTH(appointment_date) = MONTH(CURDATE()) AND status = 'COMPLETED' THEN 1 ELSE 0 END) AS month_count,
          COALESCE(SUM(CASE WHEN YEAR(appointment_date) = YEAR(CURDATE()) AND MONTH(appointment_date) = MONTH(CURDATE()) AND status = 'COMPLETED' THEN final_price ELSE 0 END), 0) AS month_revenue,

          SUM(CASE WHEN YEAR(appointment_date) = YEAR(CURDATE()) AND status = 'COMPLETED' THEN 1 ELSE 0 END) AS year_count,
          COALESCE(SUM(CASE WHEN YEAR(appointment_date) = YEAR(CURDATE()) AND status = 'COMPLETED' THEN final_price ELSE 0 END), 0) AS year_revenue
        FROM appointments
      \`,
    ]);

  const financeBase = financeRows[0] || {
    today_count: 0,
    today_revenue: 0,
    week_count: 0,
    week_revenue: 0,
    month_count: 0,
    month_revenue: 0,
    year_count: 0,
    year_revenue: 0,
  };

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const elapsedDays = Math.max(
    1,
    Math.ceil((tomorrow.getTime() - startOfYear.getTime()) / 86400000)
  );
  const yearDays =
    new Date(now.getFullYear(), 1, 29).getMonth() === 1 ? 366 : 365;

  const finance = {
    today_count: Number(financeBase.today_count || 0),
    today_revenue: Number(financeBase.today_revenue || 0),
    week_count: Number(financeBase.week_count || 0),
    week_revenue: Number(financeBase.week_revenue || 0),
    month_count: Number(financeBase.month_count || 0),
    month_revenue: Number(financeBase.month_revenue || 0),
    year_count: Number(financeBase.year_count || 0),
    year_revenue: Number(financeBase.year_revenue || 0),
    year_expected:
      (Number(financeBase.year_revenue || 0) / elapsedDays) * yearDays,
  };

  const completedToday = todayAppointments.filter(
    (appointment) => appointment.status === "COMPLETED"
  ).length;
  const pendingToday = todayAppointments.length - completedToday;

  return (
    <main className="site-shell dashboard-shell">
      <section className="page dashboard">
        <div className="dashboard-head">
          <div>
            <a className="back-link" href="/">← Início</a>
            <span className="eyebrow">BARBER OF FRIENDS • ADMIN</span>
            <h1 className="page-title">Olá, {session.name}.</h1>
            <p className="page-subtitle">Central de controle da sua barbearia.</p>
          </div>

          <div className="actions">
            <a className="btn btn-primary" href="/agendar">Novo agendamento</a>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-secondary">Sair</button>
            </form>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat glass">
            <span>HOJE</span>
            <strong>{todayAppointments.length}</strong>
            <small>{completedToday} concluído(s) • {pendingToday} pendente(s)</small>
          </article>
          <article className="stat glass">
            <span>SEMANA</span>
            <strong>{finance.week_count}</strong>
            <small>{money(finance.week_revenue)} realizados</small>
          </article>
          <article className="stat glass">
            <span>OPERAÇÃO</span>
            <strong>Online</strong>
            <small>painel protegido</small>
          </article>
        </div>

        <section className="barber-today panel glass">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">AGENDA DE HOJE</span>
              <h2>Cortes do dia</h2>
              <p className="panel-description">
                Atendimentos organizados do primeiro ao último horário.
              </p>
            </div>
            <span className="today-count-badge">{todayAppointments.length} corte(s)</span>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhum corte agendado para hoje.</strong>
              <span>Quando houver reservas, elas aparecerão aqui em ordem de horário.</span>
            </div>
          ) : (
            <div className="appointment-list today-appointment-list">
              {todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </section>

        <section className="finance-panel panel glass">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FINANCEIRO</span>
              <h2>Visão financeira</h2>
              <p className="panel-description">
                Valores realizados considerando somente cortes concluídos.
              </p>
            </div>
          </div>

          <div className="finance-grid">
            <article className="finance-card">
              <span>HOJE</span>
              <strong>{money(finance.today_revenue)}</strong>
              <small>{finance.today_count} corte(s) concluído(s)</small>
            </article>
            <article className="finance-card">
              <span>ESTA SEMANA</span>
              <strong>{money(finance.week_revenue)}</strong>
              <small>{finance.week_count} corte(s) concluído(s)</small>
            </article>
            <article className="finance-card">
              <span>ESTE MÊS</span>
              <strong>{money(finance.month_revenue)}</strong>
              <small>{finance.month_count} corte(s) concluído(s)</small>
            </article>
            <article className="finance-card finance-card-highlight">
              <span>PROJEÇÃO ATÉ O FIM DO ANO</span>
              <strong>{money(finance.year_expected)}</strong>
              <small>estimativa baseada no ritmo médio realizado neste ano</small>
            </article>
          </div>

          <div className="finance-summary">
            <div>
              <span>ANO ATÉ AGORA</span>
              <strong>{money(finance.year_revenue)}</strong>
              <small>{finance.year_count} corte(s) concluído(s)</small>
            </div>
            <div>
              <span>BASE DA PROJEÇÃO</span>
              <strong>{money(finance.year_expected)}</strong>
              <small>ritmo médio diário × dias restantes do ano</small>
            </div>
          </div>
        </section>

        <section className="panel glass">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">AGENDA</span>
              <h2>Próximos atendimentos</h2>
            </div>
            <a className="btn btn-primary" href="/agendar">Novo agendamento</a>
          </div>

          <div className="appointment-list">
            {upcomingAppointments.length === 0 ? (
              <p className="page-subtitle">Nenhum agendamento futuro.</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
