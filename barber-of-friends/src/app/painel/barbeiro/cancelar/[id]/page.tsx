"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CancelarPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function cancel() {
    setLoading(true);
    const r = await fetch("/api/appointments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(params.id) }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "Não foi possível cancelar.");
      setLoading(false);
      return;
    }
    router.push("/painel/barbeiro");
    router.refresh();
  }
  return (
    <main className="site-shell">
      <section className="confirmation-overlay" role="dialog" aria-modal="true">
        <div className="confirmation-modal glass cancellation-modal">
          <div className="sad-icon">☹</div>
          <span className="eyebrow">CANCELAR AGENDAMENTO</span>
          <h1>Tem certeza?</h1>
          <p>
            Uma pena cancelar este horário. Ele será liberado para outro
            cliente.
          </p>
          {error && <p className="error">{error}</p>}
          <div className="modal-actions">
            <button
              className="btn btn-secondary"
              onClick={() => router.push("/painel/barbeiro")}
            >
              Voltar
            </button>
            <button
              className="btn btn-primary"
              disabled={loading}
              onClick={cancel}
            >
              {loading ? "Cancelando..." : "Sim, cancelar"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
