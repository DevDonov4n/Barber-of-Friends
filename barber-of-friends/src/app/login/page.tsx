"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Não foi possível entrar.");
        return;
      }

      const destination = data.user?.role === "BARBER" || data.user?.role === "ADMIN"
        ? "/painel/barbeiro"
        : "/painel/cliente";

      window.location.assign(destination);
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell auth-shell">
      <section className="auth-page">
        <div className="auth-card glass">
          <a className="back-link" href="/">← Voltar para o início</a>
          <span className="eyebrow">BARBER OF FRIENDS • ACESSO</span>
          <h1>Entre na sua conta.</h1>
          <p>Clientes acompanham seus horários. A administração acessa o painel completo da agenda.</p>
          <form onSubmit={submit}>
            <label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
            <label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
            {error && <p className="error">{error}</p>}
            <button className="btn btn-primary auth-submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          </form>
          <div className="auth-divider"><span>ou</span></div>
          <a className="btn btn-secondary auth-register" href="/cadastro">Criar conta de cliente</a>
          <p className="admin-hint">Acesso administrativo: use <strong>admin@barberoffriends.com</strong> com a senha definida no banco.</p>
        </div>
      </section>
    </main>
  );
}
