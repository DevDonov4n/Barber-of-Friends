"use client";

import { useEffect, useMemo, useState } from "react";

const key = (d: Date) => d.toISOString().slice(0, 10);

const label = (d: Date) => new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(d);

const slots = Array.from({ length: 23 }, (_, i) => {
  const m = 9 * 60 + i * 30;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});

const services = [
  { name: "Corte normal", price: 45 },
  { name: "Corte premium", price: 80 },
];

type BookedAppointment = { date: string; time: string };
type Confirmation = { name: string; date: string; time: string; service: string };

export default function AgendarPage() {
  const [days, setDays] = useState<Date[]>([]);
  const [day, setDay] = useState("");
  const [booked, setBooked] = useState<BookedAppointment[]>([]);
  const [time, setTime] = useState("");
  const [service, setService] = useState("Corte normal");
  const [guestName, setGuestName] = useState("");
  const [logged, setLogged] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    const now = new Date();
    const list = Array.from({ length: 14 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
    setDays(list);
    setDay(key(list[0]));

    fetch("/api/appointments")
      .then((response) => response.json())
      .then((data) => {
        setBooked(data.map((appointment: { appointmentDate: string; startTime: string }) => ({
          date: appointment.appointmentDate,
          time: appointment.startTime,
        })));
      })
      .catch(() => undefined);

    fetch("/api/auth/session")
      .then((response) => setLogged(response.ok))
      .catch(() => undefined);
  }, []);

  const unavailable = useMemo(() => booked.filter((appointment) => appointment.date.startsWith(day)), [booked, day]);
  const isSunday = day ? new Date(`${day}T12:00:00`).getDay() === 0 : false;

  async function confirm() {
    if (!day || !time || isSunday) return;
    if (!logged && !guestName.trim()) {
      setMessage("Informe seu nome para confirmar o agendamento.");
      return;
    }

    try {
      const date = new Date(`${day}T${time}:00`);
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString(), service, guestName }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Não foi possível realizar o agendamento.");
        return;
      }

      setBooked((current) => [...current, { date: data.appointmentDate, time: data.startTime }]);
      setConfirmation({
        name: logged ? "Cliente" : guestName.trim(),
        date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(date),
        time,
        service,
      });
      setMessage("");
      setTime("");
      setGuestName("");
    } catch {
      setMessage("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <main className="site-shell">
      <section className="page booking-page">
        <a className="back-link" href="/">← Voltar</a>
        <span className="eyebrow">BARBER OF FRIENDS • AGENDAMENTO</span>
        <h1 className="page-title">Escolha seu horário.</h1>
        <p className="page-subtitle">Atendimentos de 30 em 30 minutos, das 09:00 às 20:30. <strong>Domingo não possui agendamento.</strong></p>

        <div className="calendar-row">
          {days.map((date) => (
            <button key={key(date)} disabled={date.getDay() === 0} className={`day-card ${day === key(date) ? "active" : ""}`} onClick={() => { setDay(key(date)); setTime(""); }}>
              {label(date)}{date.getDay() === 0 ? " • fechado" : ""}
            </button>
          ))}
        </div>

        <section className="booking-panel glass">
          <h2>Escolha o corte</h2>
          <div className="service-grid">
            {services.map((item) => (
              <button key={item.name} className={`service-card ${service === item.name ? "selected" : ""}`} onClick={() => setService(item.name)}>
                <strong>{item.name}</strong><span>R$ {item.price.toFixed(2).replace(".", ",")}</span>
              </button>
            ))}
          </div>

          <p className="booking-hint">A cada 5 cortes concluídos com o barbeiro, o próximo corte premium recebe 50% de desconto.</p>

          {!logged && (
            <div className="guest-fields">
              <h3>Agende sem criar conta</h3>
              <p>Não precisa de cadastro. Para reservar, informe somente seu nome.</p>
              <div className="form-grid single-field">
                <input value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Seu nome" />
              </div>
              <p>Quer acompanhar seu histórico depois? <a href="/cadastro">Crie uma conta</a>.</p>
            </div>
          )}

          <h2>Horários disponíveis</h2>
          <div className="time-grid">
            {slots.map((slot) => {
              const occupied = unavailable.some((appointment) => appointment.time.slice(0, 5) === slot);
              return (
                <button key={slot} disabled={occupied || isSunday} className={`time-slot ${time === slot ? "selected" : ""}`} onClick={() => setTime(slot)}>
                  {slot}{occupied ? " • ocupado" : ""}
                </button>
              );
            })}
          </div>

          <div className="booking-footer">
            <span>{time ? `Selecionado: ${time}` : "Selecione um horário"}</span>
            <button className="btn btn-primary" disabled={!time || isSunday} onClick={confirm}>Confirmar agendamento</button>
          </div>
          {message && <p className="notice error">{message}</p>}
        </section>
      </section>

      {confirmation && (
        <div className="confirmation-overlay" role="dialog" aria-modal="true">
          <div className="confirmation-modal glass">
            <div className="confirmation-icon">✓</div>
            <span className="eyebrow">AGENDAMENTO CONFIRMADO</span>
            <h2>Seu horário está reservado.</h2>
            <p>Obrigado, <strong>{confirmation.name}</strong>. Preparamos seu horário na Barber of Friends.</p>
            <div className="confirmation-details"><span>{confirmation.date}</span><strong>{confirmation.time}</strong><span>{confirmation.service}</span></div>
            <button className="btn btn-primary" onClick={() => setConfirmation(null)}>Fechar</button>
          </div>
        </div>
      )}
    </main>
  );
}
