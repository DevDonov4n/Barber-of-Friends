"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Appointment = {
  id: number;
  appointmentDate: string;
  startTime: string;
  status: string;
  finalPrice: number;
  service?: { name: string };
};
export default function ClienteAgenda() {
  const router = useRouter();
  const [items, setItems] = useState<Appointment[]>([]);
  const [name, setName] = useState("");
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function load() {
    const s = await fetch("/api/auth/session", { cache: "no-store" });
    if (!s.ok) {
      router.push("/login?next=/cliente/agenda");
      return;
    }
    const sd = await s.json();
    setName(sd.user?.name || "");
    const r = await fetch("/api/client/appointments", { cache: "no-store" });
    const d = await r.json();
    if (r.ok) setItems(d.appointments || d || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  async function cancel() {
    if (!cancelId) return;
    const r = await fetch("/api/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cancelId }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "Não foi possível cancelar.");
      return;
    }
    setCancelId(null);
    setError("");
    load();
  }
  return (
    <main className="site-shell dashboard-shell">
      <section className="page dashboard">
        <div className="dashboard-head">
          <div>
            <a className="back-link" href="/">
              ← Início
            </a>
            <span className="eyebrow">BARBER OF FRIENDS • CLIENTE</span>
            <h1 className="page-title">Olá, {name.trim().split(/\s+/)[0]}.</h1>
            <p className="page-subtitle">Aqui estão seus horários marcados.</p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href="/agendar">
              Novo agendamento
            </a>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-secondary">Sair</button>
            </form>
          </div>
        </div>
        <section className="panel glass">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MINHA AGENDA</span>
              <h2>Horários marcados</h2>
            </div>
          </div>
          <div className="appointment-list">
            {loading ? (
              <p className="page-subtitle">Carregando...</p>
            ) : items.length === 0 ? (
              <p className="page-subtitle">
                Você ainda não possui agendamentos.
              </p>
            ) : (
              items.map((a) => (
                <div className="appointment" key={a.id}>
                  <div>
                    <strong>{a.service?.name || "Corte"}</strong>
                    <span>
                      {a.status} • R${" "}
                      {Number(a.finalPrice).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <time>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                    }).format(new Date(a.appointmentDate))}{" "}
                    às {String(a.startTime).slice(0, 5)}
                  </time>
                  {a.status === "CONFIRMED" && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCancelId(a.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {error && <p className="error">{error}</p>}
        </section>
      </section>
      {cancelId && (
        <div className="confirmation-overlay" role="dialog" aria-modal="true">
          <div className="confirmation-modal glass">
            <div className="sad-icon">☹</div>
            <span className="eyebrow">CANCELAR AGENDAMENTO</span>
            <h2>Tem certeza?</h2>
            <p>
              Uma pena cancelar seu horário. Ele será liberado para outro
              cliente.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setCancelId(null)}
              >
                Voltar
              </button>
              <button className="btn btn-primary" onClick={cancel}>
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
