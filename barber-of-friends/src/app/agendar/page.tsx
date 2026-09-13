"use client";

import { useEffect, useMemo, useState } from "react";

const key = (d: Date) => d.toISOString().slice(0, 10);
const label = (d: Date) => new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(d);
const slots = Array.from({ length: 24 }, (_, i) => { const m = 9 * 60 + i * 30; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; });

export default function AgendarPage() {
  const [days, setDays] = useState<Date[]>([]); const [day, setDay] = useState(""); const [booked, setBooked] = useState<string[]>([]); const [time, setTime] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { const now = new Date(); const list = Array.from({ length: 14 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)); setDays(list); setDay(key(list[0])); fetch("/api/appointments").then(r => r.json()).then(data => setBooked(data.map((a: { date: string }) => a.date))).catch(() => undefined); }, []);
  const unavailable = useMemo(() => booked.filter(v => v.startsWith(day)), [booked, day]);
  async function confirm() { if (!day || !time) return; const date = new Date(`${day}T${time}:00`); const r = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: date.toISOString(), service: "Corte" }) }); const data = await r.json(); if (!r.ok) { setMessage(data.error || "Faça login para agendar."); return; } setMessage("Agendamento confirmado! Te esperamos na cadeira."); setBooked(v => [...v, data.date]); setTime(""); }
  return <main className="site-shell"><section className="page booking-page"><a className="back-link" href="/">← Voltar</a><span className="eyebrow">BARBER OF FRIENDS • AGENDAMENTO</span><h1 className="page-title">Escolha seu horário.</h1><p className="page-subtitle">Atendimentos de 30 em 30 minutos, das 09:00 às 20:30.</p><div className="calendar-row">{days.map(d => <button key={key(d)} className={`day-card ${day === key(d) ? "active" : ""}`} onClick={() => { setDay(key(d)); setTime(""); }}>{label(d)}</button>)}</div><section className="booking-panel glass"><h2>Horários disponíveis</h2><div className="time-grid">{slots.map(t => { const occupied = unavailable.some(v => v.slice(0, 16).replace(" ", "T") === `${day}T${t}`); return <button key={t} disabled={occupied} className={`time-slot ${time === t ? "selected" : ""}`} onClick={() => setTime(t)}>{t}{occupied ? " • ocupado" : ""}</button>; })}</div><div className="booking-footer"><span>{time ? `Selecionado: ${time}` : "Selecione um horário"}</span><button className="btn btn-primary" disabled={!time} onClick={confirm}>Confirmar agendamento</button></div>{message && <p className="notice">{message}</p>}</section></section></main>;
}
