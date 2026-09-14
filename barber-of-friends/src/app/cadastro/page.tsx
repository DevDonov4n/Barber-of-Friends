"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [favoriteCut, setFavoriteCut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, favoriteCut }),
      });

      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Não foi possível criar a conta.");
        return;
      }

      router.push("/painel/cliente");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell">
      <section className="auth-page">
        <div className="auth-card glass">
          <a className="back-link" href="/">← Início</a>
          <span className="eyebrow">NOVO CLIENTE</span>
          <h1>Crie sua conta.</h1>
          <p>Salve seus dados e deixe seu próximo agendamento ainda mais rápido.</p>

          <form onSubmit={submit}>
            <label>
              Nome
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome completo" required />
            </label>

            <label>
              E-mail
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" required />
            </label>

            <label>
              Corte favorito
              <input value={favoriteCut} onChange={e => setFavoriteCut(e.target.value)} placeholder="Ex.: Taper Fade, Buzz Cut..." maxLength={100} />
              <small>Informe o nome do corte que você costuma fazer.</small>
            </label>

            <label>
              Senha
              <input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" required />
            </label>

            {error && <p className="error">{error}</p>}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <a className="register-link" href="/login">Já tenho uma conta</a>
        </div>
      </section>
    </main>
  );
}
