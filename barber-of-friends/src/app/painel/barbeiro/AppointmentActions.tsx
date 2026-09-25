"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

type Props = { id: number; status: string };

export default function AppointmentActions({ id, status }: Props) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: string) {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/appointments", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: nextStatus }) });
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Não foi possível atualizar."); return; }
      setCurrentStatus(data.status);
      setCancelOpen(false);
    } catch { setError("Não foi possível conectar ao servidor."); }
    finally { setLoading(false); }
  }

  return <div className="appointment-actions">
    <span className={`status-badge status-${currentStatus.toLowerCase()}`}>{currentStatus === "COMPLETED" ? "✓ COMPLETO" : currentStatus === "CANCELLED" ? "CANCELADO" : currentStatus}</span>
    {currentStatus === "CONFIRMED" && <>
      <button className="action-complete" disabled={loading} onClick={() => updateStatus("COMPLETED")}>✓ Concluir</button>
      <button className="action-cancel" disabled={loading} onClick={() => setCancelOpen(true)}>Cancelar</button>
    </>}
    {error && <small className="action-error">{error}</small>}
    {cancelOpen && typeof document !== "undefined" && createPortal(<div className="confirmation-overlay" role="dialog" aria-modal="true"><div className="confirmation-modal glass"><div className="confirmation-icon confirmation-icon-sad">☹</div><span className="eyebrow">CANCELAR ATENDIMENTO</span><h2>Tem certeza?</h2><p>Esse horário será liberado novamente para outros clientes.</p><div className="confirmation-actions"><button className="btn btn-secondary" onClick={() => setCancelOpen(false)}>Voltar</button><button className="btn btn-primary" onClick={() => updateStatus("CANCELLED")} disabled={loading}>{loading ? "Cancelando..." : "Sim, cancelar"}</button></div></div></div>, document.body)}
  </div>;
}
